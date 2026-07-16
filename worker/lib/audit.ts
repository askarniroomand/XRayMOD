/** Ring-buffer audit log in kvstore (free, no extra bindings). */

export type AuditEntry = {
  t: number;
  action: string;
  detail?: string;
  ip?: string;
  actor?: string;
};

const KEY = 'audit.log';
const MAX = 200;

export async function appendAudit(
  db: D1Database,
  action: string,
  detail = '',
  ip = '',
  actor = 'admin'
): Promise<void> {
  try {
    const row = await db.prepare('SELECT v FROM kvstore WHERE k = ?').bind(KEY).first<{ v: string }>();
    let list: AuditEntry[] = [];
    if (row?.v) {
      try {
        list = JSON.parse(row.v);
        if (!Array.isArray(list)) list = [];
      } catch {
        list = [];
      }
    }
    list.unshift({
      t: Date.now(),
      action,
      detail: String(detail).slice(0, 500),
      ip: String(ip).slice(0, 64),
      actor: String(actor).slice(0, 64),
    });
    if (list.length > MAX) list = list.slice(0, MAX);
    await db
      .prepare('INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?, ?, ?)')
      .bind(KEY, JSON.stringify(list), Date.now())
      .run();
  } catch {
    /* never break request path for logging */
  }
}

export async function getAuditLog(db: D1Database, limit = 50): Promise<AuditEntry[]> {
  try {
    const row = await db.prepare('SELECT v FROM kvstore WHERE k = ?').bind(KEY).first<{ v: string }>();
    if (!row?.v) return [];
    const list = JSON.parse(row.v);
    if (!Array.isArray(list)) return [];
    return list.slice(0, Math.min(limit, MAX));
  } catch {
    return [];
  }
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}
