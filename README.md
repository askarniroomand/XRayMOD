<p align="center">
  <img src="docs/assets/banner.svg" alt="XrayMOD — Open source VLESS Trojan VMess proxy panel on Cloudflare Workers for v2rayNG Hiddify" width="100%"/>
</p>

<p align="center">
  <strong>Open-source · Serverless · Stealth</strong><br/>
  <b>VLESS / Trojan / VMess</b> proxy management panel on <b>Cloudflare Workers + D1</b><br/>
  <sub>subscription · v2rayNG · Hiddify · one-line install · Persian UI</sub>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT"/></a>
  <a href="https://workers.cloudflare.com"><img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="CF"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TS"/></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next"/></a>
  <a href="https://github.com/askarniroomand/XRayMOD/stargazers"><img src="https://img.shields.io/github/stars/askarniroomand/XRayMOD?style=for-the-badge&color=eab308" alt="Stars"/></a>
  <a href="https://t.me/MRROBOT_DT"><img src="https://img.shields.io/badge/Telegram-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="TG"/></a>
</p>

<p align="center">
  <a href="#-فارسی"><b>🇮🇷 فارسی</b></a>
  ·
  <a href="#-english"><b>🇬🇧 English</b></a>
  ·
  <a href="#-one-line-install"><b>⚡ One-line</b></a>
  ·
  <a href="#-manual-install"><b>🛠 Manual</b></a>
  ·
  <a href="https://t.me/MRROBOT_DT"><b>💬 Support</b></a>
</p>

---

<br/>

<div align="center">

### ⚡ One command. Full panel.

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.sh)
```

<table>
<tr>
<td align="center"><b>🔑 Token</b><br/><sub>Cloudflare API</sub></td>
<td align="center">→</td>
<td align="center"><b>👤 Username</b><br/><sub>Panel admin</sub></td>
<td align="center">→</td>
<td align="center"><b>🔒 Password</b><br/><sub>Your choice</sub></td>
<td align="center">→</td>
<td align="center"><b>✨ Live panel</b><br/><sub>UUID + Sub</sub></td>
</tr>
</table>

<sub>Node.js 18+ · git · curl · Cloudflare account</sub>

</div>

---

## ✨ Why XrayMOD?

<table>
<tr>
<td width="33%" valign="top">

### 🥷 Stealth by design
Panel only on a secret **UUID** path.  
Strangers get a pixel-perfect **Error 1101**.

</td>
<td width="33%" valign="top">

### ☁️ Zero infrastructure
**Workers + D1** only.  
No VPS · No Docker · No Nginx.

</td>
<td width="33%" valign="top">

### 🚀 Operator-first UX
**Persian RTL default** + English.  
Sub formats · Clean IP · Tips.

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 📡 Subscription engine
`base64` · `raw` · `clash` · `html`  
Auto VLESS+WS+TLS nodes.

</td>
<td width="33%" valign="top">

### 🧩 Modular core
Protocols as JSON schemas.  
Users · nodes · network · settings.

</td>
<td width="33%" valign="top">

### 💬 Real support
In-panel support page.  
Telegram **[@MRROBOT_DT](https://t.me/MRROBOT_DT)**

</td>
</tr>
</table>

### Stack snapshot

| Layer | Tech |
|:------|:-----|
| Edge runtime | Cloudflare **Workers** |
| Database | Cloudflare **D1** |
| Panel UI | **Next.js 15** (static export) + Tailwind |
| Installer | `install.sh` + Python CLI (`httpx`) |
| Default protocol | **VLESS · WebSocket · TLS · 443** |

---

## 🏗 Architecture

```text
                    ┌──────────────────────────────┐
   Clients          │      Cloudflare Edge         │
  Hiddify           │  TLS 443 · CDN · WAF         │
  v2rayNG     ─────►│              │               │
  Streisand         │              ▼               │
                    │     ┌─────────────────┐      │
                    │     │  XrayMOD Worker │      │
                    │     │  API · Proxy    │      │
                    │     │  Sub · Disguise │      │
                    │     │  UI Assets      │      │
                    │     └────────┬────────┘      │
                    │              │               │
                    │              ▼               │
                    │     ┌─────────────────┐      │
                    │     │   D1 Database   │      │
                    │     └─────────────────┘      │
                    └──────────────────────────────┘
