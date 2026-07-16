# XRayMOD — Deploy & Runbook

## Architecture (unified)

```
frontend/          → Next.js 15 (canonical UI) → static export → frontend/out
worker/            → Cloudflare Worker (API + proxy + disguise + ASSETS)
wrangler.toml      → D1 + ASSETS binding
```

Legacy Vite SPA lives under `src/` and is **not** used by `npm run deploy`.

## Prerequisites

- Node 20+
- Cloudflare account + API token (Edit Cloudflare Workers)
- Account must **not** be disabled (`wrangler whoami` must succeed)

## Quick deploy

```bash
# 1. Install
npm install

# 2. Create D1 (once)
npx wrangler d1 create xraymod-db
# paste database_id into wrangler.toml

# 3. Build UI + deploy Worker
npm run deploy
```

Panel URL after first install:

```
https://xraymod.<account>.workers.dev/<access-uuid>/
```

Default seed login: `admin` / `admin` — change immediately.

## Local development

```bash
npm run build:ui          # Next static export
npm run dev:worker        # wrangler dev --local
# or full:
npm run dev               # build UI + local worker

npm test                  # offline smoke
npm run test:e2e          # full API e2e on local wrangler
```

## Installer WebUI

```bash
uv run installer/app.py
# open http://localhost:8000
```

## Environment vars (wrangler.toml / dashboard)

| Var | Purpose |
|-----|---------|
| `ADMIN_PASSWORD` | Auto-configure panel on first request |
| `PAGES_URL` | Optional remote Pages origin (if not using ASSETS) |
| `PANEL_RECOVERY` | `true` disables disguise |
| `DISGUISE_PAGE` | `1101` or `nginx` |
| `ENABLE_TELEGRAM` | Telegram bot |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `User has been disabled` (9109) | Fix CF account at dash.cloudflare.com |
| 1101 on panel | Wrong UUID path; use install URL |
| Empty UI | Run `npm run build:ui` before deploy |
| Login cookie missing on localhost | Expected Secure cookies only on HTTPS; local uses non-Secure |
