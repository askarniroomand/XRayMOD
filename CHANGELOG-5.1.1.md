# XRayMOD 5.1.1 — Next Generation (SECURE PATH)

Revolutionary stealth update aligned with BPB Worker Panel 5.1.1 ideas, keeping XRayMOD’s D1 multi-user architecture.

## Why panels were getting found / banned

| Risk | Old behavior | 5.1.1 fix |
|------|----------------|-----------|
| Scanner discovery | `/api/*`, `/sub/*`, `/_next/*`, branded HTML public | Compulsory **SECURE PATH** on all panel/API/sub/portal routes |
| Fingerprints | `/api/health` returned `service: xraymod` | Silent `{ ok: true }` without auth; brand removed from public surfaces |
| Root probing | Branded fallback HTML | Default **silent 404** |
| CORS | `Access-Control-Allow-Origin: *` | Same-origin only |
| Login takeover | Username `admin` guessable | Optional **Cloudflare email** bind + enforce |
| Asset leak | Bare `/_next/*` served | Assets only under `/{SECURE_PATH}/_next/…` |
| Abuse / ToS | Always-on proxy | Kill switch + monthly cap in Admin Dashboard |

## New features

- **Admin Dashboard** (`/panel/admin`): usage, update check, password reset, CF email, custom domains, remote settings sync, kill switch
- **Custom domains**: merge into subscriptions with **D** tag
- **Remote sync**: import settings from another XRayMOD panel (secrets / path / domains excluded)
- **Disguise ON by default** with `404` fallback
- Subscription & portal URLs include SECURE PATH: `https://worker/{UUID}/sub/{user}`

## Entry URLs (important)

```
https://YOUR.workers.dev/{SECURE_PATH}/panel
https://YOUR.workers.dev/{SECURE_PATH}/login
https://YOUR.workers.dev/{SECURE_PATH}/sub/{USER_UUID}
```

Bare `/panel`, `/api/health`, `/sub/...` → **404**.

## Client tips (same as BPB 5.1.1)

- v2rayNG ≥ 2.2.3 — enable **Hev TUN**
- sing-box ≥ 1.12.0
- If Fragment fails on some ISPs, try packet `1-1`

## Upgrade

Re-run the one-line installer or `git pull && npm run deploy`. D1 data is preserved. **Re-share subscription links** — they now include SECURE PATH.

After deploy, open **Admin → Cloudflare email** and bind your CF account email.