```

| Path | Role |
|:-----|:-----|
| `worker/` | API, proxy, subscription, install, stealth |
| `frontend/` | Next.js panel (FA/EN) |
| `installer/cli_deploy.py` | Interactive one-shot deploy |
| `install.sh` | Public one-line entrypoint |

---

<div align="center">

# 🇮🇷 فارسی

</div>

## ⚡ نصب یک‌خطی

### پیش‌نیاز
- سیستم: macOS / Linux / WSL / Termux  
- **Node.js 18+** · git · curl  
- اکانت Cloudflare  

### دستور جادویی

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.sh)
```

### فقط ۳ ورودی

| # | چه می‌پرسد | مثال |
|:-:|:-----------|:-----|
| 1 | 🔑 توکن Cloudflare | `cfut_…` / API Token |
| 2 | 👤 نام کاربری پنل | `admin` |
| 3 | 🔒 رمز عبور | قوی بگذار یا Enter برای خودکار |

### اسکریپت خودش این‌ها را می‌سازد

```text
✓ اتصال به اکانت Cloudflare
✓ دیتابیس D1
✓ بیلد UI
✓ دیپلوی Worker + فایل‌های پنل
✓ کانفیگ پیشنهادی VLESS+WS+TLS
✓ لینک پنل · UUID · ساب · کانفیگ
```

### ساخت توکن Cloudflare

1. [API Tokens](https://dash.cloudflare.com/profile/api-tokens)  
2. **Create Token** → قالب **Edit Cloudflare Workers**  
3. دسترسی: Account Read · Workers Edit · D1 Edit  
4. Paste در ترمینال  

> ⚠️ توکن را در چت/Issue عمومی نفرست.

---

## 🛠 نصب دستی (کنترل کامل)

<details>
<summary><b>کلیک کن — راهنمای گام‌به‌گام</b></summary>

<br/>

#### ۱) کلون

```bash
git clone https://github.com/askarniroomand/XRayMOD.git
cd XRayMOD
```

#### ۲) وابستگی‌ها

```bash
npm install
npm install --prefix frontend
```

#### ۳) بیلد UI

```bash
npm run build:ui
```

#### ۴) D1

```bash
npx wrangler login
# یا: export CLOUDFLARE_API_TOKEN=...

npx wrangler d1 create xraymod-db
```

`database_id` را کپی کن.

#### ۵) `wrangler.toml`

```toml
[[d1_databases]]
binding = "DB"
database_name = "xraymod-db"
database_id = "YOUR-D1-UUID"
preview_database_id = "YOUR-D1-UUID"
```

#### ۶) دیپلوی

```bash
npx wrangler deploy
```

#### ۷) راه‌اندازی پنل

مرورگر → `https://WORKER.workers.dev/install`  
یا:

```bash
curl -X POST "https://WORKER.workers.dev/install" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPass123"}'
```

#### ۸) ورود

```text
https://WORKER.workers.dev/<ACCESS_UUID>/login
```

#### ۹) ساب

```text
/sub/<USER_UUID>
/sub/<USER_UUID>?format=raw
/sub/<USER_UUID>?format=clash
/sub/<USER_UUID>?format=html
```

#### آپدیت

```bash
git pull
npm install && npm install --prefix frontend
npm run build:ui
npx wrangler deploy
```

</details>

---

## بعد از نصب

| کار | توضیح |
|:----|:------|
| ورود پنل | لینک UUID که اسکریپت داد |
| ایمپورت ساب | Hiddify / v2rayNG / Streisand / NekoBox |
| تست نود | اول **Direct**، بعد Clean IP |
| امنیت | لینک پنل را فقط خودت نگه دار |

### بهترین کانفیگ پیش‌فرض

| Field | Value |
|:------|:------|
| Protocol | **VLESS** |
| Transport | **WebSocket** |
| Security | **TLS** |
| Port | **443** |
| Fingerprint | `chrome` |

---

<div align="center">

# 🇬🇧 English

</div>

## ⚡ One-line install

### Requirements
macOS / Linux / WSL / Termux · **Node 18+** · git · curl · Cloudflare account

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.sh)
```

| Step | You enter |
|:----:|:----------|
| 1 | Cloudflare **API Token** |
| 2 | Panel **username** |
| 3 | Panel **password** |

Everything else is automated: D1, UI build, Worker deploy, recommended config, printed URLs.

### API token

[Create Token](https://dash.cloudflare.com/profile/api-tokens) → **Edit Cloudflare Workers** template  
Permissions: Account Read · Workers Scripts Edit · D1 Edit

---

## 🛠 Manual install

<details>
<summary><b>Click for full step-by-step</b></summary>

<br/>

```bash
git clone https://github.com/askarniroomand/XRayMOD.git
cd XRayMOD
npm install && npm install --prefix frontend
npm run build:ui
npx wrangler login
npx wrangler d1 create xraymod-db
# paste database_id into wrangler.toml
npx wrangler deploy
```

Bootstrap:

```bash
curl -X POST "https://YOUR-WORKER.workers.dev/install" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPass123"}'
```

Login: `https://YOUR-WORKER.workers.dev/<ACCESS_UUID>/login`  
Sub: `https://YOUR-WORKER.workers.dev/sub/<USER_UUID>`

