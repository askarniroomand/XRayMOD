export interface ProtocolField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select' | 'boolean';
  default?: any;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface ProtocolSchema {
  fields: ProtocolField[];
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  price?: number; // Base Price in TON
  clientLimit?: number; // Default max clients
  clientPrice?: number; // Price per extra client
  schema: ProtocolSchema;
  template: string; // Xray config template with {{field}} placeholders
}

/**
 * Generates an Xray config string by replacing placeholders in a template
 * with actual values from the form.
 */
export function generateConfig(template: string, values: Record<string, any>): any {
  let configStr = template;
  Object.entries(values).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    configStr = configStr.replace(placeholder, value);
  });
  
  try {
    return JSON.parse(configStr);
  } catch (e) {
    console.error("Failed to parse generated config JSON", e);
    return configStr;
  }
}

/**
 * Mock protocols for initial state.
 * In a real app, these would come from the backend.
 */
export const DEFAULT_PROTOCOLS: ProtocolDefinition[] = [
  {
    id: "vless-reality",
    name: "VLESS + Reality",
    schema: {
      fields: [
        { name: "port", label: "Port", type: "number", default: 443 },
        { name: "uuid", label: "UUID", type: "text", required: true },
        { name: "sni", label: "SNI", type: "text", default: "google.com" },
        { name: "sid", label: "Short ID", type: "text" },
        { name: "pbk", label: "Public Key", type: "text", required: true },
        { name: "flow", label: "Flow", type: "select", default: "xtls-rprx-vision", options: [
          { label: "None", value: "" },
          { label: "Vision", value: "xtls-rprx-vision" }
        ]}
      ]
    },
    template: JSON.stringify({
      inbound: {
        port: "{{port}}",
        protocol: "vless",
        settings: { clients: [{ id: "{{uuid}}", flow: "{{flow}}" }] },
        streamSettings: {
          network: "tcp",
          security: "reality",
          realitySettings: { dest: "{{sni}}:443", serverNames: ["{{sni}}"], privateKey: "PRIVATE_KEY_HERE", shortIds: ["{{sid}}"] }
        }
      }
    }, null, 2)
  },
  {
    id: "vmess-ws",
    name: "VMess + WebSocket",
    schema: {
      fields: [
        { name: "port", label: "Port", type: "number", default: 80 },
        { name: "uuid", label: "UUID", type: "text", required: true },
        { name: "path", label: "WS Path", type: "text", default: "/graphql" },
        { name: "host", label: "Host", type: "text" }
      ]
    },
    template: JSON.stringify({
      inbound: {
        port: "{{port}}",
        protocol: "vmess",
        settings: { clients: [{ id: "{{uuid}}" }] },
        streamSettings: { 
          network: "ws", 
          wsSettings: { path: "{{path}}", headers: { Host: "{{host}}" } } 
        }
      }
    }, null, 2)
  }
];
