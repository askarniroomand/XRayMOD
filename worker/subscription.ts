import type { Env } from './types';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function text(content: string, status = 200): Response {
  return new Response(content, {
    status,
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function handleSubscription(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  const token = params.token;
  if (!token) {
    return text('Invalid subscription link', 400);
  }

  // Find user by UUID token
  const user = await env.DB.prepare(
    'SELECT id, username, uuid, traffic_limit, traffic_used, expiry_date, status FROM users WHERE uuid = ?'
  )
    .bind(token)
    .first<any>();

  if (!user) {
    return text('Invalid subscription', 404);
  }

  if (user.status !== 'active') {
    return text('Account is not active', 403);
  }

  if (user.expiry_date && new Date(user.expiry_date) < new Date()) {
    return text('Subscription expired', 403);
  }

  // Get all configs for this user
  const configs = await env.DB.prepare(
    `SELECT c.*, p.id as proto_id, p.name as proto_name, p.schema_json, p.template_json
     FROM configs c
     LEFT JOIN protocols p ON c.protocol_id = p.id
     WHERE c.user_id = ?`
  )
    .bind(user.id)
    .all<any>();

  if (configs.results.length === 0) {
    return text('No configurations available');
  }

  // Check Accept header for format preference
  const accept = request.headers.get('Accept') || '';
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'base64';

  // Generate links for each config
  const links: string[] = [];
  for (const config of configs.results) {
    const settings = JSON.parse(config.settings_json || '{}');
    const template = config.template_json;

    // Replace template variables
    let processedTemplate = template;
    const templateData = { ...settings, uuid: user.uuid };
    for (const [key, value] of Object.entries(templateData)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedTemplate = processedTemplate.replace(regex, String(value));
    }

    const port = config.port || 443;
    const host = settings.host || settings.sni || 'example.com';

    // Generate URI based on protocol
    let uri = '';
    switch (config.proto_id) {
      case 'vless-reality':
      case 'vless-ws':
      case 'vless-grpc':
        uri = `vless://${user.uuid}@${host}:${port}?encryption=none&security=${settings.security || 'tls'}&type=${settings.network || 'tcp'}&flow=${settings.flow || ''}#${encodeURIComponent(config.name)}`;
        break;
      case 'vmess-ws':
      case 'vmess-wss':
        const vmessObj = {
          v: '2',
          ps: config.name,
          add: host,
          port: port,
          id: user.uuid,
          aid: 0,
          scy: 'auto',
          net: settings.network || 'ws',
          type: 'none',
          host: host,
          path: settings.path || '/',
          tls: settings.security === 'tls' ? 'tls' : '',
        };
        uri = `vmess://${btoa(JSON.stringify(vmessObj))}`;
        break;
      case 'trojan-ws':
      case 'trojan-wss':
        uri = `trojan://${settings.password || 'password'}@${host}:${port}?type=${settings.network || 'ws'}&host=${host}&path=${settings.path || '/'}&security=tls&sni=${settings.sni || host}#${encodeURIComponent(config.name)}`;
        break;
      case 'ss-ws':
      case 'ss-wss':
        const ssInfo = btoa(`${settings.method || 'chacha20-ietf-poly1305'}:${settings.password || 'password'}`);
        uri = `ss://${ssInfo}@${host}:${port}?type=${settings.network || 'ws'}&path=${settings.path || '/'}#${encodeURIComponent(config.name)}`;
        break;
      default:
        // Custom protocol — use generic format
        uri = `${config.proto_id}://${btoa(processedTemplate)}@${host}:${port}#${encodeURIComponent(config.name)}`;
    }

    links.push(uri);
  }

  // Format output
  if (format === 'clash' || accept.includes('text/yaml')) {
    return generateClashConfig(links, configs.results, user);
  }

  if (format === 'singbox' || accept.includes('application/json')) {
    return generateSingboxConfig(links, configs.results, user);
  }

  // Default: base64 encoded
  const base64Config = btoa(links.join('\n'));
  return text(base64Config);
}

function generateClashConfig(
  links: string[],
  configs: any[],
  user: any
): Response {
  const proxies: any[] = [];
  const proxyNames: string[] = [];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const settings = JSON.parse(config.settings_json || '{}');
    const name = config.name || `Config ${i + 1}`;
    proxyNames.push(name);

    const proxy: any = {
      name,
      type: getClashProxyType(config.proto_id),
      server: settings.host || settings.sni || 'example.com',
      port: config.port || 443,
      uuid: user.uuid,
    };

    if (config.proto_id.includes('vless')) {
      proxy.flow = settings.flow || '';
      proxy.tls = settings.security === 'tls' || settings.security === 'reality';
      if (settings.sni) proxy.sni = settings.sni;
    }

    if (config.proto_id.includes('vmess')) {
      proxy.network = settings.network || 'ws';
      if (settings.path) proxy['ws-opts'] = { path: settings.path };
      proxy.tls = settings.security === 'tls';
    }

    if (config.proto_id.includes('trojan')) {
      proxy.password = settings.password || 'password';
      proxy.network = settings.network || 'ws';
      proxy.tls = true;
    }

    if (config.proto_id.includes('ss')) {
      proxy.cipher = settings.method || 'chacha20-ietf-poly1305';
      proxy.password = settings.password || 'password';
    }

    proxies.push(proxy);
  }

  const clashConfig = {
    'mixed-port': 7890,
    'allow-lan': false,
    'mode': 'rule',
    'proxies': proxies,
    'proxy-groups': [
      {
        'name': 'Proxy',
        'type': 'select',
        'proxies': [...proxyNames, 'DIRECT'],
      },
    ],
    'rules': ['MATCH,Proxy'],
  };

  return new Response(
    `proxies:\n${JSON.stringify(clashConfig, null, 2)
      .split('\n')
      .map((l) => '  ' + l)
      .join('\n')}`,
    {
      headers: { 'Content-Type': 'text/yaml; charset=utf-8' },
    }
  );
}

function generateSingboxConfig(
  links: string[],
  configs: any[],
  user: any
): Response {
  const outbounds: any[] = [];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const settings = JSON.parse(config.settings_json || '{}');
    const name = config.name || `Config ${i + 1}`;

    const outbound: any = {
      type: getSingboxOutboundType(config.proto_id),
      tag: name,
      server: settings.host || settings.sni || 'example.com',
      server_port: config.port || 443,
      uuid: user.uuid,
    };

    if (config.proto_id.includes('vless')) {
      outbound.flow = settings.flow || '';
      if (settings.security === 'tls') {
        outbound.tls = { enabled: true, server_name: settings.sni || settings.host };
      }
    }

    if (config.proto_id.includes('vmess')) {
      outbound.transport = {
        type: settings.network || 'ws',
        path: settings.path || '/',
      };
    }

    outbounds.push(outbound);
  }

  const singboxConfig = {
    outbounds,
    inbounds: [
      {
        type: 'mixed',
        listen: '127.0.0.1',
        listen_port: 2080,
      },
    ],
  };

  return json(singboxConfig);
}

function getClashProxyType(protoId: string): string {
  if (protoId.includes('vless')) return 'vless';
  if (protoId.includes('vmess')) return 'vmess';
  if (protoId.includes('trojan')) return 'trojan';
  if (protoId.includes('ss')) return 'ss';
  return 'ss';
}

function getSingboxOutboundType(protoId: string): string {
  if (protoId.includes('vless')) return 'vless';
  if (protoId.includes('vmess')) return 'vmess';
  if (protoId.includes('trojan')) return 'trojan';
  if (protoId.includes('ss')) return 'shadowsocks';
  return 'shadowsocks';
}
