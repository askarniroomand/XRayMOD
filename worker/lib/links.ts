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

/** CF edge HTTPS ports that often work in Iran */
export const CF_EDGE_PORTS = [443, 2053, 2083, 2087, 2096, 8443] as const;
export const FINGERPRINTS = ['chrome', 'firefox', 'safari', 'edge'] as const;

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
    host: o.extra?.host || o.host,
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

/**
 * Build up to `max` best configs for CF edge:
 * 1) Direct worker host :443 chrome
 * 2) Clean IPs (ISP-aware) with SNI=worker
 * 3) CF alternate ports on worker host
 * 4) Fingerprint variants to fill remaining slots
 */
export function buildRecommendedLinks(args: {
  uuid: string;
  workerHost: string;
  path: string;
  name: string;
  cleanIPs?: string[];
  max?: number;
  carrier?: string;
}): string[] {
  const { uuid, workerHost, path, name, cleanIPs = [], max = 10, carrier } = args;
  const links: string[] = [];
  const seen = new Set<string>();

  const push = (link: string) => {
    if (links.length >= max) return;
    if (seen.has(link)) return;
    seen.add(link);
    links.push(link);
  };

  const label = (part: string) => `${name} · ${part}`;

  // 1. Primary direct (most reliable)
  push(
    buildVlessWsLink({
      uuid,
      host: workerHost,
      port: 443,
      path,
      name: label('① Direct'),
      sni: workerHost,
      fingerprint: 'chrome',
    })
  );

  // 2. Clean IPs first (best for Iranian ISPs)
  const ips: string[] = [];
  for (const raw of cleanIPs) {
    const ip = String(raw).split(':')[0].trim();
    if (ip && /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) && !ips.includes(ip)) ips.push(ip);
  }

  let i = 0;
  for (const ip of ips) {
    if (links.length >= max) break;
    i++;
    const fp = FINGERPRINTS[i % FINGERPRINTS.length];
    const tag = carrier && carrier !== 'all' ? `${ip} · ${carrier.toUpperCase()}` : ip;
    push(
      buildVlessWsLink({
        uuid,
        host: ip,
        port: 443,
        path,
        name: label(`${i + 1}️⃣ ${tag}`),
        sni: workerHost,
        fingerprint: fp,
        extra: { host: workerHost },
      })
    );
  }

  // 3. CF alternate ports on worker host
  for (const port of CF_EDGE_PORTS) {
    if (links.length >= max) break;
    if (port === 443) continue;
    push(
      buildVlessWsLink({
        uuid,
        host: workerHost,
        port,
        path,
        name: label(`Port ${port}`),
        sni: workerHost,
        fingerprint: 'chrome',
      })
    );
  }

  // 4. Fingerprint variants on clean IP #1 or worker
  const host2 = ips[0] || workerHost;
  for (const fp of FINGERPRINTS) {
    if (links.length >= max) break;
    if (fp === 'chrome' && host2 === workerHost) continue;
    push(
      buildVlessWsLink({
        uuid,
        host: host2,
        port: 443,
        path,
        name: label(`FP ${fp}`),
        sni: workerHost,
        fingerprint: fp,
        extra: host2 !== workerHost ? { host: workerHost } : undefined,
      })
    );
  }

  // 5. Extra clean IPs on port 8443 if still short
  for (const ip of ips.slice(0, 4)) {
    if (links.length >= max) break;
    push(
      buildVlessWsLink({
        uuid,
        host: ip,
        port: 8443,
        path,
        name: label(`${ip}:8443`),
        sni: workerHost,
        fingerprint: 'chrome',
        extra: { host: workerHost },
      })
    );
  }

  return links.slice(0, max);
}

export function toBase64Lines(lines: string[]): string {
  return btoa(unescape(encodeURIComponent(lines.join('\n'))));
}