</details>

---

## Recommended config

| Field | Value |
|:------|:------|
| Protocol | **VLESS** |
| Transport | **WebSocket** |
| Security | **TLS** |
| Port | **443** |
| Fingerprint | chrome |

Most reliable combo for Cloudflare Workers.

---

## Project tree

```text
XRayMOD/
├── install.sh                 # one-line entry for everyone
├── installer/cli_deploy.py    # interactive deploy CLI
├── worker/                    # API · proxy · sub · stealth
├── frontend/                  # Next.js panel (FA default + EN)
├── docs/assets/banner.svg     # GitHub hero banner
├── LICENSE                    # MIT
└── README.md
```

---

## Support

<p align="center">
  <a href="https://t.me/MRROBOT_DT"><img src="https://img.shields.io/badge/Telegram_Support-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram"/></a>
  <a href="https://github.com/askarniroomand/XRayMOD/issues"><img src="https://img.shields.io/badge/GitHub-Issues-181717?style=for-the-badge&logo=github" alt="Issues"/></a>
  <a href="SECURITY.md"><img src="https://img.shields.io/badge/Security-Policy-ef4444?style=for-the-badge" alt="Security"/></a>
</p>

---

## License

MIT — see [LICENSE](LICENSE).

---

## Keywords / Topics

`xraymod` · `cloudflare-workers` · `vless` · `trojan` · `vmess` · `v2ray` · `xray` · `proxy-panel` · `vpn-panel` · `subscription` · `v2rayng` · `hiddify` · `serverless` · `d1` · `stealth-panel` · `anti-censorship` · `workers-proxy` · `persian-panel`

Search tips (GitHub): `vless cloudflare panel`, `workers proxy subscription`, `xraymod`

---

<p align="center">
  <b>Stealth on the edge. Deploy in one line.</b><br/><br/>
  <a href="#-one-line-install">Install</a> ·
  <a href="#-manual-install">Manual</a> ·
  <a href="https://t.me/MRROBOT_DT">Telegram</a> ·
  <a href="https://github.com/askarniroomand/XRayMOD">Star ⭐</a>
</p>
