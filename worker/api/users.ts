import type { Env, User } from '../types';
import { requireAdmin, hashPassword } from '../auth';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleUsers(
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
    const users = await env.DB.prepare(
      'SELECT id, username, role, uuid, email, traffic_limit, traffic_used, expiry_date, status, created_at FROM users'
    )
      .all<User>();

    return json({
      success: true,
      data: users.results.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        used: Math.round((u.traffic_used / (1024 * 1024 * 1024)) * 10) / 10,
        limit: Math.round((u.traffic_limit / (1024 * 1024 * 1024)) * 10) / 10,
        status: u.status,
        expiry: u.expiry_date,
        role: u.role,
      })),
    });
  }

  if (request.method === 'POST') {
    const body = await request.json<{
      username: string;
      email?: string;
      limit?: number;
      expiryDays?: number;
    }>();

    if (!body.username) {
      return json({ success: false, message: 'Username required' }, 400);
    }

    // Generate random password
    const password = crypto.randomUUID().slice(0, 12);
    const passwordHash = await hashPassword(password);
    const uuid = crypto.randomUUID();
    const limitBytes = (body.limit || 100) * 1024 * 1024 * 1024;
    const expiryDate = new Date(
      Date.now() + (body.expiryDays || 30) * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0];

    const result = await env.DB.prepare(
      `INSERT INTO users (username, password_hash, role, uuid, email, traffic_limit, expiry_date, status, created_at)
       VALUES (?, ?, 'user', ?, ?, ?, ?, 'active', ?)`
    )
      .bind(
        body.username,
        passwordHash,
        uuid,
        body.email || '',
        limitBytes,
        expiryDate,
        Date.now()
      )
      .run();

    return json(
      {
        success: true,
        data: {
          id: result.meta.last_row_id,
          username: body.username,
          password,
          uuid,
        },
      },
      201
    );
  }

  if ((request.method === 'PUT' || request.method === 'PATCH') && params.id) {
    const body = await request.json<{
      limit?: number;
      expiry?: string;
      status?: string;
      used?: number;
    }>();

    const userId = Number(params.id);
    const updates: string[] = [];
    const values: any[] = [];

    if (body.limit !== undefined) {
      updates.push('traffic_limit = ?');
      values.push(body.limit * 1024 * 1024 * 1024);
    }
    if (body.expiry !== undefined) {
      updates.push('expiry_date = ?');
      values.push(body.expiry);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.used !== undefined) {
      updates.push('traffic_used = ?');
      values.push(body.used * 1024 * 1024 * 1024);
    }

    if (updates.length === 0) {
      return json({ success: false, message: 'No updates provided' }, 400);
    }

    values.push(userId);
    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return json({ success: true });
  }

  return json({ success: false, message: 'Method not allowed' }, 405);
}
