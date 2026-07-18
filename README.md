<p align="center">
  <img src="docs/assets/banner.svg" alt="XRayMOD — stealth proxy panel on Cloudflare Workers" width="100%"/>
</p>

<p align="center">
  <strong>Open-source · Serverless · Stealth-aware</strong><br/>
  Modern <b>VLESS / Trojan / VMess</b> control plane on <b>Cloudflare Workers + D1</b><br/>
  <sub>User status portal · Smart subscription · Disguise skins · One-line install · Persian UI</sub>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT"/></a>
  <a href="https://github.com/askarniroomand/XRayMOD/releases"><img src="https://img.shields.io/github/v/release/askarniroomand/XRayMOD?style=for-the-badge&color=38bdf8" alt="Release"/></a>
  <a href="https://workers.cloudflare.com"><img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="CF"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TS"/></a>
  <a href="https://github.com/askarniroomand/XRayMOD/actions"><img src="https://img.shields.io/github/actions/workflow/status/askarniroomand/XRayMOD/ci.yml?style=for-the-badge&label=CI" alt="CI"/></a>
  <a href="https://github.com/askarniroomand/XRayMOD/stargazers"><img src="https://img.shields.io/github/stars/askarniroomand/XRayMOD?style=for-the-badge&color=eab308" alt="Stars"/></a>
  <a href="https://t.me/MRROBOT_DT"><img src="https://img.shields.io/badge/Telegram-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="TG"/></a>
</p>

<p align="center">
  <a href="#-english"><b>English</b></a> ·
  <a href="README.fa.md"><b>فارسی</b></a> ·
  <a href="#-installation"><b>Install</b></a> ·
  <a href="#-features"><b>Features</b></a> ·
  <a href="#-architecture"><b>Architecture</b></a> ·
  <a href="SECURITY.md"><b>Security</b></a> ·
  <a href="CONTRIBUTING.md"><b>Contributing</b></a>
</p>

---

<a id="-english"></a>

# XRayMOD

**XRayMOD** is an open-source, serverless panel for managing proxy users and subscription links on **Cloudflare Workers** with **D1** storage. It prioritizes low ops cost (no VPS required for the control plane), a practical admin UI, a user-facing status page, and optional disguise surfaces for hostile networks.

> **Operator responsibility:** You must comply with Cloudflare terms, local laws, and acceptable-use rules. This project is infrastructure software — not an invitation to attack networks you do not control.

---

## Features

| | Feature | Detail |
|:--:|:--------|:-------|
| 📊 | **User status portal** `/me/<uuid>` | Traffic, days left, QR, copy — no admin login for end users |
| 🎯 | **Top-10 smart subscription** | Direct + clean IPs + CF ports + fingerprints when configured |
| 🥷 | **Stealth skins** | CF 1101 · nginx · GitHub 404 · WordPress · Access Denied · blank |
| 🕳 | **Canary traps** | Fake paths log scanners without exposing the panel |
| 💾 | **Backup & audit** | Export/import flows · admin action history foundations |
| 📡 | **ISP-aware clean IPs** | Better picks for constrained carriers when data is available |
| 🛑 | **Kill switch & caps** | Pause proxy paths while keeping panel reachable |
| 🔐 | **Admin hardening** | 2FA support path · rate limiting · secret panel path |
| ⚡ | **One-line install** | Windows PowerShell/CMD · Linux · macOS · WSL |
| 📱 | **Client-ready** | Hiddify · v2rayNG · Streisand · NekoBox · Clash · sing-box |

---

## Tech stack

| Layer | Technology |
|:------|:-----------|
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite at the edge) |
| Language | TypeScript |
| Admin UI | Next.js |
| Installers | Bash · PowerShell |
| Tooling | Wrangler · npm |

```text
Internet → Cloudflare Edge (Worker)
              ├─ Disguise / static responses
              ├─ Admin API (secret path)
              ├─ Subscription endpoints
              ├─ /me user portal
              └─ D1 (users, settings, audit)
```

---

## Architecture

### High-level

```text
                    ┌──────────────────────────┐
   Clients          │   Cloudflare Network     │
   (v2rayNG, etc.)  │                          │
         │          │  Worker (router.ts)      │
         │          │    ├ processors/         │
         └─────────►│    ├ proxy/              │
                    │    ├ api/                │
   Admin browser ──►│    └ user-portal         │
                    │            │             │
                    │            ▼             │
                    │         D1 SQLite        │
                    └──────────────────────────┘
```

