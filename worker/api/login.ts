import type { Env } from '../types';
import { verifyPassword, createSession, setSessionCookie } from '../auth';

function json(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export async function handleLogin(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  _params: Record<string, string>
): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405);
  }

  try {
    const { username, password } = await request.json<{ username: string; password: string }>();

    if (!username || !password) {
      return json({ success: false, message: 'Username and password required' }, 400);
    }

    const user = await env.DB.prepare(
      'SELECT id, username, password_hash, role, email FROM users WHERE username = ?'
    )
      .bind(username)
      .first<{
        id: number;
        username: string;
        password_hash: string;
        role: string;
        email: string;
      }>();

    if (!user) {
      return json({ success: false, message: 'Invalid credentials' }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return json({ success: false, message: 'Invalid credentials' }, 401);
    }

    const sessionToken = await createSession(env.DB, user.id, user.role);

    return json(
      {
        success: true,
        role: user.role,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      200,
      { 'Set-Cookie': setSessionCookie(sessionToken) }
    );
  } catch (e) {
    return json({ success: false, message: 'Invalid request body' }, 400);
  }
}
