CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  uuid TEXT UNIQUE,
  email TEXT DEFAULT '',
  traffic_limit INTEGER DEFAULT 0,
  traffic_used INTEGER DEFAULT 0,
  expiry_date TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  protocol_id TEXT,
  name TEXT DEFAULT '',
  settings_json TEXT DEFAULT '{}',
  port INTEGER DEFAULT 443,
  path TEXT DEFAULT '',
  link TEXT DEFAULT '',
  node_ip TEXT DEFAULT '',
  client_limit INTEGER DEFAULT 1,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS protocols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  schema_json TEXT NOT NULL,
  template_json TEXT NOT NULL,
  price REAL DEFAULT 0,
  client_limit INTEGER DEFAULT 1,
  client_price REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kvstore (
  k TEXT PRIMARY KEY,
  v TEXT,
  updated INTEGER
);

CREATE TABLE IF NOT EXISTS backends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  vps_ip TEXT NOT NULL,
  vps_port INTEGER DEFAULT 443,
  vps_uuid TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at INTEGER
);
