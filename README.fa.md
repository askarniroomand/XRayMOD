<p align="center">
  <img src="docs/assets/banner.svg" alt="XrayMOD" width="100%"/>
</p>

<p align="center">
  <b>پنل مخفی و مدرن مدیریت پروکسی روی Cloudflare Workers</b><br/>
  اوپن‌سورس · سرورلس · دوستانه · فارسی
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT"/></a>
  <a href="https://t.me/MRROBOT_DT"><img src="https://img.shields.io/badge/پشتیبانی-@MRROBOT__DT-26A5E4?style=for-the-badge&logo=telegram" alt="TG"/></a>
  <a href="README.md"><img src="https://img.shields.io/badge/English-README-0ea5e9?style=for-the-badge" alt="EN"/></a>
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
