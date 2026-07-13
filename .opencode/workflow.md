# Development Workflow — XRayMOD

## Session Start

1. Read `agent.md` for project context
2. Read `design.md` for architecture
3. Check `.opencode/` for specific docs
4. Check memory for recent changes

## Code Style

- **Ponytail: full** — stop at first working rung
- No comments unless WHY is non-obvious
- No abstractions with one implementation
- Stdlib first, native platform second
- Shortest working diff wins

## File Organization

```
worker/           # Cloudflare Worker (TypeScript)
├── index.ts      # Entry point
├── router.ts     # Flat request routing
├── auth.ts       # Auth + sessions
├── disguise.ts   # Error 1101 bypass
├── proxy/        # Protocol handlers
├── api/          # API route handlers
├── lib/          # Helpers (kv.ts)
└── types.ts      # TypeScript interfaces

installer/        # FastAPI WebUI installer
├── app.py        # FastAPI app
├── cf_api.py     # Cloudflare API client
├── pipeline.py   # Deploy pipeline
└── templates/    # HTML templates

frontend/         # Next.js 15 App Router
├── app/          # Pages
├── components/   # React components
└── lib/          # Helpers

backend/          # FastAPI VPS mode
├── main.py       # FastAPI app
├── routers/      # API routers
└── database.py   # SQLite/PostgreSQL
```

## Commit Convention

```
feat: new feature
fix: bug fix
chore: maintenance
refactor: code restructuring
```

## Testing

```bash
# Build worker
bash build-worker.sh

# Test locally
npx wrangler dev

# Build frontend
cd frontend && npm run build

# Run installer
uv run xraymod-install
```

## Common Issues

### Error 1101
- Check for `eval()` in code
- Check for `node:` imports
- Check `nodejs_compat` flag
- Check obfuscation target

### UUID Not Working
- Check D1 `kvstore` table for `panel.access_uuid`
- Check router UUID gate logic
- Verify no caching issues

### Proxy Not Working
- Verify `request.fetcher.connect()` usage
- Check WebSocket upgrade headers
- Verify VLESS/Trojan header parsing
