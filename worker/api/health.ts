import type { Env } from '../types';
import { requireAdmin } from '../auth';
import { APP_VERSION } from './admin';
import { silent404 } from '../disguise';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Public (behind SECURE PATH): minimal ok — no brand, no traffic stats.
 * Authenticated admin: full dashboard payload.
 */
export async function handleHealth(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  _params: Record<string, string>
): Promise<Response> {
  try {
    let isAdmin = false;
    try {
      await requireAdmin(request, env.DB);
      isAdmin = true;
    } catch {
      isAdmin = false;
    }

    if (!isAdmin) {
      // Silent heartbeat only — scanners get nothing useful
      return json({ ok: true });
    }

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

    const traffic = await env.DB.prepare(
      'SELECT COALESCE(SUM(traffic_used), 0) as total FROM users'
    ).first<{ total: number }>();
    const totalUsed = traffic?.total || 0;

    return json({
      status: 'ok',
      version: APP_VERSION,
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
  } catch {
    return silent404();
  }
}
