/**
 * Router — flat pipeline: schema → proxy guards → disguise → UUID → routes → SPA/fallback.
 */
import type { Env } from './types';
import { ensureSchema } from './schema';
import { handleInstall } from './install';
import { handleLogin } from './api/login';
import { handleLogout } from './api/logout';
import { handleHealth } from './api/health';
import { handleNodes } from './api/nodes';
import { handleUsers } from './api/users';
import { handleProtocols } from './api/protocols';
import { handleConfigs } from './api/configs';
import { handleSettings } from './api/settings';
import { handleCleanIP } from './api/cleanip';
import { handleBackends } from './api/backends';
import { handleWizard } from './api/wizard';
import { handleSubscription } from './subscription';
import { handleProxyTraffic } from './proxy';
import { getDisguiseConfig, getDecoyResponse, remapDisguisePath } from './disguise';
import { isGrpcRequest } from './proxy/grpc';
import { isXHTTPRequest } from './proxy/xhttp';
import { handleTelegramWebhook, handleTelegramLogin } from './telegram';
import { serveStatic, serveRemotePages } from './static';
import { renderLoginPage } from './panel-login';

type Handler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  params: Record<string, string>
) => Promise<Response>;

type Route = {
  pattern: RegExp;
  handler: Handler;
  /** Named capture groups in order of regex groups (m[1], m[2], …) */
  params?: string[];
};

const FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XrayMOD</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa;display:grid;place-items:center;min-height:100vh}
.box{text-align:center;padding:2rem;max-width:440px}.icon{width:48px;height:48px;background:#10b981;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.5rem;color:#000;margin:0 auto 1.5rem}
h1{font-size:1.5rem;margin-bottom:.5rem}p{color:#a1a1aa;font-size:.875rem;line-height:1.6}
.links{margin-top:1.5rem;display:flex;flex-direction:column;gap:.5rem}.links a{color:#10b981;text-decoration:none;font-size:.875rem}</style></head>
<body><div class="box"><div class="icon">X</div><h1>XrayMOD</h1><p>Panel deployed. Visit <a href="/install">/install</a> to set up.</p>
<div class="links"><a href="/install">Setup</a><a href="/api/health">API Health</a></div></div></body></html>`;

const routes: Route[] = [
  { pattern: /^\/install(?:\/|$)/, handler: handleInstall },
  { pattern: /^\/api\/login$/, handler: handleLogin },
  { pattern: /^\/api\/logout$/, handler: handleLogout },
  { pattern: /^\/api\/health$/, handler: handleHealth },
  { pattern: /^\/api\/nodes(?:\/([^/]+))?$/, handler: handleNodes, params: ['id'] },
  { pattern: /^\/api\/users(?:\/([^/]+))?$/, handler: handleUsers, params: ['id'] },
  { pattern: /^\/api\/protocols$/, handler: handleProtocols },
  { pattern: /^\/api\/configs(?:\/([^/]+))?$/, handler: handleConfigs, params: ['id'] },
  { pattern: /^\/api\/settings$/, handler: handleSettings },
  { pattern: /^\/api\/cleanip(?:\/([^/]+))?$/, handler: handleCleanIP, params: ['action'] },
  { pattern: /^\/api\/backends(?:\/([^/]+))?$/, handler: handleBackends, params: ['id'] },
  { pattern: /^\/api\/wizard(?:\/([^/]+))?$/, handler: handleWizard, params: ['action'] },
  { pattern: /^\/sub\/([^/]+)$/, handler: handleSubscription, params: ['token'] },
  { pattern: /^\/bot$/, handler: handleTelegramWebhook },
  { pattern: /^\/admin$/, handler: handleTelegramLogin },
];

function matchRoute(pathname: string): { handler: Handler; params: Record<string, string> } | null {
  for (const route of routes) {
    const m = pathname.match(route.pattern);
    if (!m) continue;
    const params: Record<string, string> = {};
    const names = route.params || [];
    for (let i = 0; i < names.length; i++) {
      const val = m[i + 1];
      if (val !== undefined && val !== '') {
        params[names[i]] = val.replace(/^\//, '');
      }
    }
    return { handler: route.handler, params };
  }
  return null;
}

async function checkProxyGuards(env: Env): Promise<Response | null> {
  const pausedRow = await env.DB.prepare(
    'SELECT v FROM kvstore WHERE k = ?'
  ).bind('panel.paused').first<{ v: string }>();
  if (pausedRow?.v === 'true') {
    return new Response('Service paused', { status: 503 });
  }

  const capRow = await env.DB.prepare(
    'SELECT v FROM kvstore WHERE k = ?'
  ).bind('panel.monthly_cap_gb').first<{ v: string }>();
  const capGB = Number(capRow?.v || 0);
  if (capGB > 0) {
    const trafficRow = await env.DB.prepare(
      'SELECT SUM(traffic_used) as total FROM users'
    ).first<{ total: number }>();
    const usedBytes = trafficRow?.total || 0;
    if (usedBytes >= capGB * 1073741824) {
      return new Response('Monthly data cap reached', { status: 503 });
    }
  }
  return null;
}

export async function handleRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    await ensureSchema(env.DB);

    const url = new URL(request.url);
    let pathname = url.pathname;
    let panelPrefix = '';
    const isUpgrade = request.headers.get('Upgrade') === 'websocket';
    const isGrpc = request.method === 'POST' && isGrpcRequest(request);
    const isXhttp = request.method === 'POST' && isXHTTPRequest(request);

    // WebSocket / gRPC / XHTTP → proxy (kill switch + monthly cap first)
    if (isUpgrade || isGrpc || isXhttp) {
      const blocked = await checkProxyGuards(env);
      if (blocked) return blocked;
      return handleProxyTraffic(request, env, ctx);
    }

    // Static UI assets must bypass UUID gate — otherwise /_next/* returns 403/1101
    // and React never hydrates (login button becomes a dead native form submit).
    const isStaticAsset =
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      /\.(js|css|map|woff2?|ttf|eot|png|jpg|jpeg|gif|svg|ico|webp|txt)$/i.test(pathname);

    const bypass =
      pathname.startsWith('/install') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/sub/') ||
      pathname.startsWith('/bot') ||
      isStaticAsset;

    // Serve static assets immediately from ASSETS (no UUID, no DB disguise)
    if (isStaticAsset && env.ASSETS) {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status === 200) {
          const headers = new Headers(assetRes.headers);
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          return new Response(assetRes.body, { status: 200, headers });
        }
      } catch (e) {
        console.error('ASSETS fetch failed', e);
      }
      return new Response('Not found', { status: 404 });
    }

    const accessUuid = await env.DB.prepare(
      'SELECT v FROM kvstore WHERE k = ?'
    ).bind('panel.access_uuid').first<{ v: string }>();

    if (accessUuid?.v && !bypass) {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length === 0 || segments[0] !== accessUuid.v) {
        const pw = await env.DB.prepare(
          'SELECT v FROM kvstore WHERE k = ?'
        ).bind('panel.password_hash').first<{ v: string }>();
        if (!pw?.v) {
          return new Response(null, { status: 302, headers: { Location: '/install' } });
        }
        const disguise = await getDisguiseConfig(env, env.DB);
        return getDecoyResponse(url.host, disguise.fallbackPage);
      }
      panelPrefix = `/${accessUuid.v}`;
      pathname = '/' + segments.slice(1).join('/');
      if (pathname === '/') pathname = '/';
      url.pathname = pathname;
    }

    if (!accessUuid?.v && !bypass) {
      const pw = await env.DB.prepare(
        'SELECT v FROM kvstore WHERE k = ?'
      ).bind('panel.password_hash').first<{ v: string }>();
      if (!pw?.v) {
        return new Response(null, { status: 302, headers: { Location: '/install' } });
      }
    }

    // Secret-path remapping + decoy for leaked /admin|/login
    if (!bypass) {
      const disguise = await getDisguiseConfig(env, env.DB);
      const remapped = remapDisguisePath(pathname, disguise);
      if (remapped.isDecoy) {
        return getDecoyResponse(url.host, disguise.fallbackPage);
      }
      pathname = remapped.remapped;
      url.pathname = pathname;
    }

    const route = matchRoute(pathname);
    if (route) {
      return route.handler(request, env, ctx, route.params);
    }

    // / or /UUID/ → login
    const isRoot = pathname === '/' || pathname === '';
    if (isRoot) {
      const loc = panelPrefix ? `${panelPrefix}/login` : '/login';
      return new Response(null, {
        status: 302,
        headers: { Location: loc },
      });
    }

    // Dedicated login UI (no React) — always works
    if (pathname === '/login' || pathname === '/login/') {
      return renderLoginPage(url.origin, panelPrefix);
    }

    const fromAssets = await serveStatic(request, env, pathname, url.origin, panelPrefix);
    if (fromAssets) return fromAssets;

    if (env.PAGES_URL) {
      const remote = await serveRemotePages(pathname, env.PAGES_URL, url.origin, panelPrefix);
      if (remote) return remote;
    }

    if (!isRoot) {
      const disguise = await getDisguiseConfig(env, env.DB);
      if (disguise.on) {
        return getDecoyResponse(url.host, disguise.fallbackPage);
      }
    }

    return new Response(FALLBACK_HTML, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    console.error('Router error:', e);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
