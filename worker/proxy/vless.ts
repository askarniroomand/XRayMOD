// VLESS protocol handler for Cloudflare Workers
// Handles VLESS over WebSocket traffic

export interface VlessConfig {
  uuid: string;
  flow?: string;
  network: string;
  security: string;
}

export function parseVlessHeader(buffer: ArrayBuffer): {
  uuid: string;
  command: number;
  address: string;
  port: number;
} | null {
  const view = new Uint8Array(buffer);

  // VLESS header minimum: version(1) + uuid(16) + addons_len(1) + command(1) + port(2) + atype(1)
  if (view.length < 22) return null;

  // Version
  const version = view[0];
  if (version !== 0) return null;

  // UUID (bytes 1-16)
  const uuidBytes = view.slice(1, 17);
  const uuid = formatUuid(uuidBytes);

  // Command: 1 = TCP, 2 = UDP
  const command = view[18];

  // Port (big-endian, bytes 19-20)
  const port = (view[19] << 8) | view[20];

  // Address type
  const atype = view[21];
  let address = '';
  let offset = 22;

  switch (atype) {
    case 1: // IPv4
      if (view.length < offset + 4) return null;
      address = `${view[offset]}.${view[offset + 1]}.${view[offset + 2]}.${view[offset + 3]}`;
      offset += 4;
      break;
    case 2: // Domain
      if (view.length < offset + 1) return null;
      const domainLen = view[offset];
      offset += 1;
      if (view.length < offset + domainLen) return null;
      address = new TextDecoder().decode(view.slice(offset, offset + domainLen));
      offset += domainLen;
      break;
    case 3: // IPv6
      if (view.length < offset + 16) return null;
      const ipv6Parts: string[] = [];
      for (let i = 0; i < 8; i++) {
        ipv6Parts.push(
          ((view[offset + i * 2] << 8) | view[offset + i * 2 + 1]).toString(16)
        );
      }
      address = ipv6Parts.join(':');
      offset += 16;
      break;
    default:
      return null;
  }

  return { uuid, command, address, port };
}

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

export function buildVlessResponse(): Uint8Array {
  // VLESS response: version(1) + response(1) + atype(1) + port(2) + addr_len(1) + addr(1)
  return new Uint8Array([0, 0, 1, 0, 0, 0]);
}
