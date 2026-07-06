import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("panel.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    ssh_port INTEGER DEFAULT 22,
    ssh_user TEXT DEFAULT 'root',
    ssh_password TEXT,
    ssh_key TEXT,
    status TEXT DEFAULT 'offline',
    last_check DATETIME
  );

  CREATE TABLE IF NOT EXISTS protocols (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    schema TEXT NOT NULL,
    template TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    uuid TEXT UNIQUE,
    email TEXT,
    traffic_limit INTEGER,
    traffic_used INTEGER DEFAULT 0,
    expiry_date DATETIME,
    status TEXT DEFAULT 'active'
  );
`);

try { db.exec("ALTER TABLE users ADD COLUMN password TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"); } catch (e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    node_id INTEGER,
    protocol_id TEXT,
    settings TEXT,
    port INTEGER,
    link TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(node_id) REFERENCES nodes(id),
    FOREIGN KEY(protocol_id) REFERENCES protocols(id)
  );
`);

// Seed Default Protocols (Modular System)
const defaultProtocols = [
  {
    id: "vless-reality",
    name: "VLESS + Reality",
    schema: JSON.stringify({
      fields: [
        { name: "port", label: "Port", type: "number", default: 443 },
        { name: "sni", label: "SNI", type: "text", default: "google.com" },
        { name: "sid", label: "Short ID", type: "text" },
        { name: "pbk", label: "Public Key", type: "text", required: true }
      ]
    }),
    template: JSON.stringify({
      inbound: {
        port: "{{port}}",
        protocol: "vless",
        settings: { clients: [{ id: "{{uuid}}", flow: "xtls-rprx-vision" }] },
        streamSettings: {
          network: "tcp",
          security: "reality",
          realitySettings: { dest: "{{sni}}:443", serverNames: ["{{sni}}"], privateKey: "{{privateKey}}", shortIds: ["{{sid}}"] }
        }
      }
    })
  },
  {
    id: "vmess-ws",
    name: "VMess + WebSocket",
    schema: JSON.stringify({
      fields: [
        { name: "port", label: "Port", type: "number", default: 80 },
        { name: "path", label: "WS Path", type: "text", default: "/graphql" }
      ]
    }),
    template: JSON.stringify({
      inbound: {
        port: "{{port}}",
        protocol: "vmess",
        settings: { clients: [{ id: "{{uuid}}" }] },
        streamSettings: { network: "ws", wsSettings: { path: "{{path}}" } }
      }
    })
  }
];

const insertProtocol = db.prepare("INSERT OR REPLACE INTO protocols (id, name, schema, template) VALUES (?, ?, ?, ?)");
defaultProtocols.forEach(p => insertProtocol.run(p.id, p.name, p.schema, p.template));

// Seed default admin
const adminExists = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!adminExists) {
  const hashedAdminPassword = bcrypt.hashSync('admin', 10);
  db.prepare("INSERT INTO users (username, password, role, uuid, status) VALUES (?, ?, ?, ?, ?)").run('admin', hashedAdminPassword, 'admin', 'admin-uuid-123', 'active');
}

// Seed default user
const userExists = db.prepare("SELECT * FROM users WHERE username = 'user'").get();
if (!userExists) {
  const hashedUserPassword = bcrypt.hashSync('user', 10);
  db.prepare("INSERT INTO users (username, password, role, uuid, status) VALUES (?, ?, ?, ?, ?)").run('user', hashedUserPassword, 'user', 'user-uuid-123', 'active');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ success: true, role: user.role, user: { id: user.id, username: user.username, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Protocol Management API
  app.get("/api/protocols", (req, res) => {
    const protocols = db.prepare("SELECT * FROM protocols").all();
    res.json(protocols.map(p => ({ ...p, schema: JSON.parse(p.schema) })));
  });

  app.post("/api/protocols", (req, res) => {
    const { id, name, schema, template } = req.body;
    db.prepare("INSERT OR REPLACE INTO protocols (id, name, schema, template) VALUES (?, ?, ?, ?)")
      .run(id, name, JSON.stringify(schema), template);
    res.json({ success: true });
  });

  // Node Management API
  app.get("/api/nodes", (req, res) => {
    const nodes = db.prepare("SELECT * FROM nodes").all();
    res.json(nodes);
  });

  app.post("/api/nodes", (req, res) => {
    const { name, ip, ssh_port, ssh_user, ssh_password } = req.body;
    const result = db.prepare("INSERT INTO nodes (name, ip, ssh_port, ssh_user, ssh_password) VALUES (?, ?, ?, ?, ?)")
      .run(name, ip, ssh_port || 22, ssh_user || 'root', ssh_password);
    res.json({ id: result.lastInsertRowid });
  });

  // User & Config API
  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
