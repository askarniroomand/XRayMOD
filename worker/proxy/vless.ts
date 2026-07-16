// VLESS protocol handler for Cloudflare Workers

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
  payload: ArrayBuffer;
} | null {
  const view = new Uint8Array(buffer);

  // version(1) + uuid(16) + addon_len(1) minimum
  if (view.length < 19) return null;

  const version = view[0];
  if (version !== 0) return null;

  const uuidBytes = view.slice(1, 17);
  const uuid = formatUuid(uuidBytes);

  const addonLen = view[17];
  let offset = 18 + addonLen;
  if (view.length < offset + 4) return null; // cmd + port + atype

  const command = view[offset];
  offset += 1;

  const port = (view[offset] << 8) | view[offset + 1];
  offset += 2;

  const atype = view[offset];
  offset += 1;

  let address = '';
  switch (atype) {
    case 1: // IPv4
      if (view.length < offset + 4) return null;
      address = `${view[offset]}.${view[offset + 1]}.${view[offset + 2]}.${view[offset + 3]}`;
      offset += 4;
      break;
    case 2: // Domain
      if (view.length < offset + 1) return null;
      {
        const domainLen = view[offset];
        offset += 1;
        if (view.length < offset + domainLen) return null;
        address = new TextDecoder().decode(view.slice(offset, offset + domainLen));
        offset += domainLen;
      }
      break;
    case 3: // IPv6
      if (view.length < offset + 16) return null;
      {
        const ipv6Parts: string[] = [];
        for (let i = 0; i < 8; i++) {
          ipv6Parts.push(
            ((view[offset + i * 2] << 8) | view[offset + i * 2 + 1]).toString(16)
          );
        }
        address = ipv6Parts.join(':');
        offset += 16;
      }
      break;
    default:
      return null;
  }

  return {
    uuid,
    command,
    address,
    port,
    payload: buffer.slice(offset),
  };
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
  // version(1) + addon length(1) = empty response
  return new Uint8Array([0, 0]);
}
