<div align="center">

# XrayMOD — راهنمای کامل فارسی

**پنل مخفی مدیریت پروکسی روی Cloudflare Workers**

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Telegram](https://img.shields.io/badge/پشتیبانی-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/MRROBOT_DT)

[English README](README.md) · [گیت‌هاب](https://github.com/askarniroomand/XRayMOD)

</div>

---

## XrayMOD چیست؟

یک پنل **اوپن‌سورس** و **سرورلس** برای ساخت و مدیریت کانفیگ پروکسی (VLESS و …) روی **Cloudflare Workers + D1**.

- بدون نیاز اجباری به VPS  
- پنل پشت **UUID مخفی**  
- UI **فارسی** (پیش‌فرض) + انگلیسی  
- ساب چندفرمت + کانفیگ پیشنهادی آماده  
- پشتیبانی: [@MRROBOT_DT](https://t.me/MRROBOT_DT)

---

## 🚀 نصب یک‌خطی (ساده‌ترین راه)

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.sh)
```

### فقط این ۳ تا را وارد کن

| # | ورودی |
|---|--------|
| 1 | توکن Cloudflare |
| 2 | نام کاربری پنل |
| 3 | رمز عبور پنل |

اسکریپت بقیه را **خودکار** انجام می‌دهد و در پایان می‌دهد:

- لینک ورود پنل  
- Access UUID  
- لینک سابسکریپشن  
- کانفیگ پیشنهادی VLESS+WS  

### توکن چطور بسازم؟

1. [API Tokens](https://dash.cloudflare.com/profile/api-tokens)  
2. Create Token → **Edit Cloudflare Workers**  
3. ساخت → کپی → paste در ترمینال  

---

## 🛠 نصب دستی (گام‌به‌گام)

### پیش‌نیاز
Node.js 18+ · npm · git · curl · اکانت Cloudflare

### ۱) کلون

```bash
git clone https://github.com/askarniroomand/XRayMOD.git
cd XRayMOD
```

### ۲) وابستگی‌ها

```bash
npm install
npm install --prefix frontend
```

### ۳) بیلد UI

```bash
npm run build:ui
```

### ۴) دیتابیس D1

```bash
npx wrangler login
npx wrangler d1 create xraymod-db
```

`database_id` را کپی کن.

### ۵) `wrangler.toml`

```toml
[[d1_databases]]
binding = "DB"
database_name = "xraymod-db"
database_id = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
preview_database_id = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
```

### ۶) دیپلوی

```bash
npx wrangler deploy
```

### ۷) راه‌اندازی پنل

مرورگر:

```text
https://WORKER.workers.dev/install
```

یا:

```bash
curl -X POST "https://WORKER.workers.dev/install" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPass123"}'
```

### ۸) ورود

```text
https://WORKER.workers.dev/<ACCESS_UUID>/login
```

### ۹) ساب

```text
https://WORKER.workers.dev/sub/<USER_UUID>
https://WORKER.workers.dev/sub/<USER_UUID>?format=html
```

### آپدیت دستی

```bash
git pull
npm install && npm install --prefix frontend
npm run build:ui
npx wrangler deploy
```

---

## بهترین کانفیگ

| مورد | مقدار |
|------|--------|
| پروتکل | VLESS |
| Transport | WebSocket |
| Security | TLS |
| Port | 443 |
| Fingerprint | chrome |

کلاینت‌های پیشنهادی: **Hiddify · v2rayNG · Streisand · NekoBox**

---

## امنیت

- لینک پنل (با UUID) را عمومی نکن  
- توکن API را در چت نفرست  
- رمز قوی انتخاب کن  

---

## پشتیبانی

- تلگرام: **[@MRROBOT_DT](https://t.me/MRROBOT_DT)**  
- Issue: [GitHub Issues](https://github.com/askarniroomand/XRayMOD/issues)  

---

## لایسنس

[MIT](LICENSE)
