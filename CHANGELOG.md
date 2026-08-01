# Changelog

All notable changes to XRayMOD are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- CI (lint + typecheck + smoke)
- CodeQL + Dependabot
- Public OpenAPI/schema for worker admin API
- Expanded automated tests (miniflare)

---

## [1.0.0] - 2026-07-16

### Added
- Cloudflare Workers + D1 panel runtime
- VLESS / Trojan / VMess protocol support paths
- Admin panel UI (Next.js)
- User status portal at `/me/<uuid>`
- Smart top-10 subscription generation
- Stealth skins / disguise modes
- Canary trap paths for scanners
- Backup & audit foundations
- ISP-aware clean IP helpers (where available)
- Kill switch and monthly traffic cap concepts
- 2FA + rate limiting for admin login
- One-command installers:
  - `install.sh` (Linux / macOS / WSL)
  - `install.ps1` / `install.cmd` (Windows)
- Bilingual README (English + Persian)
- MIT license
- SECURITY.md baseline

### Security
- Installer keeps Cloudflare API tokens out of the git repository
- Template `wrangler.toml` uses placeholder bindings only

### Notes
- First public open-source release cut for GitHub packaging maturity.
- Tag this release on GitHub as `v1.0.0` if not already tagged.

---

## Versioning policy

| Change type | Version bump | Examples |
|:------------|:-------------|:---------|
| Breaking API / config | MAJOR | Rename env vars, remove endpoints |
| New features | MINOR | New sub format, new disguise skin |
| Fixes / docs / chores | PATCH | Installer cache fix, typo |

[Unreleased]: https://github.com/askarniroomand/XRayMOD/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/askarniroomand/XRayMOD/releases/tag/v1.0.0
