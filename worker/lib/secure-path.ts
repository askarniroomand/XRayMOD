/** Resolve SECURE PATH prefix from D1 for absolute public URLs. */
export async function getSecurePrefix(db: D1Database): Promise<string> {
  const row = await db
    .prepare('SELECT v FROM kvstore WHERE k = ?')
    .bind('panel.access_uuid')
    .first<{ v: string }>();
  return row?.v ? `/${row.v}` : '';
}

export async function getSecureBase(db: D1Database, origin: string): Promise<string> {
  const prefix = await getSecurePrefix(db);
  return `${origin.replace(/\/$/, '')}${prefix}`;
}

export async function getCustomDomains(db: D1Database): Promise<string[]> {
  const row = await db
    .prepare('SELECT v FROM kvstore WHERE k = ?')
    .bind('panel.custom_domains')
    .first<{ v: string }>();
  if (!row?.v) return [];
  return row.v
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((d) => d.includes('.') && d.length < 253)
    .slice(0, 20);
}
