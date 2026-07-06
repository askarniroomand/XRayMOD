/**
 * Protocol Schema Definition
 * This allows adding new protocols without changing the core code.
 */

export const VLESS_REALITY_SCHEMA = {
  id: "vless-reality",
  name: "VLESS + Reality",
  fields: [
    { name: "port", label: "Port", type: "number", default: 443 },
    { name: "sni", label: "SNI (Dest)", type: "text", default: "google.com" },
    { name: "sid", label: "Short ID", type: "text", placeholder: "Optional" },
    { name: "pbk", label: "Public Key", type: "text", required: true },
  ],
  template: {
    inbounds: [
      {
        port: "{{port}}",
        protocol: "vless",
        settings: {
          clients: [{ id: "{{uuid}}", flow: "xtls-rprx-vision" }],
          decryption: "none"
        },
        streamSettings: {
          network: "tcp",
          security: "reality",
          realitySettings: {
            show: false,
            dest: "{{sni}}:443",
            xver: 0,
            serverNames: ["{{sni}}"],
            privateKey: "{{privateKey}}",
            shortIds: ["{{sid}}"]
          }
        }
      }
    ]
  }
};
