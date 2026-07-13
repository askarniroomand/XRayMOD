# Architecture — XRayMOD v2

## Overview

XRayMOD is a modular proxy management panel that runs on Cloudflare Workers. It provides VLESS, Trojan, and Shadowsocks proxy protocols with advanced anti-censorship features.

## System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                        │
├─────────────────────────────────────────────────────────┤
│                   Cloudflare Worker                      │
│                                                          │
│  Request Pipeline:                                       │
│  1. CORS preflight                                      │
│  2. DB schema init                                      │
│  3. WebSocket/gRPC/XHTTP → proxy (bypass UUID)          │
│  4. UUID gate: strip prefix, block unauthorized          │
│  5. Route matching (API, install, subscription)          │
│  6. Static SPA serving                                  │
│  7. Disguise fallback (Error 1101)                      │
│                                                          │
├─────────────────────────────────────────────────────────┤
│               Cloudflare D1 Database                     │
│          (users, configs, protocols, kvstore)            │
└─────────────────────────────────────────────────────────┘
```

## Stealth Architecture

- Panel hidden behind UUID: `/<uuid>/dashboard`
- All other pages return fake Cloudflare Error 1101
- Random worker names at deploy time
- No `eval()` in worker code (avoids 1101)
- No `node:` imports (avoids polyfill detection)
- Obfuscated with `browser-no-eval` target

## Dual Mode

1. **CF Workers Mode** — proxy on edge, API on worker (current)
2. **Personal Server Mode** — proxy on CF, management on VPS (planned)

## Key Design Decisions

- Single worker serves API + proxy + disguise + subscription
- D1 for storage (not KV) — strongly consistent, more read headroom
- `request.fetcher.connect()` for TCP (not `import { connect } from 'cloudflare:sockets'`)
- Flat router (no processor system) — simple if/else like Nova
- Farsi variable names for anti-grep stealth
