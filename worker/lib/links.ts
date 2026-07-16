/**
 * Share-link builders for Cloudflare Workers edge proxy.
 * Best-practice for CF free/paid Workers: VLESS + WebSocket + TLS (443).
 */

export type LinkOpts = {
  uuid: string;
  host: string;
  port?: number;
  path: string;
  name: string;
  sni?: string;
  fingerprint?: string;
  alpn?: string;
  /** optional extra query params */
  extra?: Record<string, string>;
};

function qs(params: Record<string, string | undefined>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '') continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  }
  return parts.join('&');
}

/** Recommended default for CF Workers — works with v2rayNG, Streisand, Hiddify, NekoBox */
export function buildVlessWsLink(o: LinkOpts): string {
  const port = o.port ?? 443;
  const sni = o.sni || o.host;
  const path = o.path.startsWith('/') ? o.path : `/${o.path}`;
  const query = qs({
    encryption: 'none',
    security: 'tls',
    type: 'ws',
    host: o.host,
    path,
    sni,
    fp: o.fingerprint || 'chrome',
    alpn: o.alpn || 'http/1.1',
    ...o.extra,
  });
  return `vless://${o.uuid}@${o.host}:${port}?${query}#${encodeURIComponent(o.name)}`;
}

export function buildTrojanWsLink(o: LinkOpts & { password: string }): string {
  const port = o.port ?? 443;
  const sni = o.sni || o.host;
  const path = o.path.startsWith('/') ? o.path : `/${o.path}`;
  const query = qs({
    security: 'tls',
    type: 'ws',
    host: o.host,
    path,
    sni,
    fp: o.fingerprint || 'chrome',
    ...o.extra,
  });
  return `trojan://${encodeURIComponent(o.password)}@${o.host}:${port}?${query}#${encodeURIComponent(o.name)}`;
}

export function buildVmessWsLink(o: LinkOpts): string {
  const port = o.port ?? 443;
  const path = o.path.startsWith('/') ? o.path : `/${o.path}`;
  const obj = {
    v: '2',
    ps: o.name,
    add: o.host,
    port,
    id: o.uuid,
    aid: 0,
    scy: 'auto',
    net: 'ws',
    type: 'none',
    host: o.host,
    path,
    tls: 'tls',
    sni: o.sni || o.host,
    fp: o.fingerprint || 'chrome',
  };
  return `vmess://${btoa(JSON.stringify(obj))}`;
}

/** Pick best display host: clean IP first hop optional, always keep SNI as worker host */
export function buildRecommendedLinks(args: {
  uuid: string;
  workerHost: string;
  path: string;
  name: string;
  cleanIPs?: string[];
}): string[] {
  const { uuid, workerHost, path, name, cleanIPs = [] } = args;
  const links: string[] = [];

  // Primary: direct workers.dev (most reliable)
  links.push(
    buildVlessWsLink({
      uuid,
      host: workerHost,
      path,
      name: `${name} · Direct`,
      sni: workerHost,
    })
  );

  // Clean IP variants (better for some Iranian ISPs) — SNI stays worker host
  const seen = new Set<string>();
  for (const raw of cleanIPs.slice(0, 8)) {
    const ip = raw.split(':')[0].trim();
    if (!ip || seen.has(ip)) continue;
    seen.add(ip);
    links.push(
      buildVlessWsLink({
        uuid,
        host: ip,
        path,
        name: `${name} · ${ip}`,
        sni: workerHost,
        extra: { host: workerHost },
      })
    );
  }

  return links;
}

export function toBase64Lines(lines: string[]): string {
  return btoa(unescape(encodeURIComponent(lines.join('\n'))));
}
