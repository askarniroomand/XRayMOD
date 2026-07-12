export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  uuid: string;
  used: number;
  limit: number;
  status: 'active' | 'expired' | 'disabled';
  expiry: string;
}

export interface Node {
  id: number;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  cpu: number;
  ram: number;
  users: number;
  uptime: string;
}

export interface Protocol {
  id: string;
  name: string;
  schema: { fields: ProtocolField[] };
  template: string;
  price?: number;
  clientLimit?: number;
  clientPrice?: number;
}

export interface ProtocolField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select' | 'boolean';
  default?: unknown;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface UserConfig {
  id: number;
  name: string;
  protocolId: string;
  link: string;
  clientLimit?: number;
}

export interface Backend {
  id: number;
  vpsIp: string;
  vpsPort: number;
  status: string;
}
