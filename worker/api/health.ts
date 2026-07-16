import type { Env } from '../types';

function json(data: unknown, status = 200): Response {
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
    const result = await env.DB.prepare('SELECT 1 as ok').first();
    const dbOk = result !== null;

    const configured = await env.DB.prepare(
      'SELECT v FROM kvstore WHERE k = ?'
    ).bind('panel.password_hash').first<{ v: string }>();

    const startedAt = await env.DB.prepare(
      'SELECT v FROM kvstore WHERE k = ?'
    ).bind('panel.started_at').first<{ v: string }>();

    let uptime = 'n/a';
    if (startedAt?.v) {
      const ms = Date.now() - Number(startedAt.v);
      if (Number.isFinite(ms) && ms >= 0) {
        const days = Math.floor(ms / 86400000);
        const hours = Math.floor((ms % 86400000) / 3600000);
        uptime = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
      }
    }

    // Aggregate traffic for dashboard
    const traffic = await env.DB.prepare(
      'SELECT COALESCE(SUM(traffic_used), 0) as total FROM users'
    ).first<{ total: number }>();
    const totalUsed = traffic?.total || 0;

    return json({
      status: 'ok',
      service: 'xraymod',
      version: '2.0.0',
      database: dbOk ? 'connected' : 'disconnected',
      d1: dbOk,
      kv: true,
      configured: !!configured?.v,
      uptime,
      timestamp: new Date().toISOString(),
      traffic: {
        total: totalUsed,
        today: { up: 0, down: totalUsed, total: totalUsed },
        month: { up: 0, down: totalUsed, total: totalUsed },
      },
    });
  } catch (e) {
    return json(
      {
        status: 'error',
        service: 'xraymod',
        database: 'error',
        d1: false,
        kv: false,
        configured: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      500
    );
  }
}
