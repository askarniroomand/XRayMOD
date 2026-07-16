import { getApiBase } from './paths';

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBase().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Network error',
    } as T;
  }

  let data: any = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = { success: false, message: 'Invalid JSON response' };
    }
  } else {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        success: res.ok,
        message: res.ok ? undefined : text.slice(0, 200) || res.statusText,
        raw: text,
      };
    }
  }

  if (typeof data !== 'object' || data === null) {
    data = { success: res.ok, data };
  }

  if (!res.ok && data.success === undefined) {
    data.success = false;
    data.message = data.message || data.error || res.statusText || `HTTP ${res.status}`;
  }

  data._status = res.status;
  return data as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export function asList<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}