### Canonical source of truth

| Path | Role |
|:-----|:-----|
| `worker/` | **Production runtime** — request routing, auth, sub, portal |
| `frontend/` | Admin panel UI |
| `installer/` + `install.*` | Bootstrap onto a Cloudflare account |
| `docs/` | Human documentation and assets |
| `backend/` | Legacy / optional Python experiments — **not required** for Workers deploy |

### Request flow (simplified)

1. Request hits Worker `fetch` handler (`worker/index.ts`)
2. Router classifies: install · static · API · subscription · proxy · portal
3. Auth middleware gates admin APIs
4. D1 reads/writes user and settings rows
5. Response is either panel JSON/HTML, subscription payload, or disguise page

---

## Screenshots

> **Placeholder — replace with real captures before marketing push.**

| Admin dashboard | User `/me` portal | Subscription in client |
|:---------------:|:-----------------:|:----------------------:|
| ![Admin](docs/assets/screenshot-admin.png) | ![Me](docs/assets/screenshot-me.png) | ![Client](docs/assets/screenshot-client.png) |

*Add 1280×800 PNG screenshots under `docs/assets/` and keep secrets cropped out.*

---

## Requirements

### Operator machine
- Windows 10+, macOS 12+, or modern Linux
- Internet access to `api.cloudflare.com` and GitHub
- Ability to run PowerShell **or** Bash

### Cloudflare account
- Free plan is sufficient for many personal deployments
- Permission to create Workers and D1 databases
- API token with **Edit Cloudflare Workers** (prefer scoped token)

### Optional for contributors
- Node.js 20+
- npm 10+
- Wrangler 3+

---

## Installation

### One-command install

**Windows PowerShell** (prompt starts with `PS`):

```powershell
irm https://raw.githubusercontent.com/askarniroomand/XRayMOD/main/install.ps1 | iex
```

**Windows CMD**:

```cmd
powershell -NoProfile -ExecutionPolicy Bypass -Command "iex (iwr -UseBasicParsing 'https://raw.githubusercontent.com/askarniroomand/XRayMOD/main/install.ps1').Content"
```

