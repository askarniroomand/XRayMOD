<p align="center">
  <img src="docs/assets/banner.svg" alt="XrayMOD" width="100%"/>
</p>

<p align="center">
  <b>پنل مخفی مدیریت پروکسی روی Cloudflare Workers</b><br/>
  اوپن‌سورس · سرورلس · فارسی
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT"/></a>
  <a href="https://t.me/MRROBOT_DT"><img src="https://img.shields.io/badge/پشتیبانی-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram" alt="TG"/></a>
  <a href="README.md"><img src="https://img.shields.io/badge/English-README-0ea5e9?style=for-the-badge" alt="EN"/></a>
</p>

---

## XrayMOD چیست؟

پنل **self-hosted** برای ساخت و مدیریت کانفیگ پروکسی روی **Cloudflare Workers + D1**:

| | |
|:--|:--|
| 🥷 | پنل پشت **UUID مخفی** — بقیه Error 1101 می‌بینند |
| ☁️ | بدون VPS اجباری |
| 🇮🇷 | UI **فارسی** پیش‌فرض + انگلیسی |
| 📡 | ساب Base64 / Raw / Clash / HTML |
| ⚡ | نصب با **یک دستور** |

---

## ⚡ نصب یک‌خطی (توصیه)

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.sh)
```

### فقط ۳ تا ورودی

| مرحله | ورودی |
|:-----:|:------|
| ۱ | 🔑 توکن Cloudflare |
| ۲ | 👤 نام کاربری |
| ۳ | 🔒 رمز عبور |

بقیه خودکار: D1 · UI · Worker · کانفیگ · لینک‌ها

### توکن

[ساخت API Token](https://dash.cloudflare.com/profile/api-tokens) → قالب **Edit Cloudflare Workers**

---

## 🛠 نصب دستی

<details>
<summary><b>گام‌به‌گام کامل</b></summary>

<br/>

```bash
git clone https://github.com/askarniroomand/XRayMOD.git
cd XRayMOD
npm install
npm install --prefix frontend
npm run build:ui
npx wrangler login
npx wrangler d1 create xraymod-db
# database_id را در wrangler.toml بگذار
npx wrangler deploy
```

راه‌اندازی:

```bash
curl -X POST "https://WORKER.workers.dev/install" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPass123"}'
```

ورود:

```text
https://WORKER.workers.dev/<ACCESS_UUID>/login
```

ساب:

```text
https://WORKER.workers.dev/sub/<USER_UUID>
https://WORKER.workers.dev/sub/<USER_UUID>?format=html
```

</details>

---

## بهترین کانفیگ

| مورد | مقدار |
|:-----|:------|
| پروتکل | **VLESS** |
| Transport | **WebSocket** |
| Security | **TLS** |
| Port | **443** |
| Fingerprint | chrome |

کلاینت: Hiddify · v2rayNG · Streisand · NekoBox

---

## پشتیبانی

<p align="center">
  <a href="https://t.me/MRROBOT_DT"><img src="https://img.shields.io/badge/تلگرام-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram" alt="Telegram"/></a>
</p>

---

## لایسنس

[MIT](LICENSE) · راهنمای انگلیسی کامل: [README.md](README.md)
