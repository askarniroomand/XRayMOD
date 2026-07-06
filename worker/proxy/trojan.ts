// Trojan protocol handler for Cloudflare Workers
// Handles Trojan over WebSocket traffic

export interface TrojanConfig {
  password: string;
  sni: string;
  network: string;
}

export function parseTrojanHeader(buffer: ArrayBuffer): {
  password: string;
  command: number;
  address: string;
  port: number;
} | null {
  const view = new Uint8Array(buffer);

  // Trojan header: CRLF(2) + password_hash(56 hex = 32 bytes) + CRLF(2) + cmd(1) + atype(1)
  if (view.length < 62) return null;

  // Check CRLF
  if (view[0] !== 0x0d || view[1] !== 0x0a) return null;

  // Password hash (32 bytes = 64 hex chars, but stored as 56 bytes in buffer)
  const passwordHex = new TextDecoder().decode(view.slice(2, 58));

  // Check CRLF after password
  if (view[58] !== 0x0d || view[59] !== 0x0a) return null;

  // Command: 1 = CONNECT, 3 = UDP ASSOCIATE
  const command = view[60];

  // Address type
  const atype = view[61];
  let address = '';
  let offset = 62;

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

  // Port (big-endian)
  if (view.length < offset + 2) return null;
  const port = (view[offset] << 8) | view[offset + 1];

  return { password: passwordHex, command, address, port };
}

export function buildTrojanResponse(): Uint8Array {
  return new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
}
