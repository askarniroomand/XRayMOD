import type { Env } from '../types';
import { extractSessionToken, deleteSession, clearSessionCookie } from '../auth';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleLogout(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  _params: Record<string, string>
): Promise<Response> {
  const token = extractSessionToken(request);
  if (token) {
    await deleteSession(env.DB, token);
  }

  return json(
    { success: true, message: 'Logged out' },
    200,
    { 'Set-Cookie': clearSessionCookie() }
  );
}