**Linux / macOS / WSL**:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/main/install.sh)
```

### What you will enter

| Prompt | Purpose |
|:-------|:--------|
| Cloudflare API token | Deploy Worker + D1 (stays on your machine) |
| Admin username | Panel login |
| Admin password | Panel login (choose a strong password) |

### After install

| URL pattern | Purpose |
|:------------|:--------|
| `/<ACCESS_UUID>/login` | Admin panel (keep private) |
| `/sub/<USER_UUID>` | Subscription (Base64 default) |
| `/me/<USER_UUID>` | User status page |
| `/sub/<USER_UUID>?format=clash` | Clash / Mihomo YAML |
| `/sub/<USER_UUID>?format=singbox` | sing-box JSON |

⭐ Star the repo if it helps — visibility funds maintenance motivation.

---

## Usage

### Admin
1. Open the panel login URL from the installer output
2. Create users with traffic / expiry limits
3. Copy subscription or `/me` links to end users
4. Configure disguise skin and canary paths as needed

### End user
1. Import subscription URL into Hiddify / v2rayNG / Clash / sing-box
2. Optionally open `/me/<uuid>` to check remaining traffic and days

### Code example — fetch subscription (operator tooling)

```bash
# Example only — replace host and UUID
curl -fsSL "https://YOUR_WORKER.workers.dev/sub/USER_UUID" | head -c 200
```

```ts
// Example: read Clash profile
const res = await fetch(`https://YOUR_WORKER.workers.dev/sub/${userUuid}?format=clash`);
const yaml = await res.text();
console.log(yaml.slice(0, 200));
```

---

## Configuration

| Variable / setting | Where | Notes |
|:-------------------|:------|:------|
| API token | Installer prompt only | Never commit |
| D1 `database_id` | Local wrangler config after install | Template uses placeholders in git |
| Access UUID | Generated / configured at deploy | Panel path secret |
| Admin credentials | Bootstrap install | Rotate if leaked |
| Disguise mode | Panel settings | Choose skin for unknown routes |
| Protocol options | Panel / API | VLESS · Trojan · VMess related settings |

See `.env.example` and `SECURITY.md` for safe configuration practices.

---

## Project structure

```text
XRayMOD/
├── worker/                 # Cloudflare Worker (runtime source of truth)
│   ├── api/                # Admin/API route handlers
│   ├── processors/         # Request processors
│   ├── proxy/              # Protocol helpers
│   ├── lib/                # Shared worker utilities
│   ├── index.ts            # Worker entry
│   └── router.ts           # Routing
├── frontend/               # Next.js admin UI
├── installer/              # Installer support code
├── docs/                   # Documentation & assets
├── scripts/                # Smoke / e2e helpers
├── install.sh              # Unix installer
├── install.ps1             # Windows installer
├── wrangler.toml           # Template bindings
├── SECURITY.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
└── LICENSE
```

---

## API documentation

Admin and internal APIs are path-scoped behind the panel access UUID.

| Area | Methods | Notes |
|:-----|:--------|:------|
| Auth login/logout | POST | Rate-limited |
| Users CRUD | GET/POST/PATCH/DELETE | Admin session required |
| Settings | GET/PUT | Admin session required |
| Nodes / backends | GET/POST | Admin session required |
| Subscription | GET | User UUID; format query param |
| Health | GET | Liveness |

> Full OpenAPI export is on the roadmap. Until then, inspect `worker/api/*` and panel network calls.

---

## Roadmap

- [x] Workers + D1 panel core
- [x] `/me` status portal
- [x] Smart subscription bundle
- [x] One-line cross-platform install
- [ ] Public OpenAPI document
- [ ] Miniflare unit/integration tests in CI
- [ ] Signed release artifacts
- [ ] Multi-language panel UI packs
- [ ] Hardened error responses (no internal leakage)

See also [ROADMAP.md](./ROADMAP.md) if present and [CHANGELOG.md](./CHANGELOG.md).

---

## Future plans

1. First-class observability (structured logs without secrets)
2. Safer multi-operator roles
3. Exportable disaster-recovery runbook
4. Optional Terraform/Pulumi deploy path
5. Contributor good-first-issues labeled weekly

---

## Known issues

| Issue | Severity | Workaround |
|:------|:---------|:-----------|
| GitHub raw CDN can cache install scripts briefly | Medium | Installer pins / retries; re-run after a minute |
| Dual historical trees (`backend/` Python vs Worker) may confuse new contributors | Medium | Follow `worker/` as canonical |
| Zero or few automated tests in early public tags | Medium | Use smoke scripts; contribute tests |
| Exception messages may be too verbose in some 500 paths | Low–Med | Patch to generic client errors |

Track live issues: https://github.com/askarniroomand/XRayMOD/issues

---

## FAQ

<details>
<summary><b>Is a VPS required?</b></summary>

No for the control plane. The panel runs on Cloudflare Workers + D1. Your proxy backends/nodes are a separate concern depending on how you deploy user traffic paths.
</details>

<details>
<summary><b>Does the free Cloudflare plan work?</b></summary>

Yes for many personal setups. Watch Workers request limits and D1 quotas as you scale.
</details>

<details>
<summary><b>Where is my API token stored?</b></summary>

It should remain on your machine during install and be sent only to Cloudflare APIs. Do not commit it. See SECURITY.md.
</details>

<details>
<summary><b>Can I use Hiddify / v2rayNG?</b></summary>

Yes. Import the subscription URL. Clash and sing-box formats are available via query parameters.
</details>

<details>
<summary><b>How do I report a security issue?</b></summary>

Privately via Telegram [@MRROBOT_DT](https://t.me/MRROBOT_DT) — do not open a public issue.
</details>

<details>
<summary><b>Is this legal?</b></summary>

Laws vary. You are solely responsible for lawful use and compliance with Cloudflare’s terms.
</details>

---

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

```bash
git clone https://github.com/askarniroomand/XRayMOD.git
cd XRayMOD
npm install
# open a feature branch, make changes, PR against main
```

Small docs PRs and tests are excellent first contributions.

---

## Changelog & versioning

- [CHANGELOG.md](./CHANGELOG.md)
- Semantic versioning: `MAJOR.MINOR.PATCH`
- GitHub Releases via tag `vX.Y.Z`

---

## License

MIT © Askar Niroomand — see [LICENSE](./LICENSE).

---

## Contact

| Channel | Link |
|:--------|:-----|
| Maintainer | [github.com/askarniroomand](https://github.com/askarniroomand) |
| Telegram | [t.me/MRROBOT_DT](https://t.me/MRROBOT_DT) |
| Security | [SECURITY.md](./SECURITY.md) |

---

<p align="center">
  <sub>Built for operators who want edge-native control planes · Please star if useful</sub>
</p>
