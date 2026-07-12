# Agent Context — XRayMOD

## Ponytail
**Level: full** — enforced every response. Stop at first working rung.

## Project Identity
XRayMOD — modular proxy management panel on Cloudflare Workers. Stealth architecture: panel hidden behind UUID, all other pages show fake Error 1101.

## Language
User communicates in Persian (Farsi). **Always respond in Persian.** Code comments and variable names stay English.

## Architecture
- **Worker**: Single CF Worker serving API + proxy + disguise + subscription
- **Frontend**: React SPA (Vite) served from CF Pages or via PAGES_URL proxy
- **Backend (VPS mode)**: FastAPI + SQLite (offline) / PostgreSQL (production)
- **Installer**: FastAPI + WebUI (`installer/app.py`) or CLI (`installer/install.py`)
- **DB**: Cloudflare D1 (users, configs, protocols, kvstore, backends)

## Key Files
| File | Purpose |
|------|---------|
| `worker/router.ts` | Request pipeline: disguise → UUID → route → fallback |
| `worker/disguise.ts` | Error 1101 bypass + secret path remapping |
| `worker/auth.ts` | Session, password hash, rate limiting, timing-safe compare |
| `worker/subscription.ts` | Link generation (mixed protocol, per-node host randomization) |
| `worker/proxy/*.ts` | VLESS, Trojan, SS, gRPC, XHTTP handlers |
| `worker/utils.ts` | ISP detection (Iranian), CIDR random IPs, clean IP storage |
| `worker/install.ts` | First-time password setup + UUID generation |
| `worker/schema.ts` | D1 schema + default protocols + seed data |
| `installer/app.py` | FastAPI WebUI installer |
| `backend/main.py` | FastAPI backend for VPS mode |
| `frontend/` | Next.js 15 App Router (build passes) |

## Router Pipeline Order
```
1. DB schema init (await)
2. Kill switch + monthly cap (proxy traffic only)
3. WebSocket/gRPC/XHTTP detection → proxy handler
4. Disguise: remap secret paths (/x-admin → /admin)
5. UUID check: strip prefix, block unauthorized
6. Second disguise check: /admin → 1101 decoy
7. Install redirect (if not configured)
8. Route matching (API, subscription, telegram)
9. Disguise fallback (unmatched → 1101)
10. PAGES_URL proxy (SPA)
11. Final fallback HTML
```

## DB Schema (5 tables)
- `users` — id, username, password_hash, role, uuid, email, traffic_limit, traffic_used, expiry_date, status
- `configs` — id, user_id, protocol_id, name, settings_json, port, path, link, node_ip, client_limit
- `protocols` — id, name, schema_json, template_json, price, client_limit, client_price
- `kvstore` — k, v, updated (settings, sessions, clean IPs, rate limits)
- `backends` — id, user_id, vps_ip, vps_port, vps_uuid, status

## Nova Features Ported
- Kill switch: `panel.paused` → 503 for proxy traffic only
- Monthly cap: `panel.monthly_cap_gb` → 503 when exceeded
- Rate limiting: 5 login attempts/min/IP → 429
- Mixed protocol: `protocol.mixed_mode` → cycles vless/trojan/ss
- Per-node host randomization from shuffled clean IPs
- Timing-safe password comparison
- html1101: pixel-perfect CF error page with CSS + Ray ID

## Rules
- Ponytail: **full** (default, enforced)
- SSH password: always ask user, never assume
- No comments unless WHY is non-obvious
