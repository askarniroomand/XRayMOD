import type { Env, User } from './types';

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const LOGIN_RATE_LIMIT = 5; // max attempts
const LOGIN_RATE_WINDOW = 60000; // 1 minute

// Timing-safe comparison (Nova pattern)
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function checkLoginRateLimit(db: D1Database, ip: string): Promise<boolean> {
  const key = `ratelimit:login:${ip}`;
  const row = await db.prepare('SELECT v, updated FROM kvstore WHERE k = ?').bind(key).first<{ v: string; updated: number }>();
  if (!row) return true;
  const data = JSON.parse(row.v || '{"count":0,"first":0}');
  const now = Date.now();
  if (now - data.first > LOGIN_RATE_WINDOW) {
    await db.prepare('DELETE FROM kvstore WHERE k = ?').bind(key).run();
    return true;
  }
  return data.count < LOGIN_RATE_LIMIT;
}

export async function recordLoginAttempt(db: D1Database, ip: string): Promise<void> {
  const key = `ratelimit:login:${ip}`;
  const row = await db.prepare('SELECT v FROM kvstore WHERE k = ?').bind(key).first<{ v: string }>();
  const now = Date.now();
  let data = { count: 1, first: now };
  if (row) {
    const prev = JSON.parse(row.v || '{"count":0,"first":0}');
    if (now - prev.first > LOGIN_RATE_WINDOW) {
      data = { count: 1, first: now };
    } else {
      data = { count: prev.count + 1, first: prev.first };
    }
  }
  await db.prepare('INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?, ?, ?)').bind(key, JSON.stringify(data), now).run();
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export async function createSession(
  db: D1Database,
  userId: number,
  role: string
): Promise<string> {
  const token = generateSessionToken();
  const sessionData = JSON.stringify({
    userId,
    role,
    created: Date.now(),
  });
  await db
    .prepare('INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?, ?, ?)')
    .bind(`session:${token}`, sessionData, Date.now())
    .run();
  return token;
}

export async function getSession(
  db: D1Database,
  token: string
): Promise<{ userId: number; role: string } | null> {
  const row = await db
    .prepare('SELECT v FROM kvstore WHERE k = ?')
    .bind(`session:${token}`)
    .first<{ v: string }>();
  if (!row) return null;

  try {
    const data = JSON.parse(row.v);
    // Check if session has expired
    if (Date.now() - data.created > SESSION_TTL) {
      await db
        .prepare('DELETE FROM kvstore WHERE k = ?')
        .bind(`session:${token}`)
        .run();
      return null;
    }
    return { userId: data.userId, role: data.role };
  } catch {
    return null;
  }
}

export async function deleteSession(
  db: D1Database,
  token: string
): Promise<void> {
  await db
    .prepare('DELETE FROM kvstore WHERE k = ?')
    .bind(`session:${token}`)
    .run();
}

export function extractSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export function setSessionCookie(token: string, maxAge = SESSION_TTL / 1000): string {
  return `session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}

export async function authenticateRequest(
  request: Request,
  db: D1Database
): Promise<{ userId: number; role: string } | null> {
  const token = extractSessionToken(request);
  if (!token) return null;
  return getSession(db, token);
}

export async function requireAuth(
  request: Request,
  db: D1Database
): Promise<{ userId: number; role: string }> {
  const session = await authenticateRequest(request, db);
  if (!session) {
    throw new Response(
      JSON.stringify({ success: false, message: 'Unauthorized' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  return session;
}

export async function requireAdmin(
  request: Request,
  db: D1Database
): Promise<{ userId: number; role: string }> {
  const session = await requireAuth(request, db);
  if (session.role !== 'admin') {
    throw new Response(
      JSON.stringify({ success: false, message: 'Forbidden' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  return session;
}
