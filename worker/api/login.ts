import type { Env } from '../types';
import {
  verifyPassword,
  createSession,
  setSessionCookie,
  checkLoginRateLimit,
  recordLoginAttempt,
  create2faChallenge,
  consume2faChallenge,
  verifyTotp,
} from '../auth';

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
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

  const clientIP =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown';
  const allowed = await checkLoginRateLimit(env.DB, clientIP);
  if (!allowed) {
    return json({ success: false, message: 'Too many attempts, try again later' }, 429);
  }

  try {
    const body = await request.json<{
      username?: string;
      password?: string;
      totp?: string;
      challenge?: string;
    }>();

    // Complete 2FA challenge
    if (body.challenge && body.totp) {
      const challenge = await consume2faChallenge(env.DB, body.challenge);
      if (!challenge) {
        await recordLoginAttempt(env.DB, clientIP);
        return json({ success: false, message: 'Invalid or expired 2FA challenge' }, 401);
      }

      const secretRow = await env.DB.prepare(
        'SELECT v FROM kvstore WHERE k = ?'
      ).bind('panel.2fa_secret').first<{ v: string }>();

      if (!secretRow?.v || !(await verifyTotp(secretRow.v, body.totp))) {
        await recordLoginAttempt(env.DB, clientIP);
        return json({ success: false, message: 'Invalid 2FA code' }, 401);
      }

      const sessionToken = await createSession(env.DB, challenge.userId, challenge.role);
      const user = await env.DB.prepare(
        'SELECT id, username, email FROM users WHERE id = ?'
      ).bind(challenge.userId).first<{ id: number; username: string; email: string }>();

      return json(
        {
          success: true,
          role: challenge.role,
          user: user
            ? { id: user.id, username: user.username, email: user.email }
            : { id: challenge.userId, username: '', email: '' },
        },
        200,
        { 'Set-Cookie': setSessionCookie(sessionToken, request) }
      );
    }

    const { username, password } = body;
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
      await recordLoginAttempt(env.DB, clientIP);
      return json({ success: false, message: 'Invalid credentials' }, 401);
    }

    let valid = await verifyPassword(password, user.password_hash);

    // Fallback: panel.password_hash (install path)
    if (!valid && user.role === 'admin') {
      const panelHash = await env.DB.prepare(
        'SELECT v FROM kvstore WHERE k = ?'
      ).bind('panel.password_hash').first<{ v: string }>();
      if (panelHash?.v) {
        valid = await verifyPassword(password, panelHash.v);
        // Upgrade admin hash if panel hash matched but user hash is stale
        if (valid && panelHash.v !== user.password_hash) {
          // re-hash with new scheme if needed happens on next password change
        }
      }
    }

    if (!valid) {
      await recordLoginAttempt(env.DB, clientIP);
      return json({ success: false, message: 'Invalid credentials' }, 401);
    }

    // Transparent upgrade: legacy SHA-256 → PBKDF2 on successful login
    if (!user.password_hash.startsWith('pbkdf2$')) {
      const { hashPassword } = await import('../auth');
      const upgraded = await hashPassword(password);
      await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        .bind(upgraded, user.id)
        .run();
      if (user.role === 'admin') {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?, ?, ?)'
        )
          .bind('panel.password_hash', upgraded, Date.now())
          .run();
      }
    }

    // 2FA gate for admin
    const twoFA = await env.DB.prepare(
      'SELECT v FROM kvstore WHERE k = ?'
    ).bind('panel.2fa_enabled').first<{ v: string }>();

    if (twoFA?.v === 'true' && user.role === 'admin') {
      if (body.totp) {
        const secretRow = await env.DB.prepare(
          'SELECT v FROM kvstore WHERE k = ?'
        ).bind('panel.2fa_secret').first<{ v: string }>();
        if (!secretRow?.v || !(await verifyTotp(secretRow.v, body.totp))) {
          await recordLoginAttempt(env.DB, clientIP);
          return json({ success: false, message: 'Invalid 2FA code' }, 401);
        }
      } else {
        const challenge = await create2faChallenge(env.DB, user.id, user.role);
        return json({
          success: false,
          require2fa: true,
          challenge,
          message: '2FA code required',
        }, 200);
      }
    }

    const sessionToken = await createSession(env.DB, user.id, user.role);

    const firstLoginRow = await env.DB.prepare(
      'SELECT v FROM kvstore WHERE k = ?'
    ).bind('panel.first_login_done').first<{ v: string }>();
    const isFirstLogin = !firstLoginRow?.v || firstLoginRow.v !== 'true';

    let initialConfig: Record<string, unknown> | null = null;
    if (isFirstLogin && user.role === 'admin') {
      const url = new URL(request.url);
      const accessUUID = await env.DB.prepare(
        'SELECT v FROM kvstore WHERE k = ?'
      ).bind('panel.access_uuid').first<{ v: string }>();
      const adminUser = await env.DB.prepare(
        'SELECT uuid FROM users WHERE role = ?'
      ).bind('admin').first<{ uuid: string }>();

      initialConfig = {
        panelUrl: `${url.protocol}//${url.host}/${accessUUID?.v || ''}`,
        subscriptionUrl: `${url.protocol}//${url.host}/sub/${adminUser?.uuid || ''}`,
        adminUuid: adminUser?.uuid || '',
        accessUuid: accessUUID?.v || '',
        instructions: [
          'Save your Panel URL — this is the only way to access your panel',
          'Share the Subscription URL with clients to connect',
          'Install a client app (V2RayNG, sing-box, Clash) and import the subscription',
          'Go to Settings to configure protocols, ECH, clean IPs, and Telegram bot',
        ],
      };

      await env.DB.prepare(
        'INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?, ?, ?)'
      )
        .bind('panel.first_login_done', 'true', Date.now())
        .run();
    }

    return json(
      {
        success: true,
        role: user.role,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        ...(initialConfig ? { initialConfig } : {}),
      },
      200,
      { 'Set-Cookie': setSessionCookie(sessionToken, request) }
    );
  } catch {
    return json({ success: false, message: 'Invalid request body' }, 400);
  }
}
