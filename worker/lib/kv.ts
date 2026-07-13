/**
 * KV Helper — D1-backed key-value storage with in-memory cache
 *
 * وقتی KV binding نباشه، از D1 kvstore table استفاده می‌کنه.
 * با cache در حافظه برای کاهش خواندن از D1.
 */

const CACHE_TTL = 60_000; // 60 ثانیه
const cache = new Map<string, { value: string; expires: number }>();

export interface KVStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

/**
 * ایجاد KV store بر اساس binding موجود
 * اگه KV باشه از KV استفاده می‌کنه، وگرنه از D1
 */
export function createKV(env: any): KVStore {
  // اگه KV namespace binding موجود باشه
  if (env.KV?.get) {
    return {
      async get(key) {
        return env.KV.get(key);
      },
      async put(key, value) {
        await env.KV.put(key, value);
      },
      async delete(key) {
        await env.KV.delete(key);
      },
      async list(prefix) {
        const keys = await env.KV.list({ prefix });
        return keys.keys.map((k: any) => k.name);
      },
    };
  }

  // D1-backed KV با cache
  return {
    async get(key: string): Promise<string | null> {
      // بررسی cache
      const cached = cache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.value;
      }

      // خواندن از D1
      const row = await env.DB.prepare('SELECT v FROM kvstore WHERE k = ?')
        .bind(key)
        .first<{ v: string }>();

      const value = row?.v ?? null;

      // ذخیره در cache
      if (value !== null) {
        cache.set(key, { value, expires: Date.now() + CACHE_TTL });
      }

      return value;
    },

    async put(key: string, value: string): Promise<void> {
      // ذخیره در D1
      await env.DB.prepare(
        'INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?, ?, ?)'
      )
        .bind(key, value, Date.now())
        .run();

      // بروزرسانی cache
      cache.set(key, { value, expires: Date.now() + CACHE_TTL });
    },

    async delete(key: string): Promise<void> {
      await env.DB.prepare('DELETE FROM kvstore WHERE k = ?')
        .bind(key)
        .run();

      cache.delete(key);
    },

    async list(prefix?: string): Promise<string[]> {
      let query = 'SELECT k FROM kvstore';
      const params: any[] = [];

      if (prefix) {
        query += ' WHERE k LIKE ?';
        params.push(`${prefix}%`);
      }

      const rows = await env.DB.prepare(query)
        .bind(...params)
        .all<{ k: string }>();

      return rows.results.map((r) => r.k);
    },
  };
}

/**
 * پاک کردن cache (برای تست)
 */
export function clearCache(): void {
  cache.clear();
}
