import type { Env } from './types';
import { ensureSchema } from './schema';
import { handleLogin } from './api/login';
import { handleNodes } from './api/nodes';
import { handleUsers } from './api/users';
import { handleProtocols } from './api/protocols';
import { handleConfigs } from './api/configs';
import { handleSettings } from './api/settings';
import { handleSubscription } from './subscription';
import { handleProxyTraffic } from './proxy';

type Handler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  params: Record<string, string>
) => Promise<Response>;

interface Route {
  pattern: URLPattern;
  handler: Handler;
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function notFound(): Response {
  return jsonResponse({ success: false, message: 'Not found' }, 404);
}

function methodNotAllowed(): Response {
  return jsonResponse({ success: false, message: 'Method not allowed' }, 405);
}

const routes: Route[] = [
  // API routes
  {
    pattern: new URLPattern({ pathname: '/api/login' }),
    handler: handleLogin,
  },
  {
    pattern: new URLPattern({ pathname: '/api/nodes' }),
    handler: handleNodes,
  },
  {
    pattern: new URLPattern({ pathname: '/api/nodes/:id' }),
    handler: handleNodes,
  },
  {
    pattern: new URLPattern({ pathname: '/api/users' }),
    handler: handleUsers,
  },
  {
    pattern: new URLPattern({ pathname: '/api/users/:id' }),
    handler: handleUsers,
  },
  {
    pattern: new URLPattern({ pathname: '/api/protocols' }),
    handler: handleProtocols,
  },
  {
    pattern: new URLPattern({ pathname: '/api/configs' }),
    handler: handleConfigs,
  },
  {
    pattern: new URLPattern({ pathname: '/api/configs/:id' }),
    handler: handleConfigs,
  },
  {
    pattern: new URLPattern({ pathname: '/api/settings' }),
    handler: handleSettings,
  },
  // Subscription route
  {
    pattern: new URLPattern({ pathname: '/sub/:token' }),
    handler: handleSubscription,
  },
];

export async function handleRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(request.url);

  // Ensure database schema is initialized
  ctx.waitUntil(ensureSchema(env.DB));

  // Check for WebSocket upgrade (proxy traffic)
  if (request.headers.get('Upgrade') === 'websocket') {
    return handleProxyTraffic(request, env, ctx);
  }

  // Try matching API routes
  for (const route of routes) {
    const match = route.pattern.exec(url);
    if (match) {
      const params: Record<string, string> = {};
      const routeParams = match.pathname.groups;
      for (const [key, value] of Object.entries(routeParams)) {
        if (value) params[key] = value;
      }
      return route.handler(request, env, ctx, params);
    }
  }

  // Serve static assets (React SPA)
  try {
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 200) {
      return assetResponse;
    }
  } catch (e) {
    // Fall through to SPA fallback
  }

  // SPA fallback: serve index.html for non-API, non-file routes
  if (!url.pathname.startsWith('/api/') && !url.pathname.includes('.')) {
    try {
      const indexRequest = new Request(new URL('/index.html', request.url).toString(), request);
      return await env.ASSETS.fetch(indexRequest);
    } catch (e) {
      // Fall through to 404
    }
  }

  return notFound();
}
