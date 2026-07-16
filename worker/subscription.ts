import type { Env } from './types';
import { getCleanIPs } from './utils';
import {
  buildVlessWsLink,
  buildTrojanWsLink,
  buildVmessWsLink,
  buildRecommendedLinks,
  toBase64Lines,
} from './lib/links';

function text(content: string, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(content, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', ...headers },
  });
}

function subHeaders(user: any, title: string, origin: string): Record<string, string> {
  const expire = user.expiry_date
    ? Math.floor(new Date(user.expiry_date).getTime() / 1000)
    : 0;
  return {
    'Profile-Title': 'base64:' + btoa(unescape(encodeURIComponent(title))),
    'Profile-Update-Interval': '6',
    'Profile-Web-Page-Url': origin,
    'Subscription-Userinfo': `upload=0; download=${user.traffic_used || 0}; total=${user.traffic_limit || 0}; expire=${expire}`,
    'Announce': 'base64:' + btoa(unescape(encodeURIComponent('XrayMOD · CF Edge'))),
    'support-url': origin,
  };
}

export async function handleSubscription(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  const token = params.token;
  if (!token) return text('Invalid subscription link', 400);

  const user = await env.DB.prepare(
    'SELECT id, username, uuid, traffic_limit, traffic_used, expiry_date, status FROM users WHERE uuid = ?'
  )
    .bind(token)
    .first<any>();

  if (!user) return text('Invalid subscription', 404);
  if (user.status !== 'active') return text('Account is not active', 403);
  if (user.expiry_date && new Date(user.expiry_date) < new Date()) {
    return text('Subscription expired', 403);
  }

  let configs = await env.DB.prepare(
    `SELECT c.*, p.id as proto_id, p.name as proto_name
     FROM configs c
     LEFT JOIN protocols p ON c.protocol_id = p.id
     WHERE c.user_id = ?`
  )
    .bind(user.id)
    .all<any>();

  const url = new URL(request.url);
  const workerHost = url.host;
  const origin = url.origin;
  const format = (url.searchParams.get('format') || 'base64').toLowerCase();
  const cleanIPs = await getCleanIPs(env.DB);

  // Auto-heal: if no configs, create recommended VLESS-WS
  if (!configs.results.length) {
    const path = `/proxy/${crypto.randomUUID().slice(0, 10)}`;
    const link = buildVlessWsLink({
      uuid: user.uuid,
      host: workerHost,
      path,
      name: `${user.username} · Auto`,
      sni: workerHost,
    });
    await env.DB.prepare(
      `INSERT INTO configs (user_id, protocol_id, name, settings_json, port, path, link, node_ip, client_limit, created_at)
       VALUES (?, 'vless-ws', ?, ?, 443, ?, ?, ?, 3, ?)`
    )
      .bind(
        user.id,
        'XrayMOD · Auto',
        JSON.stringify({
          path,
          host: workerHost,
          sni: workerHost,
          network: 'ws',
          security: 'tls',
          uuid: user.uuid,
        }),
        path,
        link,
        workerHost,
        Date.now()
      )
      .run();
    configs = await env.DB.prepare(
      `SELECT c.*, p.id as proto_id, p.name as proto_name FROM configs c
       LEFT JOIN protocols p ON c.protocol_id = p.id WHERE c.user_id = ?`
    )
      .bind(user.id)
      .all<any>();
  }

  const mixed =
    (
      await env.DB.prepare('SELECT v FROM kvstore WHERE k = ?')
        .bind('protocol.mixed_mode')
        .first<{ v: string }>()
    )?.v === 'true';

  const links: string[] = [];
  for (let i = 0; i < configs.results.length; i++) {
    const config = configs.results[i];
    const settings = JSON.parse(config.settings_json || '{}');
    const path = config.path || settings.path || '/';
    const name = config.name || `Node ${i + 1}`;
    const proto = (config.proto_id || config.protocol_id || 'vless-ws') as string;

    // Always emit recommended multi-host set for VLESS-WS
    if (proto.includes('vless') || mixed) {
      const batch = buildRecommendedLinks({
        uuid: user.uuid,
        workerHost,
        path,
        name,
        cleanIPs,
      });
      links.push(...batch);
    } else if (proto.includes('trojan')) {
      links.push(
        buildTrojanWsLink({
          uuid: user.uuid,
          password: settings.password || user.uuid,
          host: workerHost,
          path,
          name,
          sni: settings.sni || workerHost,
        })
      );
    } else if (proto.includes('vmess')) {
      links.push(
        buildVmessWsLink({
          uuid: user.uuid,
          host: workerHost,
          path,
          name,
          sni: settings.sni || workerHost,
        })
      );
    } else {
      links.push(
        buildVlessWsLink({
          uuid: user.uuid,
          host: workerHost,
          path,
          name,
          sni: workerHost,
        })
      );
    }
  }

  // Dedupe
  const unique = [...new Set(links.filter(Boolean))];
  const title = `XrayMOD · ${user.username}`;
  const headers = subHeaders(user, title, origin);

  if (format === 'html' || format === 'page') {
    return renderSubHtml(user, unique, origin, title);
  }

  if (format === 'raw' || format === 'list') {
    return text(unique.join('\n'), 200, headers);
  }

  if (format === 'clash') {
    return text(buildClashYaml(unique, workerHost, user), 200, {
      ...headers,
      'Content-Type': 'text/yaml; charset=utf-8',
    });
  }

  // default base64 for v2rayNG / Hiddify / Streisand
  return new Response(toBase64Lines(unique), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...headers,
    },
  });
}

