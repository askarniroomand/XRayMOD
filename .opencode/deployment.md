# Deployment Guide — XRayMOD

## Quick Deploy (Installer)

```bash
rm -rf ~/.xraymod/XRayMOD
bash <(curl -fsSL https://raw.githubusercontent.com/EvolveBeyond/XRayMOD/refs/heads/main/install.sh)
```

1. Opens WebUI at `http://localhost:8000`
2. Click "Connect to Cloudflare" (OAuth)
3. Enter admin password
4. Click "Deploy"
5. Save the panel URL

## Manual Deploy (Wrangler)

```bash
# Build + obfuscate worker
bash build-worker.sh

# Deploy to CF
wrangler deploy
```

## Build Pipeline

```bash
# 1. Build TypeScript → JavaScript
npx wrangler deploy --dry-run --outdir=/tmp/build

# 2. Obfuscate (browser-no-eval, RC4 strings)
npx javascript-obfuscator /tmp/build/index.js \
  --output worker.js \
  --target browser-no-eval \
  --string-array true \
  --string-array-encoding rc4

# 3. Verify
# - No eval()
# - No node: imports
# - No cloudflare:sockets
```

## Configuration

### wrangler.toml
```toml
name = "xraymod"
main = "worker/index.ts"
compatibility_date = "2025-01-01"
# NO nodejs_compat — causes Error 1101

[[d1_databases]]
binding = "DB"
database_name = "xraymod-db"
database_id = "your-d1-id"
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Admin password |
| `DISGUISE_PAGE` | No | `1101` or `nginx` |
| `PANEL_RECOVERY` | No | `1` to bypass disguise |
| `TG_BOT_TOKEN` | No | Telegram bot token |

## Update Panel

1. Open installer WebUI
2. Click "Update Panel"
3. Connect to Cloudflare
4. Enter password
5. Click "Update"

## Delete Panel

1. Open installer WebUI
2. Click "Delete Panel"
3. Connect to Cloudflare
4. Type "DELETE" to confirm
5. Click "Delete"
