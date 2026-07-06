import type { Env } from '../types';
import { requireAdmin } from '../auth';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleConfigs(
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
    const configs = await env.DB.prepare(
      `SELECT c.*, u.username FROM configs c
       LEFT JOIN users u ON c.user_id = u.id`
    ).all();

    return json({
      success: true,
      data: configs.results.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        username: c.username,
        protocolId: c.protocol_id,
        name: c.name,
        settings: JSON.parse(c.settings_json || '{}'),
        port: c.port,
        path: c.path,
        link: c.link,
        nodeIp: c.node_ip,
        clientLimit: c.client_limit,
        createdAt: c.created_at,
      })),
    });
  }

  if (request.method === 'POST') {
    const body = await request.json<{
      userId: number;
      protocolId: string;
      name: string;
      settings: Record<string, any>;
      clientLimit?: number;
    }>();

    if (!body.userId || !body.protocolId) {
      return json({ success: false, message: 'userId and protocolId required' }, 400);
    }

    // Get the protocol template
    const protocol = await env.DB.prepare('SELECT * FROM protocols WHERE id = ?')
      .bind(body.protocolId)
      .first<any>();

    if (!protocol) {
      return json({ success: false, message: 'Protocol not found' }, 404);
    }

    // Get user UUID
    const user = await env.DB.prepare('SELECT uuid FROM users WHERE id = ?')
      .bind(body.userId)
      .first<{ uuid: string }>();

    if (!user) {
      return json({ success: false, message: 'User not found' }, 404);
    }

    // Generate config path
    const configPath = `/proxy/${crypto.randomUUID().slice(0, 8)}`;
    const port = body.settings.port || 443;

    // Generate link from template
    let template = protocol.template_json;
    const templateData = { ...body.settings, uuid: user.uuid };
    for (const [key, value] of Object.entries(templateData)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      template = template.replace(regex, String(value));
    }

    const link = `${body.protocolId}://${btoa(template)}@server.com:${port}?#${body.name || 'Config'}`;

    const result = await env.DB.prepare(
      `INSERT INTO configs (user_id, protocol_id, name, settings_json, port, path, link, node_ip, client_limit, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.userId,
        body.protocolId,
        body.name || 'Config',
        JSON.stringify(body.settings),
        port,
        configPath,
        link,
        body.settings.host || '',
        body.clientLimit || 1,
        Date.now()
      )
      .run();

    return json(
      {
        success: true,
        data: {
          id: result.meta.last_row_id,
          name: body.name,
          protocolId: body.protocolId,
          link,
          path: configPath,
        },
      },
      201
    );
  }

  if ((request.method === 'DELETE') && params.id) {
    await env.DB.prepare('DELETE FROM configs WHERE id = ?')
      .bind(Number(params.id))
      .run();
    return json({ success: true });
  }

  return json({ success: false, message: 'Method not allowed' }, 405);
}
