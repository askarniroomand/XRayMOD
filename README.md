<div align="center">

```
██╗  ██╗██████╗  █████╗ ██╗   ██╗███╗   ███╗ ██████╗ ██████╗ 
╚██╗██╔╝██╔══██╗██╔══██╗╚██╗ ██╔╝████╗ ████║██╔═══██╗██╔══██╗
 ╚███╔╝ ██████╔╝███████║ ╚████╔╝ ██╔████╔██║██║   ██║██║  ██║
 ██╔██╗ ██╔══██╗██╔══██║  ╚██╔╝  ██║╚██╔╝██║██║   ██║██║  ██║
██╔╝ ██╗██║  ██║██║  ██║   ██║   ██║ ╚═╝ ██║╚██████╔╝██████╔╝
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ 
```

# XrayMOD

### Stealth · Serverless · Open Source  
**Modular proxy management panel on Cloudflare Workers**

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Stars](https://img.shields.io/github/stars/askarniroomand/XRayMOD?style=for-the-badge)](https://github.com/askarniroomand/XRayMOD/stargazers)
[![Telegram](https://img.shields.io/badge/Support-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/MRROBOT_DT)

**[🇮🇷 فارسی](#-فارسی)** · **[🇬🇧 English](#-english)** · **[⚡ One-line Install](#-one-line-install-recommended)** · **[🛠 Manual Install](#-manual-install-step-by-step)**

<br/>

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.sh)
```

<sub>Token → Username → Password → Panel is live ✨</sub>

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🥷 Stealth panel
Hidden behind a secret **UUID** path.  
Everyone else sees a fake **Cloudflare 1101**.

### ☁️ Zero VPS required
Runs on **Cloudflare Workers + D1** free tier.  
No Docker. No server rent. No Nginx.

### ⚡ One-line deploy
One terminal command.  
Auto: D1 · Worker · UI · config · subscription.

</td>
<td width="50%">

### 🌐 FA + EN UI
Default **Persian (RTL)** with English toggle.  
Built for real-world operators.

### 📡 Smart subscription
Base64 · Raw · Clash · HTML page.  
Clean-IP variants + recommended VLESS+WS+TLS.

### 💬 Real support
Telegram: **[@MRROBOT_DT](https://t.me/MRROBOT_DT)**  
In-panel support page included.

</td>
</tr>
</table>

### Protocol stack

| Protocol | Transport | Notes |
|----------|-----------|--------|
| **VLESS** | WebSocket + TLS | ✅ Recommended for CF Workers |
| Trojan | WebSocket + TLS | Supported |
| VMess | WebSocket | Supported |
| gRPC / XHTTP | Experimental | Edge-compatible paths |

---

## 🏗 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge                         │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │  CDN / TLS  │ → │   Worker     │ → │   D1 Database   │  │
│  │  (443)      │   │ API·Proxy·UI │   │ users·configs   │  │
│  └─────────────┘   │ Sub·Disguise │   │ kvstore·nodes   │  │
│                    └──────────────┘   └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
   Client apps (Hiddify / v2rayNG / Streisand / NekoBox)
```

| Path | Role |
|------|------|
| `worker/` | API, proxy, subscription, install, stealth |
| `frontend/` | Next.js panel (static export → Workers Assets) |
| `installer/cli_deploy.py` | Interactive CLI installer |
| `install.sh` | One-line entrypoint for everyone |

---

<div align="center">

# 🇮🇷 فارسی

</div>

## نصب یک‌خطی (توصیه‌شده)

### پیش‌نیاز
- macOS / Linux / WSL / Termux  
- **Node.js 18+** · git · curl  
- اکانت Cloudflare  

### دستور

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.sh)
```

### فقط ۳ تا چیز ازت می‌پرسه

| مرحله | ورودی |
|:-----:|--------|
| **۱** | 🔑 **Cloudflare API Token** |
| **۲** | 👤 **نام کاربری** پنل |
| **۳** | 🔒 **رمز عبور** پنل |

بقیه **خودکار** انجام می‌شه:

```text
✓ بررسی توکن و اکانت
✓ ساخت دیتابیس D1
✓ بیلد رابط کاربری
✓ دیپلوی Worker + Assets
✓ ساخت کانفیگ پیشنهادی VLESS+WS
✓ چاپ لینک پنل + ساب + کانفیگ
```

### ساخت توکن Cloudflare (فارسی)

1. برو به [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)  
2. **Create Token** → قالب **Edit Cloudflare Workers**  
3. دسترسی‌ها: `Account Read` · `Workers Scripts Edit` · `D1 Edit`  
4. توکن را کپی کن و در ترمینال paste کن  

> ⚠️ توکن را هیچ‌وقت در چت/Issue عمومی نفرست.

---

## نصب دستی (گام‌به‌گام — بدون حالت خودکار)

اگر می‌خوای **خودت کنترل کامل** داشته باشی:

### ۱) کلون مخزن

```bash
git clone https://github.com/askarniroomand/XRayMOD.git
cd XRayMOD
```

### ۲) نصب وابستگی‌ها

```bash
npm install
npm install --prefix frontend
```

### ۳) ساخت UI

```bash
npm run build:ui
```

باید پوشه `frontend/out` ساخته شود.

### ۴) ساخت دیتابیس D1

```bash
npx wrangler login
# یا: export CLOUDFLARE_API_TOKEN=your_token

npx wrangler d1 create xraymod-db
```

خروجی شبیه این است:

```text
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### ۵) ویرایش `wrangler.toml`

```toml
name = "xraymod"
main = "worker/index.ts"
compatibility_date = "2024-11-01"
workers_dev = true

[assets]
directory = "./frontend/out"
binding = "ASSETS"
run_worker_first = true

[[d1_databases]]
binding = "DB"
database_name = "xraymod-db"
database_id = "PASTE_YOUR_D1_ID_HERE"   # ← اینجا
preview_database_id = "PASTE_YOUR_D1_ID_HERE"
```

### ۶) دیپلوی Worker

```bash
npx wrangler deploy
```

آدرس چیزی شبیه این می‌گیری:

```text
https://xraymod.<subdomain>.workers.dev
```

### ۷) راه‌اندازی پنل (یک‌بار)

```bash
# نصب خودکار از مرورگر / curl:
curl -X POST "https://YOUR-WORKER.workers.dev/install" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPass123"}'
```

یا در مرورگر:

```text
https://YOUR-WORKER.workers.dev/install
```

و دکمه **نصب خودکار** را بزن.

### ۸) ورود

از پاسخ JSON / صفحه نصب، **Panel URL** و **UUID** را بردار:

```text
https://YOUR-WORKER.workers.dev/<ACCESS_UUID>/login
```

### ۹) سابسکریپشن

```text
https://YOUR-WORKER.workers.dev/sub/<ADMIN_UUID>
https://YOUR-WORKER.workers.dev/sub/<ADMIN_UUID>?format=raw
https://YOUR-WORKER.workers.dev/sub/<ADMIN_UUID>?format=clash
https://YOUR-WORKER.workers.dev/sub/<ADMIN_UUID>?format=html
```

### به‌روزرسانی دستی

```bash
cd XRayMOD
git pull
npm install && npm install --prefix frontend
npm run build:ui
npx wrangler deploy
```

---

## بعد از نصب چی کار کنم؟

1. وارد پنل شو (لینک UUID)  
2. ساب را در **Hiddify / v2rayNG / Streisand / NekoBox** ایمپورت کن  
3. نود **Direct** را اول تست کن؛ اگر کند بود Clean IP  
4. لینک پنل را **فقط خودت** نگه دار  

### بهترین کانفیگ پیش‌فرض

| مورد | مقدار |
|------|--------|
| پروتکل | **VLESS** |
| Transport | **WebSocket** |
| Security | **TLS** |
| Port | **443** |
| Fingerprint | chrome |

---

## پشتیبانی

| | |
|--|--|
| 💬 تلگرام | [**@MRROBOT_DT**](https://t.me/MRROBOT_DT) |
| 📂 Issue | [GitHub Issues](https://github.com/askarniroomand/XRayMOD/issues) |
| 🛡 امنیت | [SECURITY.md](SECURITY.md) |

---

<div align="center">

# 🇬🇧 English

</div>

## ⚡ One-line install (recommended)

### Requirements
- macOS / Linux / WSL / Termux  
- **Node.js 18+**, git, curl  
- A Cloudflare account  

### Command

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.sh)
```

### You only enter 3 things

| Step | Input |
|:----:|--------|
| **1** | 🔑 **Cloudflare API Token** |
| **2** | 👤 **Panel username** |
| **3** | 🔒 **Panel password** |

Everything else is automatic:

```text
✓ Verify token & account
✓ Create D1 database
✓ Build frontend
✓ Deploy Worker + Assets
✓ Seed recommended VLESS+WS config
✓ Print panel URL + sub + share links
```

### Create a Cloudflare API Token

1. Open [API Tokens](https://dash.cloudflare.com/profile/api-tokens)  
2. **Create Token** → **Edit Cloudflare Workers** template  
3. Needs: Account Read · Workers Scripts Edit · D1 Edit  
4. Paste the token into the installer  

> ⚠️ Never share your API token in public chats/issues.

---

## 🛠 Manual install (step-by-step)

For full control without the interactive script:

### 1) Clone

```bash
git clone https://github.com/askarniroomand/XRayMOD.git
cd XRayMOD
```

### 2) Install dependencies

```bash
npm install
npm install --prefix frontend
```

### 3) Build the UI

```bash
npm run build:ui
```

### 4) Create D1

```bash
npx wrangler login
# or: export CLOUDFLARE_API_TOKEN=your_token

npx wrangler d1 create xraymod-db
```

Copy the returned `database_id`.

### 5) Edit `wrangler.toml`

Set:

```toml
database_id = "YOUR_D1_UUID"
preview_database_id = "YOUR_D1_UUID"
```

### 6) Deploy

```bash
npx wrangler deploy
```

### 7) Bootstrap the panel

```bash
curl -X POST "https://YOUR-WORKER.workers.dev/install" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPass123"}'
```

Or open `/install` in the browser and run auto setup.

### 8) Login

```text
https://YOUR-WORKER.workers.dev/<ACCESS_UUID>/login
```

### 9) Subscription

```text
/sub/<USER_UUID>
/sub/<USER_UUID>?format=raw
/sub/<USER_UUID>?format=clash
/sub/<USER_UUID>?format=html
```

### Manual update

```bash
git pull
npm install && npm install --prefix frontend
npm run build:ui
npx wrangler deploy
```

---

## Recommended config

| Field | Value |
|-------|--------|
| Protocol | **VLESS** |
| Transport | **WebSocket** |
| Security | **TLS** |
| Port | **443** |
| Fingerprint | chrome |

This is the most reliable combo on Cloudflare Workers free/paid.

---

## Project layout

```text
XRayMOD/
├── install.sh                 # one-line entry
├── installer/cli_deploy.py    # interactive deploy
├── worker/                    # CF Worker (API + proxy + sub)
├── frontend/                  # Next.js panel (FA/EN)
├── LICENSE                    # MIT
└── README.md                  # you are here
```

---

## Support & community

- Telegram: [**@MRROBOT_DT**](https://t.me/MRROBOT_DT)  
- Issues: [GitHub Issues](https://github.com/askarniroomand/XRayMOD/issues)  
- Security: [SECURITY.md](SECURITY.md)  

---

## License

Released under the **[MIT License](LICENSE)**.

---

<div align="center">

**Made for operators who want stealth + simplicity on the edge.**

⭐ Star the repo if XrayMOD helps you

[Install now](#-one-line-install-recommended) · [Manual guide](#-manual-install-step-by-step) · [Telegram](https://t.me/MRROBOT_DT)

</div>
