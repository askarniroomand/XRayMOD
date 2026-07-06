import type { Env } from '../types';
import { requireAdmin } from '../auth';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleProtocols(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  _params: Record<string, string>
): Promise<Response> {
  try {
    await requireAdmin(request, env.DB);
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ success: false, message: 'Unauthorized' }, 401);
  }

  if (request.method === 'GET') {
    const protocols = await env.DB.prepare('SELECT * FROM protocols').all();

    return json({
      success: true,
      data: protocols.results.map((p: any) => ({
        id: p.id,
        name: p.name,
        schema: JSON.parse(p.schema_json),
        template: p.template_json,
        price: p.price,
        clientLimit: p.client_limit,
        clientPrice: p.client_price,
      })),
    });
  }

  if (request.method === 'POST') {
    const body = await request.json<{
      id: string;
      name: string;
      schema: any;
      template: string;
      price?: number;
      clientLimit?: number;
      clientPrice?: number;
    }>();

    if (!body.id || !body.name) {
      return json({ success: false, message: 'id and name required' }, 400);
    }

    await env.DB.prepare(
      `INSERT OR REPLACE INTO protocols (id, name, schema_json, template_json, price, client_limit, client_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.id,
        body.name,
        typeof body.schema === 'string' ? body.schema : JSON.stringify(body.schema),
        typeof body.template === 'string' ? body.template : JSON.stringify(body.template),
        body.price || 0,
        body.clientLimit || 1,
        body.clientPrice || 0
      )
      .run();

    return json({ success: true }, 201);
  }

  return json({ success: false, message: 'Method not allowed' }, 405);
}
