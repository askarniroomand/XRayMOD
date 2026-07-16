// Trojan protocol handler for Cloudflare Workers

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
  payload: ArrayBuffer;
} | null {
  const view = new Uint8Array(buffer);

  // hex(56) + CRLF(2) + cmd(1) + atype(1) minimum
  // Standard Trojan: password_hex(56) + \r\n + CMD + ATYP + DST.ADDR + DST.PORT + \r\n + payload
  if (view.length < 60) return null;

  const passwordHex = new TextDecoder().decode(view.slice(0, 56));
  if (view[56] !== 0x0d || view[57] !== 0x0a) return null;

  let offset = 58;
  const command = view[offset];
  offset += 1;

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

  if (view.length < offset + 2) return null;
  const port = (view[offset] << 8) | view[offset + 1];
  offset += 2;

  // trailing CRLF before payload
  if (view.length >= offset + 2 && view[offset] === 0x0d && view[offset + 1] === 0x0a) {
    offset += 2;
  }

  return {
    password: passwordHex,
    command,
    address,
    port,
    payload: buffer.slice(offset),
  };
}

export function buildTrojanResponse(): Uint8Array {
  return new Uint8Array(0);
}
