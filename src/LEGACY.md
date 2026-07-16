# Legacy Vite SPA

This directory (`src/`, root Vite config) is **legacy**.

**Canonical panel UI:** `frontend/` (Next.js 15 App Router, static export).

| Item | Path |
|------|------|
| Active UI | `frontend/app/**` |
| Build output | `frontend/out` (Workers Assets) |
| Deploy | `npm run deploy` → builds UI + `wrangler deploy` |
| Legacy Vite build | `npm run build:legacy` (not used by deploy) |

Do not add new features to `src/App.tsx`. Port them to `frontend/` instead.
