/**
 * Proxy traffic — WebSocket handler.
 * Uses request.fetcher.connect() instead of cloudflare:sockets to avoid Error 1101.
 */
import type { Env } from '../types';
import { parseVlessHeader, buildVlessResponse } from './vless';
import { parseTrojanHeader } from './trojan';

function getConnection(request: Request): (opts: { hostname: string; port: number }) => Promise<any> {
  const fetcher = (request as any)?.fetcher;
  if (!fetcher?.connect) {
    throw new Error('fetcher.connect unavailable');
  }
  return fetcher.connect.bind(fetcher);
}

export async function handleProxyTraffic(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  const config = await env.DB.prepare(
    'SELECT c.*, p.id as proto_id, p.template_json FROM configs c LEFT JOIN protocols p ON c.protocol_id = p.id WHERE c.path = ?'
  )
    .bind(path)
    .first<any>();

  if (!config) {
    return new Response('Not found', { status: 404 });
  }

  const user = await env.DB.prepare(
    'SELECT id, uuid, traffic_limit, traffic_used, status, expiry_date FROM users WHERE id = ?'
  )
    .bind(config.user_id)
    .first<any>();

  if (!user || user.status !== 'active') {
    return new Response('Forbidden', { status: 403 });
  }

  if (user.traffic_limit > 0 && user.traffic_used >= user.traffic_limit) {
    return new Response('Quota exceeded', { status: 403 });
  }

  if (user.expiry_date && new Date(user.expiry_date) < new Date()) {
    return new Response('Subscription expired', { status: 403 });
  }

  const upgrade = request.headers.get('Upgrade');
  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

  server.accept();
  handleConnection(server, request, config.protocol_id, config, user, env.DB).catch((err: unknown) => {
    console.error('WebSocket error:', err);
    try {
      server.close(1011, 'Internal error');
    } catch { /* ignore */ }
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

async function handleConnection(
  ws: WebSocket,
  request: Request,
  protocol: string,
  config: any,
  user: any,
  db: D1Database
): Promise<void> {
  let uploadBytes = 0;
  let downloadBytes = 0;

  const firstMsg = await new Promise<ArrayBuffer>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), 10000);
    ws.addEventListener(
      'message',
      (event) => {
        clearTimeout(timer);
        if (event.data instanceof ArrayBuffer) {
          resolve(event.data);
        } else if (event.data instanceof Blob) {
          event.data.arrayBuffer().then(resolve);
        } else {
          resolve(new TextEncoder().encode(String(event.data)).buffer);
        }
      },
      { once: true }
    );
    ws.addEventListener('close', () => {
      clearTimeout(timer);
      reject(new Error('Closed'));
    });
  });

  uploadBytes += firstMsg.byteLength;

  let destHost = '';
  let destPort = 0;
  let payload: ArrayBuffer = firstMsg;

  if (protocol === 'vless-reality' || protocol === 'vless-ws' || String(protocol).startsWith('vless')) {
    const result = parseVlessHeader(firstMsg);
    if (!result) {
      ws.close(1008, 'Invalid VLESS header');
      return;
    }
    destHost = result.address;
    destPort = result.port;
    payload = result.payload;
    ws.send(buildVlessResponse());
  } else if (protocol === 'trojan-ws' || String(protocol).startsWith('trojan')) {
    const result = parseTrojanHeader(firstMsg);
    if (!result) {
      ws.close(1008, 'Invalid Trojan header');
      return;
    }
    destHost = result.address;
    destPort = result.port;
    payload = result.payload;
    // Trojan typically has no response header
  } else {
    const settings = JSON.parse(config.settings_json || '{}');
    destHost = settings.host || settings.sni || 'example.com';
    destPort = settings.port || 443;
  }

  try {
    const connect = getConnection(request);
    const remote = await connect({
      hostname: destHost,
      port: destPort,
    });

    const reader = remote.readable?.getReader();
    const writer = remote.writable?.getWriter();

    if (!reader || !writer) {
      throw new Error('Invalid socket streams');
    }

    await writer.write(new Uint8Array(payload));

    ws.addEventListener('message', async (event) => {
      const data =
        event.data instanceof ArrayBuffer
          ? event.data
          : event.data instanceof Blob
            ? await event.data.arrayBuffer()
            : new TextEncoder().encode(String(event.data)).buffer;

      uploadBytes += data.byteLength;
      try {
        await writer.write(new Uint8Array(data));
      } catch { /* ignore */ }
    });

    const pumpRemote = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            downloadBytes += value.byteLength;
            ws.send(value);
          }
        }
      } catch { /* ignore */ }
    };
    pumpRemote();

    ws.addEventListener('close', async () => {
      try { await writer.close(); } catch { /* ignore */ }
      try { await remote.close?.(); } catch { /* ignore */ }
    });

    remote.closed?.then?.(() => {
      try { ws.close(); } catch { /* ignore */ }
    });
  } catch (err) {
    console.error(`Connect to ${destHost}:${destPort} failed`, err);
    try {
      ws.close(1011, 'Upstream connect failed');
    } catch { /* ignore */ }
  }

  ws.addEventListener('close', async () => {
    try {
      await db
        .prepare('UPDATE users SET traffic_used = traffic_used + ? WHERE id = ?')
        .bind(uploadBytes + downloadBytes, user.id)
        .run();
    } catch (err) {
      console.error('Traffic update failed:', err);
    }
  });
}