function buildClashYaml(links: string[], host: string, user: any): string {
  const proxies: string[] = [];
  const names: string[] = [];
  links.forEach((link, i) => {
    if (!link.startsWith('vless://')) return;
    try {
      const u = new URL(link.replace('vless://', 'https://'));
      const name = decodeURIComponent(u.hash.replace('#', '') || `Node-${i + 1}`);
      names.push(name);
      const path = u.searchParams.get('path') || '/';
      const sni = u.searchParams.get('sni') || host;
      proxies.push(
        `  - name: "${name.replace(/"/g, '')}"
    type: vless
    server: ${u.hostname}
    port: ${u.port || 443}
    uuid: ${user.uuid}
    network: ws
    tls: true
    servername: ${sni}
    udp: true
    ws-opts:
      path: "${path}"
      headers:
        Host: ${sni}`
      );
    } catch {
      /* skip */
    }
  });

  return `mixed-port: 7890
allow-lan: false
mode: rule
log-level: info
proxies:
${proxies.join('\n')}
proxy-groups:
  - name: PROXY
    type: select
    proxies:
${names.map((n) => `      - "${n.replace(/"/g, '')}"`).join('\n')}
      - DIRECT
rules:
  - MATCH,PROXY
`;
}

function renderSubHtml(user: any, links: string[], origin: string, title: string): Response {
  const items = links
    .map(
      (l, i) =>
        `<div class="item"><div class="n">${i + 1}. ${escapeHtml(decodeURIComponent((l.split('#')[1] || 'node').replace(/\+/g, ' ')))}</div>
         <code>${escapeHtml(l)}</code>
         <button type="button" data-l="${escapeHtml(l)}">کپی</button></div>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,Tahoma,sans-serif;background:#050506;color:#fafafa;padding:1.25rem;line-height:1.5}
.wrap{max-width:640px;margin:0 auto}
h1{font-size:1.25rem;font-weight:900;margin-bottom:.35rem}
.sub{color:#71717a;font-size:.85rem;margin-bottom:1rem}
.item{background:#121216;border:1px solid #27272a;border-radius:.9rem;padding:.85rem;margin-bottom:.65rem}
.n{font-size:.8rem;font-weight:700;color:#10b981;margin-bottom:.4rem}
code{display:block;font-size:.68rem;word-break:break-all;color:#a1a1aa;background:#09090b;padding:.55rem;border-radius:.5rem;margin-bottom:.5rem}
button{border:0;background:#10b981;color:#052e1c;font-weight:800;font-size:.75rem;padding:.45rem .8rem;border-radius:.5rem;cursor:pointer}
.links a{color:#10b981;font-size:.8rem;margin-left:.75rem}
</style>
</head>
<body>
<div class="wrap">
  <h1>${escapeHtml(title)}</h1>
  <p class="sub">کاربر: ${escapeHtml(user.username)} · ${links.length} نود</p>
  <p class="links">
    <a href="${origin}/sub/${user.uuid}">Base64</a>
    <a href="${origin}/sub/${user.uuid}?format=raw">Raw</a>
    <a href="${origin}/sub/${user.uuid}?format=clash">Clash</a>
  </p>
  ${items}
</div>
<script>
document.querySelectorAll('button[data-l]').forEach(function(b){
  b.onclick=function(){navigator.clipboard.writeText(b.getAttribute('data-l')||'');b.textContent='کپی شد';setTimeout(function(){b.textContent='کپی'},1000)};
});
</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}
