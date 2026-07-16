# Security Policy

## Reporting a vulnerability

Please contact support on Telegram: [@MRROBOT_DT](https://t.me/MRROBOT_DT)

Do **not** open a public GitHub issue for security-sensitive reports.

## What not to commit

- Cloudflare API tokens
- Real `wrangler.toml` database IDs from production
- Panel passwords / session cookies
- `.env` files with secrets

The public installer never needs your secrets in the repository — tokens are entered only in the terminal at install time.
