# Security Policy

## Reporting a vulnerability

Contact Telegram: [@MRROBOT_DT](https://t.me/MRROBOT_DT)

Do **not** open a public GitHub issue for security-sensitive reports.

## What never belongs in this repository

| Never commit | Why |
|:-------------|:----|
| Cloudflare API tokens | Full account control |
| Real `database_id` from production D1 | Ties to your account |
| Panel passwords / session cookies | Account takeover |
| `.env` / `config.json` with secrets | Leak risk |
| Private keys (`*.pem`, `*.key`) | Cryptographic compromise |

`wrangler.toml` in the repo is a **template** only (`database_id` placeholder zeros).  
The installer rewrites it locally during deploy.

## How the one-line installer handles secrets

1. You paste the Cloudflare token **only in your terminal** (interactive prompt).
2. Token is sent **only** to Cloudflare APIs (`api.cloudflare.com`) and never to third parties.
3. Local `~/.xraymod/config.json` stores **metadata only** (worker URL, names) — **not** the API token.
4. Panel password is used once for remote bootstrap (`POST /install`) and is not written to the repo.

## For end users

- Create a scoped token: [API Tokens](https://dash.cloudflare.com/profile/api-tokens) → **Edit Cloudflare Workers**
- Do not share your panel UUID URL, token, or password in public chats
- Rotate the token if it was ever pasted into a screenshot or issue

## For contributors

- Run `git status` before push; never stage `.env` or real `wrangler.toml` IDs
- Prefer placeholders in docs and examples
