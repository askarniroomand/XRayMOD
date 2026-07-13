/**
 * Router — flat, no processor system, just if/else like Nova.
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
import { getDisguiseConfig, getDecoyResponse } from './disguise';
import { isGrpcRequest } from './proxy/grpc';
import { isXHTTPRequest } from './proxy/xhttp';
import { handleTelegramWebhook, handleTelegramLogin } from './telegram';

type Handler = (
  request: Request, env: Env, ctx: ExecutionContext,
  params: Record<string, string>
) => Promise<Response>;

const FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XrayMOD</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa;display:grid;place-items:center;min-height:100vh}
.box{text-align:center;padding:2rem;max-width:440px}.icon{width:48px;height:48px;background:#10b981;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.5rem;color:#000;margin:0 auto 1.5rem}
h1{font-size:1.5rem;margin-bottom:.5rem}p{color:#a1a1aa;font-size:.875rem;line-height:1.6}
.links{margin-top:1.5rem;display:flex;flex-direction:column;gap:.5rem}.links a{color:#10b981;text-decoration:none;font-size:.875rem}</style></head>
<body><div class="box"><div class="icon">X</div><h1>XrayMOD</h1><p>Panel deployed. Visit <a href="/install">/install</a> to set up.</p>
<div class="links"><a href="/install">Setup</a><a href="/api/health">API Health</a></div></div></body></html>`;

const routes: [RegExp, Handler][] = [
  [/^\/install(?:\/|$)/, handleInstall],
  [/^\/api\/login$/, handleLogin],
  [/^\/api\/logout$/, handleLogout],
  [/^\/api\/health$/, handleHealth],
  [/^\/api\/nodes(\/.*)?$/, handleNodes],
  [/^\/api\/users(\/.*)?$/, handleUsers],
  [/^\/api\/protocols$/, handleProtocols],
  [/^\/api\/configs(\/.*)?$/, handleConfigs],
  [/^\/api\/settings$/, handleSettings],
  [/^\/api\/cleanip(\/.*)?$/, handleCleanIP],
  [/^\/api\/backends(\/.*)?$/, handleBackends],
  [/^\/api\/wizard(\/.*)?$/, handleWizard],
  [/^\/sub\/([^/]+)$/, handleSubscription],
  [/^\/bot$/, handleTelegramWebhook],
  [/^\/admin$/, handleTelegramLogin],
];

function matchRoute(pathname: string): { handler: Handler; params: Record<string, string> } | null {
  for (const [pattern, handler] of routes) {
    const m = pathname.match(pattern);
    if (m) {
      const params: Record<string, string> = {};
      if (m[1]) params.token = m[1];
      if (m[2]) params.id = m[2].replace(/^\//, '');
      return { handler, params };
    }
  }
  return null;
}

export async function handleRequest(
  request: Request, env: Env, ctx: ExecutionContext
): Promise<Response> {
  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }});
    }

    await ensureSchema(env.DB);

    const url = new URL(request.url);
    let pathname = url.pathname;
    const isUpgrade = request.headers.get('Upgrade') === 'websocket';
    const isGrpc = request.method === 'POST' && isGrpcRequest(request);
    const isXhttp = request.method === 'POST' && isXHTTPRequest(request);

    // WebSocket / gRPC / XHTTP → proxy directly, no UUID check
    if (isUpgrade || isGrpc || isXhttp) {
      return handleProxyTraffic(request, env, ctx);
    }

    // Paths that bypass UUID
    const bypass = pathname.startsWith('/install') ||
                   pathname.startsWith('/api/') ||
                   pathname.startsWith('/sub/') ||
                   pathname.startsWith('/bot');

    // UUID gate
    const accessUuid = await env.DB.prepare(
      'SELECT v FROM kvstore WHERE k = ?'
    ).bind('panel.access_uuid').first<{ v: string }>();

    if (accessUuid?.v && !bypass) {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length === 0 || segments[0] !== accessUuid.v) {
        // Not configured → redirect to /install
        const pw = await env.DB.prepare(
          'SELECT v FROM kvstore WHERE k = ?'
        ).bind('panel.password_hash').first<{ v: string }>();
        if (!pw?.v) {
          return new Response(null, { status: 302, headers: { Location: '/install' } });
        }
        // Disguise
        const disguise = await getDisguiseConfig(env, env.DB);
        return getDecoyResponse(url.host, disguise.fallbackPage);
      }
      // Strip UUID from path
      pathname = '/' + segments.slice(1).join('/');
      url.pathname = pathname || '/';
    }

    // Not configured, no UUID set yet → redirect to /install
    if (!accessUuid?.v && !bypass) {
      const pw = await env.DB.prepare(
        'SELECT v FROM kvstore WHERE k = ?'
      ).bind('panel.password_hash').first<{ v: string }>();
      if (!pw?.v) {
        return new Response(null, { status: 302, headers: { Location: '/install' } });
      }
    }

    // Match route
    const route = matchRoute(pathname);
    if (route) {
      return route.handler(request, env, ctx, route.params);
    }

    // Static SPA: fetch from PAGES_URL
    const pagesUrl = (env as any).PAGES_URL as string | undefined;
    if (pagesUrl && pathname !== '/') {
      try {
        const remote = await fetch(pagesUrl.replace(/\/$/, '') + pathname);
        if (remote.status === 200) {
          const ct = remote.headers.get('content-type') || '';
          const body = await remote.text();
          if (ct.includes('text/html') || pathname.endsWith('.html')) {
            const apiScript = `<script>window.__API_BASE="${url.origin}";</script>`;
            return new Response(body.replace('<head>', `<head>${apiScript}`), {
              status: 200, headers: { 'Content-Type': 'text/html' },
            });
          }
          return new Response(body, { status: 200, headers: { 'Content-Type': ct } });
        }
      } catch {}
      // SPA fallback
      try {
        const spa = await fetch(pagesUrl.replace(/\/$/, '') + '/index.html');
        if (spa.status === 200) {
          const html = await spa.text();
          const apiScript = `<script>window.__API_BASE="${url.origin}";</script>`;
          return new Response(html.replace('<head>', `<head>${apiScript}`), {
            status: 200, headers: { 'Content-Type': 'text/html' },
          });
        }
      } catch {}
    }

    // Serve root SPA
    if (pathname === '/' || pathname === '') {
      const disguise = await getDisguiseConfig(env, env.DB);
      if (disguise.on) {
        return getDecoyResponse(url.host, disguise.fallbackPage);
      }
      if (pagesUrl) {
        try {
          const spa = await fetch(pagesUrl.replace(/\/$/, '') + '/index.html');
          if (spa.status === 200) {
            const html = await spa.text();
            const apiScript = `<script>window.__API_BASE="${url.origin}";</script>`;
            return new Response(html.replace('<head>', `<head>${apiScript}`), {
              status: 200, headers: { 'Content-Type': 'text/html' },
            });
          }
        } catch {}
      }
      return new Response(FALLBACK_HTML, {
        status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Disguise fallback for unknown paths
    const disguise = await getDisguiseConfig(env, env.DB);
    if (disguise.on) {
      return getDecoyResponse(url.host, disguise.fallbackPage);
    }

    return new Response(FALLBACK_HTML, {
      status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    return new Response(`Error: ${e instanceof Error ? e.message : 'Unknown'}`, {
      status: 500, headers: { 'Content-Type': 'text/plain' },
    });
  }
}
