"""SQLite database setup with aiosqlite."""
from __future__ import annotations

import aiosqlite
from pathlib import Path

from .config import DB_PATH, DATA_DIR

SCHEMA_SQL = Path(__file__).parent / "schema.sql"

_db: aiosqlite.Connection | None = None


async def get_db() -> aiosqlite.Connection:
    global _db
    if _db is None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        _db = await aiosqlite.connect(str(DB_PATH))
        _db.row_factory = aiosqlite.Row
        await _db.execute("PRAGMA journal_mode=WAL")
        await _db.execute("PRAGMA foreign_keys=ON")
    return _db


async def init_db():
    db = await get_db()
    schema = SCHEMA_SQL.read_text()
    await db.executescript(schema)
    await seed_defaults(db)
    await db.commit()


async def seed_defaults(db: aiosqlite.Connection):
    import hashlib, uuid, time

    # Default admin
    row = await db.execute_fetchall("SELECT id FROM users WHERE username='admin'")
    if not row:
        pw_hash = hashlib.sha256("admin".encode()).hexdigest()
        admin_uuid = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO users (username, password_hash, role, uuid, status, created_at) VALUES (?,?,?,?,?,?)",
            ("admin", pw_hash, "admin", admin_uuid, "active", int(time.time())),
        )
        await db.execute(
            "INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?,?,?)",
            ("panel.admin_uuid", admin_uuid, int(time.time())),
        )

    # Default user
    row = await db.execute_fetchall("SELECT id FROM users WHERE username='user'")
    if not row:
        pw_hash = hashlib.sha256("user".encode()).hexdigest()
        user_uuid = str(uuid.uuid4())
        import datetime
        expiry = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()
        await db.execute(
            "INSERT INTO users (username, password_hash, role, uuid, traffic_limit, expiry_date, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
            ("user", pw_hash, "user", user_uuid, 100, expiry, "active", int(time.time())),
        )

    # Default settings
    defaults = {
        "panel.password_hash": "",
        "panel.secret_key": "",
        "panel.admin_uuid": "",
        "panel.access_uuid": "",
        "disguise.enabled": "false",
        "disguise.admin_path": "",
        "disguise.login_path": "",
        "disguise.sub_path": "",
        "disguise.fallback_page": "1101",
        "ech.enabled": "false",
        "ech.sni": "cloudflare-ech.com",
        "ech.dns": "https://dns.alidns.com/dns-query",
        "tls_fragment.enabled": "false",
        "tls_fragment.mode": "Shadowrocket",
        "tg.bot_token": "",
        "tg.chat_id": "",
    }
    for k, v in defaults.items():
        await db.execute(
            "INSERT OR IGNORE INTO kvstore (k, v, updated) VALUES (?,?,?)",
            (k, v, int(time.time())),
        )

    # Default protocols
    row = await db.execute_fetchall("SELECT COUNT(*) as c FROM protocols")
    if row and row[0][0] == 0:
        import json
        protocols = [
            ("vless-reality", "VLESS + Reality", '{"fields":[{"name":"port","label":"Port","type":"number","default":443},{"name":"uuid","label":"UUID","type":"text","required":true},{"name":"sni","label":"SNI","type":"text","default":"google.com"},{"name":"sid","label":"Short ID","type":"text"},{"name":"pbk","label":"Public Key","type":"text","required":true},{"name":"flow","label":"Flow","type":"select","default":"xtls-rprx-vision","options":[{"label":"None","value":""},{"label":"Vision","value":"xtls-rprx-vision"}]}]}', '{}', 0, 1, 0),
            ("vmess-ws", "VMess + WebSocket", '{"fields":[{"name":"port","label":"Port","type":"number","default":80},{"name":"uuid","label":"UUID","type":"text","required":true},{"name":"path","label":"WS Path","type":"text","default":"/graphql"},{"name":"host","label":"Host","type":"text"}]}', '{}', 0, 1, 0),
            ("trojan-ws", "Trojan + WebSocket", '{"fields":[{"name":"port","label":"Port","type":"number","default":443},{"name":"password","label":"Password","type":"password","required":true},{"name":"sni","label":"SNI","type":"text","default":"google.com"},{"name":"path","label":"WS Path","type":"text","default":"/trojan-ws"}]}', '{}', 0, 1, 0),
            ("ss-ws", "Shadowsocks + WebSocket", '{"fields":[{"name":"port","label":"Port","type":"number","default":80},{"name":"method","label":"Method","type":"select","default":"chacha20-ietf-poly1305","options":[{"label":"ChaCha20-Poly1305","value":"chacha20-ietf-poly1305"},{"label":"AES-256-GCM","value":"aes-256-gcm"}]},{"name":"password","label":"Password","type":"password","required":true},{"name":"path","label":"WS Path","type":"text","default":"/ss-ws"}]}', '{}', 0, 1, 0),
            ("vless-grpc", "VLESS + gRPC", '{"fields":[{"name":"port","label":"Port","type":"number","default":443},{"name":"uuid","label":"UUID","type":"text","required":true},{"name":"sni","label":"SNI","type":"text","default":"google.com"},{"name":"serviceName","label":"Service Name","type":"text","default":"grpc"},{"name":"mode","label":"gRPC Mode","type":"select","default":"gun","options":[{"label":"Gun","value":"gun"},{"label":"Multi","value":"multi"}]}]}', '{}', 0, 1, 0),
        ]
        for p in protocols:
            await db.execute(
                "INSERT OR IGNORE INTO protocols (id, name, schema_json, template_json, price, client_limit, client_price) VALUES (?,?,?,?,?,?,?)",
                p,
            )
