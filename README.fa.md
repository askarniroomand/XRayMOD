<p align="center">
  <img src="docs/assets/banner.svg" alt="XrayMOD" width="100%"/>
</p>

<p align="center">
  <b>پنل مخفی و مدرن مدیریت پروکسی روی Cloudflare Workers</b><br/>
  اوپن‌سورس · سرورلس · صفحه وضعیت کاربر · ساب هوشمند · فارسی
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT"/></a>
  <a href="https://github.com/askarniroomand/XRayMOD/stargazers"><img src="https://img.shields.io/github/stars/askarniroomand/XRayMOD?style=for-the-badge&color=eab308" alt="Stars"/></a>
  <a href="https://t.me/MRROBOT_DT"><img src="https://img.shields.io/badge/پشتیبانی-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram" alt="TG"/></a>
  <a href="README.md"><img src="https://img.shields.io/badge/English-README-0ea5e9?style=for-the-badge" alt="EN"/></a>
  <a href="https://github.com/askarniroomand"><img src="https://img.shields.io/badge/Author-askarniroomand-181717?style=for-the-badge&logo=github" alt="Author"/></a>
</p>

---

## XrayMOD چیه؟

پنل **self-hosted** برای ساخت و مدیریت کانفیگ روی **Cloudflare Workers + D1**:

| | |
|:--|:--|
| 🥷 | پنل پشت **UUID مخفی** — بقیه صفحه جعلی می‌بینند |
| ☁️ | بدون VPS اجباری |
| 📊 | صفحه وضعیت کاربر: حجم، روز، QR |
| 🎯 | ساب هوشمند تا **۱۰ کانفیگ** پیشنهادی |
| 🇮🇷 | UI فارسی + انگلیسی |
| ⚡ | نصب با **یک دستور** |

---

## ⚡ یک دستور · کاملاً خودکار

### 🪟 ویندوز — اگر داخل PowerShell هستی (`PS C:\...`)

```powershell
irm 'https://cdn.jsdelivr.net/gh/askarniroomand/XRayMOD@main/install.ps1' | iex
```

### 🪟 ویندوز — اگر داخل CMD هستی (مشکی بدون `PS`)

```cmd
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm 'https://cdn.jsdelivr.net/gh/askarniroomand/XRayMOD@main/install.ps1' | iex"
```

### 🐧 لینوکس / 🍎 مک / WSL

```bash
bash <(curl -fsSL https://cdn.jsdelivr.net/gh/askarniroomand/XRayMOD@main/install.sh)
```

اسکریپت **خودش** ابزارها (Node، Python/uv) را نصب می‌کند، سورس را از GitHub می‌گیرد و پنل را می‌سازد.  
**git لازم نیست.** فقط ۳ ورودی از تو:

| مرحله | ورودی |
|:-----:|:------|
| ۱ | 🔑 توکن Cloudflare |
| ۲ | 👤 نام کاربری |
| ۳ | 🔒 رمز عبور |

بقیه خودکار: D1 · UI · Worker · کانفیگ · لینک‌ها

### توکن

[ساخت API Token](https://dash.cloudflare.com/profile/api-tokens) → قالب **Edit Cloudflare Workers**

---

## ✨ قابلیت‌های تازه

- **صفحه وضعیت** `/me/<uuid>` — کاربر خودش مصرف و انقضا را می‌بیند  
- **ساب Top-10** — Direct + Clean IP + پورت‌های CF + fingerprint  
- **استیلث** — پوسته‌های 1101 / nginx / GitHub / WordPress / …  
- **Canary** — طعمه اسکنر + لاگ  
- **Backup & Audit** — پشتیبان امن + تاریخچه  
- **Kill switch** و **سقف ماهانه**  

---

## لینک‌های مهم

| لینک | کاربرد |
|:-----|:-------|
| `/<UUID_پنل>/login` | ورود ادمین (خصوصی) |
| `/sub/<UUID_کاربر>` | ساب اپ‌ها |
| `/me/<UUID_کاربر>` | صفحه وضعیت کاربر |
| `?format=clash` / `singbox` / `html` | فرمت‌های ساب |

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

## 🛠 نصب دستی

<details>
<summary><b>گام‌به‌گام</b></summary>

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

ساب و وضعیت:

```text
https://WORKER.workers.dev/sub/<USER_UUID>
https://WORKER.workers.dev/me/<USER_UUID>
```

</details>

---

## پشتیبانی و کانال

<p align="center">
  <a href="https://t.me/MRROBOT_DT"><img src="https://img.shields.io/badge/تلگرام-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram" alt="Telegram"/></a>
</p>

سوال، باگ، پیشنهاد — خوشحال می‌شیم کمک کنیم 💚  

**لطفاً لینک پنل، رمز و توکن را عمومی نفرست.**

نسخه انگلیسی: [README.md](README.md)

---

## لایسنس

[MIT](LICENSE)
