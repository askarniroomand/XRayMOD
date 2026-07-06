import type { Env } from '../types';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleHealth(
  _request: Request,
  env: Env,
  _ctx: ExecutionContext,
  _params: Record<string, string>
): Promise<Response> {
  try {
    // Check database connectivity
    const result = await env.DB.prepare('SELECT 1 as ok').first();
    const dbOk = result !== null;

    return json({
      status: 'ok',
      service: 'xraymod',
      database: dbOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return json({
      status: 'error',
      service: 'xraymod',
      database: 'error',
      error: e instanceof Error ? e.message : 'Unknown error',
    }, 500);
  }
}
