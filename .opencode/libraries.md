# Libraries & Dependencies — XRayMOD

## Worker (TypeScript)
No external dependencies — everything is hand-written.

| Module | Purpose |
|--------|---------|
| `worker/router.ts` | Flat request routing |
| `worker/auth.ts` | SHA-256 password hashing, session management |
| `worker/disguise.ts` | Error 1101 bypass, secret path remapping |
| `worker/subscription.ts` | Link generation (VLESS/Trojan/SS, Clash, sing-box) |
| `worker/proxy/index.ts` | WebSocket proxy with `fetcher.connect()` |
| `worker/proxy/vless.ts` | VLESS protocol parser |
| `worker/proxy/trojan.ts` | Trojan protocol parser |
| `worker/proxy/grpc.ts` | gRPC detection |
| `worker/proxy/xhttp.ts` | XHTTP detection |
| `worker/proxy/shadowsocks.ts` | Shadowsocks handler |
| `worker/telegram.ts` | Telegram bot webhook |
| `worker/install.ts` | First-time password setup |
| `worker/schema.ts` | D1 schema + default protocols |
| `worker/utils.ts` | ISP detection, CIDR IPs, helpers |
| `worker/lib/kv.ts` | KV store with D1-backed shim + cache |
| `worker/types.ts` | TypeScript interfaces |

## Installer (Python)
| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn[standard]` | ASGI server |
| `httpx` | HTTP client for CF API |
| `aiosqlite` | Async SQLite (future) |

## Frontend (Next.js)
| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react` | UI library |
| `tailwindcss` | Styling |
| `@radix-ui/*` | UI primitives |
| `lucide-react` | Icons |
| `motion` | Animations |
| `sonner` | Toast notifications |

## Build Tools
| Tool | Purpose |
|------|---------|
| `wrangler` | CF Worker build + deploy |
| `javascript-obfuscator` | Code obfuscation (browser-no-eval) |
| `vite` | Frontend dev server |
