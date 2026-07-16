/** Access-UUID prefix for stealth panel URLs on Cloudflare Workers. */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

declare global {
  interface Window {
    __API_BASE?: string;
    __PANEL_PREFIX?: string;
  }
}

export function getPanelPrefix(): string {
  if (typeof window === 'undefined') return '';

  if (window.__PANEL_PREFIX) {
    return window.__PANEL_PREFIX.replace(/\/+$/, '') || '';
  }

  const segs = window.location.pathname.split('/').filter(Boolean);
  if (segs[0] && UUID_RE.test(segs[0])) {
    return `/${segs[0]}`;
  }
  return '';
}

/** Build in-panel path that keeps the stealth UUID prefix. */
export function panelPath(path: string): string {
  const prefix = getPanelPrefix();
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${prefix}${clean}`;
}

/** Hard navigation (reliable with static export + path stripping). */
export function goPanel(path: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(panelPath(path));
}

export function getApiBase(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return window.__API_BASE || window.location.origin;
}
