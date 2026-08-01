# Agent Context — XRayMOD (Gen 5.1.1)

## Ponytail
**Level: full** — enforced every response. Stop at first working rung.

## Project Identity
XRayMOD — modular proxy management panel on Cloudflare Workers.  
**Gen 5.1.1 stealth:** compulsory **SECURE PATH** (access UUID). Unauthorized routes return **silent 404** (default). Disguise skins optional.

## Language
User communicates in Persian (Farsi). **Always respond in Persian.** Code comments and variable names stay English.

## Architecture
- **Worker**: Single CF Worker serving API + proxy + disguise + subscription behind SECURE PATH
- **Frontend**: Next.js 15 static export via ASSETS (`frontend/out`)
- **Backend (VPS mode)**: FastAPI + SQLite (optional)
- **Installer**: FastAPI WebUI (`installer/app.py`) or one-line `install.sh` / `install.ps1`
- **DB**: Cloudflare D1 (users, configs, protocols, kvstore, backends)

## Key Files
| File | Purpose |
|------|---------|
| `worker/router.ts` | Pipeline: proxy → canary → **SECURE PATH gate** → routes → SPA/404 |
| `worker/disguise.ts` | Silent 404 + skins + canary matching |
| `worker/api/admin.ts` | Admin Dashboard API (update, domains, CF email, remote sync) |
| `worker/lib/secure-path.ts` | Absolute URL helpers with SECURE PATH |
| `worker/auth.ts` | Session, password hash, rate limiting, timing-safe compare |
| `worker/subscription.ts` | Links + D-tagged custom domains |
| `worker/proxy/*.ts` | VLESS, Trojan, SS, gRPC, XHTTP handlers |
| `worker/install.ts` | First-time bootstrap + UUID generation |
| `worker/schema.ts` | D1 schema + defaults (schema v4 / panel 5.1.1) |
| `frontend/app/panel/admin/` | Admin Dashboard UI |
| `frontend/lib/paths.ts` | Client SECURE PATH + API base |

## Router Pipeline Order
```
1. DB schema init
2. Kill switch + monthly cap (proxy traffic only)
3. WebSocket/gRPC/XHTTP → proxy
4. Canary traps → deny/404
5. If not configured → /install only
6. Compulsory SECURE PATH strip (else silent 404)
7. Assets under /{SECURE}/_next only
8. Disguise remap / decoy for leaked /admin|/login
9. Routes: API, sub, me, bot
10. Login / SPA static
11. denyPublic (404 or decoy skin)
```

## URL model (breaking vs pre-5.1)
```
/{SECURE_PATH}/panel
/{SECURE_PATH}/login
/{SECURE_PATH}/api/*
/{SECURE_PATH}/sub/{userUuid}
/{SECURE_PATH}/me/{userUuid}
```
Bare `/api`, `/sub`, `/_next` → 404 once configured.

## DB Schema (5 tables)
- `users` — id, username, password_hash, role, uuid, email, traffic_limit, traffic_used, expiry_date, status
- `configs` — id, user_id, protocol_id, name, settings_json, port, path, link, node_ip, client_limit
- `protocols` — id, name, schema_json, template_json, price, client_limit, client_price
- `kvstore` — k, v, updated (settings, sessions, clean IPs, rate limits)
- `backends` — id, user_id, vps_ip, vps_port, vps_uuid, status

## Gen 5.1 features
- Kill switch: `panel.paused` → 503 for proxy traffic only
- Monthly cap: `panel.monthly_cap_gb` → 503 when exceeded
- Rate limiting: 5 login attempts/min/IP → 429
- CF email enforce: `panel.cf_email` + `panel.cf_email_enforce`
- Custom domains: `panel.custom_domains` → D-tagged sub links
- Disguise default ON + `disguise.fallback_page=404`
