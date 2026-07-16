import type { Env } from '../types';
import { requireAdmin } from '../auth';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleNodes(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  try {
    await requireAdmin(request, env.DB);
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ success: false, message: 'Unauthorized' }, 401);
  }

  if (request.method === 'GET') {
    const nodes = await env.DB.prepare('SELECT * FROM kvstore WHERE k LIKE ?')
      .bind('node:%')
      .all<{ k: string; v: string }>();

    const parsed = nodes.results.map((n) => {
      const data = JSON.parse(n.v);
      return { id: n.k.replace('node:', ''), ...data };
    });

    return json({ success: true, data: parsed });
  }

  if (request.method === 'POST') {
    const body = await request.json<{ name: string; ip: string }>();
    const id = String(Date.now());
    const nodeData = {
      name: body.name || 'New Server',
      ip: body.ip || '0.0.0.0',
      status: 'online',
      cpu: 0,
      ram: 0,
      users: 0,
      uptime: '0m',
    };

    await env.DB.prepare('INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?, ?, ?)')
      .bind(`node:${id}`, JSON.stringify(nodeData), Date.now())
      .run();

    return json({ success: true, data: { id, ...nodeData } }, 201);
  }

  if (request.method === 'DELETE' && params.id) {
    await env.DB.prepare('DELETE FROM kvstore WHERE k = ?')
      .bind(`node:${params.id}`)
      .run();
    return json({ success: true });
  }

  return json({ success: false, message: 'Method not allowed' }, 405);
}
