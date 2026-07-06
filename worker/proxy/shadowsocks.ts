// Shadowsocks protocol handler for Cloudflare Workers
// Handles Shadowsocks over WebSocket with AEAD ciphers

export interface ShadowsocksConfig {
  method: string;
  password: string;
  network: string;
}

// AEAD cipher methods supported by Cloudflare Workers via Web Crypto
const SUPPORTED_METHODS: Record<string, string> = {
  'chacha20-ietf-poly1305': 'chacha20-poly1305',
  'aes-256-gcm': 'aes-256-gcm',
  'aes-128-gcm': 'aes-128-gcm',
};

export function isSupportedMethod(method: string): boolean {
  return method in SUPPORTED_METHODS;
}

export async function deriveKey(
  password: string,
  method: string
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const methodConfig = SUPPORTED_METHODS[method];
  const keyLength = method.includes('256') ? 32 : 16;

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('ss-subkey'),
      iterations: 1000,
      hash: 'SHA-1',
    },
    keyMaterial,
    { name: methodConfig === 'chacha20-poly1305' ? 'ChaCha20-Poly1305' : methodConfig, length: keyLength * 8 },
    false,
    ['decrypt', 'encrypt']
  );
}

export async function decryptShadowsocks(
  data: ArrayBuffer,
  key: CryptoKey,
  method: string
): Promise<ArrayBuffer | null> {
  const view = new Uint8Array(data);

  // Parse SS header: atype(1) + addr(1-257) + port(2)
  if (view.length < 4) return null;

  const atype = view[0];
  let offset = 1;

  switch (atype) {
    case 1: // IPv4
      offset += 4;
      break;
    case 3: // Domain
      offset += 1 + view[1];
      break;
    case 4: // IPv6
      offset += 16;
      break;
    default:
      return null;
  }

  offset += 2; // port

  if (offset > view.length) return null;

  // The rest is the encrypted payload
  const payload = view.slice(offset);
  const iv = payload.slice(0, 12); // AEAD nonce
  const ciphertext = payload.slice(12);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: SUPPORTED_METHODS[method] === 'chacha20-poly1305' ? 'ChaCha20-Poly1305' : SUPPORTED_METHODS[method],
        iv,
      },
      key,
      ciphertext
    );
    return decrypted;
  } catch {
    return null;
  }
}

export async function encryptShadowsocks(
  data: ArrayBuffer,
  key: CryptoKey,
  method: string
): Promise<ArrayBuffer> {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: SUPPORTED_METHODS[method] === 'chacha20-poly1305' ? 'ChaCha20-Poly1305' : SUPPORTED_METHODS[method],
      iv,
    },
    key,
    data
  );

  // Combine IV + encrypted data
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  return result.buffer;
}

export function buildShadowsocksHeader(
  address: string,
  port: number
): Uint8Array {
  const parts: number[] = [];

  // Check if IPv4, IPv6, or domain
  const ipv4Match = address.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    parts.push(0x01); // IPv4
    parts.push(
      parseInt(ipv4Match[1]),
      parseInt(ipv4Match[2]),
      parseInt(ipv4Match[3]),
      parseInt(ipv4Match[4])
    );
  } else if (address.includes(':')) {
    // IPv6
    parts.push(0x04);
    const groups = address.split(':');
    for (const group of groups) {
      const val = parseInt(group, 16);
      parts.push((val >> 8) & 0xff, val & 0xff);
    }
  } else {
    // Domain
    parts.push(0x03);
    const encoded = new TextEncoder().encode(address);
    parts.push(encoded.length);
    parts.push(...encoded);
  }

  // Port (big-endian)
  parts.push((port >> 8) & 0xff, port & 0xff);

  return new Uint8Array(parts);
}
