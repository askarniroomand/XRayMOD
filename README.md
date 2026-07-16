<div align="center">

# XrayMOD

**پنل مدیریت پروکسی ماژولار روی Cloudflare Workers**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)
[![Support](https://img.shields.io/badge/Telegram-MRROBOT__DT-26A5E4?logo=telegram)](https://t.me/MRROBOT_DT)

[English](#english) · [فارسی](#فارسی) · [نصب یک‌خطی](#-نصب-یکخطی-توصیه-میشود)

</div>

---

<a id="فارسی"></a>

## فارسی

### XrayMOD چیست؟

پنل **self-hosted** و **سرورلس** برای مدیریت پروکسی (VLESS / Trojan / …) روی Cloudflare Workers + D1.

- بدون VPS اجباری (حالت Worker)
- پنل مخفی پشت UUID
- UI فارسی (پیش‌فرض) + انگلیسی
- سابسکریپشن چندفرمت + کانفیگ پیشنهادی VLESS+WS+TLS
- پشتیبانی: [@MRROBOT_DT](https://t.me/MRROBOT_DT)

---

### 🚀 نصب یک‌خطی (توصیه می‌شود)

روی **macOS / Linux / WSL / Termux** (با Node.js 18+):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/EvolveBeyond/XRayMOD/refs/heads/main/install.sh)
```

#### کاربر فقط این‌ها را وارد می‌کند:

| مرحله | چه چیزی |
|--------|---------|
| 1 | **Cloudflare API Token** |
| 2 | **نام کاربری** پنل |
| 3 | **رمز عبور** پنل |

بقیه (D1، Worker، UI، ساب، کانفیگ پیشنهادی) **خودکار** است.

در پایان چاپ می‌شود:

- لینک ورود پنل (با UUID مخفی)
- نام کاربری / رمز
- لینک سابسکریپشن
- کانفیگ پیشنهادی VLESS

#### ساخت توکن Cloudflare

1. برو به: [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. **Create Token** → قالب **Edit Cloudflare Workers**
3. Permissions لازم: Workers Scripts Edit، D1 Edit، Account Read
4. توکن را کپی کن و در نصب‌کننده paste کن

---

### پیش‌نیاز

| ابزار | حداقل |
|--------|--------|
| Node.js | 18+ (LTS بهتر) |
| npm | همراه Node |
| git | بله |
| curl | بله |
| python3 یا uv | برای installer |

---

### بعد از نصب

1. لینک `login` را که اسکریپت داد باز کن  
2. با یوزر/رمز خودت وارد شو  
3. لینک `/sub/<uuid>` را در Hiddify / v2rayNG / Streisand ایمپورت کن  
4. بهترین پروتکل پیش‌فرض: **VLESS + WebSocket + TLS · پورت 443**

---

### پشتیبانی

- تلگرام: **[@MRROBOT_DT](https://t.me/MRROBOT_DT)**  
- صفحه پشتیبانی داخل پنل: `پشتیبانی`

---

### توسعه از سورس

```bash
git clone https://github.com/EvolveBeyond/XRayMOD.git
cd XRayMOD
npm run setup
npm run build:ui
npx wrangler d1 create xraymod-db   # id را در wrangler.toml بگذار
npx wrangler deploy
```

جزئیات: [DEPLOY.md](DEPLOY.md)

---

### معماری

```
Cloudflare CDN → Worker (API + Proxy + Disguise + UI Assets) → D1
```

| مسیر | نقش |
|------|-----|
| `worker/` | API، پروکسی، ساب، install |
| `frontend/` | پنل Next.js (export استاتیک) |
| `installer/cli_deploy.py` | نصب تعاملی |
| `install.sh` | نقطه ورود یک‌خطی |

---

### لایسنس

[MIT](LICENSE)

---

<a id="english"></a>

## English

**XrayMOD** is a serverless, stealth proxy management panel on Cloudflare Workers.

### One-line install

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/EvolveBeyond/XRayMOD/refs/heads/main/install.sh)
```

You only enter: **API Token → username → password**. Everything else is automated.

Support: [t.me/MRROBOT_DT](https://t.me/MRROBOT_DT) · License: MIT
