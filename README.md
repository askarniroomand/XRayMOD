# XrayMOD

A modular proxy management panel built on Cloudflare Workers with React, Tailwind CSS v4, and shadcn/ui.

[English](#english) | [فارسی](#persian)

---

## English

### Features

- **Proxy Engine**: VLESS, Trojan, Shadowsocks over WebSocket with traffic tracking
- **Admin Panel**: Dashboard, node management, user management, protocol configuration, settings
- **User Panel**: Subscription dashboard, marketplace, referral program, payment, profile
- **Modular Protocols**: Define new protocols via JSON schema + Xray config templates
- **Subscription Links**: Auto-generate configs for Clash, sing-box, V2RayNG, and base64
- **Dark Theme**: Emerald accent color scheme with responsive design
- **Optional Integrations**: Telegram Bot and TON Wallet (requires external server)
- **One-Click Deploy**: Wizard script to deploy panel to other users' Cloudflare accounts

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Worker (Single deployment)                  │
│                                                         │
│  ┌─────────────┐  ┌──────────────────────────────────┐  │
│  │ Static Assets│  │ API Router                       │  │
│  │ (React SPA)  │  │ /api/login, /api/users           │  │
│  │              │  │ /api/nodes, /api/protocols        │  │
│  └─────────────┘  │ /api/configs, /api/settings       │  │
│                    │ /sub/:token (subscription)        │  │
│                    │ /proxy/* (traffic handler)        │  │
│                    └──────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ D1 Database                                        ││
│  │ users | protocols | configs | kvstore              ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Cloudflare account](https://dash.cloudflare.com/) with Workers enabled
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)

### Installation (Cloudflare Dashboard)

#### Step 1: Create D1 Database

1. Go to Cloudflare Dashboard → Workers & Pages → D1
2. Click "Create a database"
3. Name it `xraymod-db`
4. Copy the Database ID

#### Step 2: Create Worker

1. Go to Workers & Pages → Create Application
2. Click "Create Worker"
3. Name it `xraymod`
4. Click "Deploy" (we'll update the code later)

#### Step 3: Upload Code

1. Install Wrangler CLI: `npm install -g wrangler`
2. Clone the repository:
   ```bash
   git clone https://github.com/EvolveBeyond/XRayMOD.git
   cd XRayMOD
   npm install
   ```
3. Update `wrangler.toml` with your D1 database ID
4. Build and deploy:
   ```bash
   npm run deploy
   ```

#### Step 4: Set Environment Variables

In the Cloudflare Dashboard → Workers → xraymod → Settings → Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `ADMIN_PASSWORD` | Your password | Initial admin password |
| `ENABLE_TELEGRAM` | `false` | Enable Telegram bot |
| `ENABLE_TON_WALLET` | `false` | Enable TON wallet |

#### Step 5: Access Your Panel

Visit `https://xraymod.<your-subdomain>.workers.dev`

Default login:
- **Admin**: `admin` / `admin`
- **User**: `user` / `user`

> Change these passwords immediately!

### Wizard Deployment (One-Click)

The Wizard allows you to deploy XRayMOD to other users' Cloudflare accounts using their API token.

#### Setup Wizard

1. Deploy the wizard Worker:
   ```bash
   cd wizard
   wrangler deploy
   ```

2. Access the wizard at `https://xraymod-wizard.<your-subdomain>.workers.dev`

3. (Optional) Set `WIZARD_SECRET` environment variable to protect the wizard

#### Using the Wizard

1. Open the wizard URL
2. Enter the target user's Cloudflare API token
3. Click "Deploy to Cloudflare"
4. The panel is deployed and the user gets their URL

#### API Token Permissions

The API token needs these permissions:
- `Account: Workers Scripts: Edit`
- `Account: D1: Edit`
- `Account: Workers KV Storage: Edit`

### Conditional Features

#### External Server Mode

Some features require a separate Node.js server:

| Feature | Base (Worker) | With External Server |
|---------|---------------|---------------------|
| Telegram Bot | Disabled | Enabled |
| TON Wallet | Disabled | Enabled |
| Custom JSON Configs | Disabled | Enabled |

To enable, set `EXTERNAL_SERVER_URL` in environment variables.

#### Custom JSON Configurations

By default, custom JSON configs are blocked on the base Worker. To use them:

1. Set up a Node.js server
2. Set `EXTERNAL_SERVER_URL` to your server URL
3. Enable in admin Settings → Integrations

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/login` | Authenticate user |
| GET | `/api/nodes` | List proxy nodes |
| POST | `/api/nodes` | Add new node |
| GET | `/api/users` | List users (admin) |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/:id` | Update user (admin) |
| GET | `/api/protocols` | List protocols (admin) |
| POST | `/api/protocols` | Add protocol (admin) |
| GET | `/api/configs` | List configs (admin) |
| POST | `/api/configs` | Create config (admin) |
| GET | `/api/settings` | Get settings (admin) |
| PUT | `/api/settings` | Update settings (admin) |
| GET | `/sub/:token` | User subscription link |

### Subscription Links

Users access their subscription at:
```
https://your-worker.workers.dev/sub/<user-uuid>
```

Supported formats (via `?format=` query parameter):
- `base64` (default) — Base64-encoded URI list
- `clash` — Clash/Mihomo YAML config
- `singbox` — sing-box JSON config

### Git Repository Fix

If you encounter these errors when pushing:

```
fatal: unknown index entry format 0x6c540000
error: remote origin already exists
error: src refspec main does not match any
```

Run this fix script:

```bash
#!/bin/bash
# Fix Git Repository Issues

echo "Fixing Git repository..."

# Remove corrupted index
rm -f .git/index

# Reinitialize Git
git init

# Rename branch to main
git branch -M main

# Remove existing remote
git remote remove origin 2>/dev/null || true

# Add remote
git remote add origin git@github.com:EvolveBeyond/XRayMOD.git

# Stage and commit
git add .
git commit -m "Initial commit"

# Push
git push -u origin main

echo "Done!"
```

### Troubleshooting

**Worker won't deploy**
- Check Wrangler is logged in: `wrangler whoami`
- Verify D1 database ID in `wrangler.toml`

**API returns 401**
- Ensure `ADMIN_PASSWORD` is set in environment variables
- Check the password matches what you're entering

**Subscription link not working**
- Verify user has active status and valid expiry date
- Check the UUID is correct in the URL

### License

MIT

---

## فارسی

### ویژگی‌ها

- **موتور پروکسی**: VLESS، Trojan، Shadowsocks روی WebSocket با ردیابی ترافیک
- **پنل مدیریت**: داشبورد، مدیریت سرورها، مدیریت کاربران، پیکربندی پروتکل‌ها، تنظیمات
- **پنل کاربر**: داشبورد اشتراک، بازار، برنامه ارجاع، پرداخت، پروفایل
- **پروتکل‌های ماژولار**: تعریف پروتکل‌های جدید از طریق JSON schema + قالب‌های Xray
- **لینک‌های اشتراک**: تولید خودکار پیکربندی برای Clash، sing-box، V2RayNG و base64
- **حالت تاریک**: طرح رنگی زمردی با طراحی واکنشگرا
- **یکپارچگی‌های اختیاری**: ربات تلگرام و کیف پول TON (نیاز به سرور جداگانه)
- **استقرار با یک کلیک**: اسکریپت ویزار برای استقرار پنل روی حساب‌های Cloudflare دیگران

### معماری

```
┌─────────────────────────────────────────────────────────┐
│  کلاودفلر ورکر (استقرار واحد)                            │
│                                                         │
│  ┌─────────────┐  ┌──────────────────────────────────┐  │
│  │ دارایی‌های   │  │ مسیریاب API                       │  │
│  │ استاتیک      │  │ /api/login، /api/users            │  │
│  │ (React SPA)  │  │ /api/nodes، /api/protocols        │  │
│  └─────────────┘  │ /api/configs، /api/settings       │  │
│                    │ /sub/:token (اشتراک)              │  │
│                    │ /proxy/* (هدایت ترافیک)           │  │
│                    └──────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ پایگاه داده D1                                     ││
│  │ users | protocols | configs | kvstore              ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### پیش‌نیازها

- [Node.js](https://nodejs.org/) نسخه ۱۸ یا بالاتر
- [حساب کلاودفلر](https://dash.cloudflare.com/) با Workers فعال
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)

### نصب (از طریق داشبورد کلاودفلر)

#### مرحله ۱: ایجاد پایگاه داده D1

1. به داشبورد کلاودفلر → Workers & Pages → D1 بروید
2. روی «ایجاد پایگاه داده» کلیک کنید
3. نام آن را `xraymod-db` بگذارید
4. شناسه پایگاه داده را کپی کنید

#### مرحله ۲: ایجاد ورکر

1. به Workers & Pages → Create Application بروید
2. روی «Create Worker» کلیک کنید
3. نام آن را `xraymod` بگذارید
4. روی «Deploy» کلیک کنید (بعداً کد را به‌روزرسانی می‌کنیم)

#### مرحله ۳: آپلود کد

1. نصب Wrangler CLI: `npm install -g wrangler`
2. کلون کردن مخزن:
   ```bash
   git clone https://github.com/EvolveBeyond/XRayMOD.git
   cd XRayMOD
   npm install
   ```
3. `wrangler.toml` را با شناسه پایگاه داده D1 خود به‌روزرسانی کنید
4. بسازید و استقرار دهید:
   ```bash
   npm run deploy
   ```

#### مرحله ۴: تنظیم متغیرهای محیطی

در داشبورد کلاودفلر → Workers → xraymod → Settings → Variables:

| متغیر | مقدار | توضیحات |
|--------|-------|---------|
| `ADMIN_PASSWORD` | رمز عبور شما | رمز عبور اولیه مدیر |
| `ENABLE_TELEGRAM` | `false` | فعال‌سازی ربات تلگرام |
| `ENABLE_TON_WALLET` | `false` | فعال‌سازی کیف پول TON |

#### مرحله ۵: دسترسی به پنل

به آدرس `https://xraymod.<your-subdomain>.workers.dev` بروید

ورود پیش‌فرض:
- **مدیر**: `admin` / `admin`
- **کاربر**: `user` / `user`

> فوراً این رمزهای عبور را تغییر دهید!

### استقرار با ویزار (با یک کلیک)

ویزار به شما امکان می‌دهد XRayMOD را با استفاده از توکن API کاربران دیگر روی حساب Cloudflare آنها استقرار دهید.

#### راه‌اندازی ویزار

1. ورکر ویزار را استقرار دهید:
   ```bash
   cd wizard
   wrangler deploy
   ```

2. ویزار را در `https://xraymod-wizard.<your-subdomain>.workers.dev` باز کنید

3. (اختیاری) متغیر محیطی `WIZARD_SECRET` را برای محافظت از ویزار تنظیم کنید

#### استفاده از ویزار

1. URL ویزار را باز کنید
2. توکن API کلاودفلر کاربر مورد نظر را وارد کنید
3. روی «Deploy to Cloudflare» کلیک کنید
4. پنل استقرار می‌یابد و کاربر URL خود را دریافت می‌کند

#### مجوزهای توکن API

توکن API به این مجوزها نیاز دارد:
- `Account: Workers Scripts: Edit`
- `Account: D1: Edit`
- `Account: Workers KV Storage: Edit`

### ویژگی‌های مشروط

#### حالت سرور خارجی

برخی ویژگی‌ها به یک سرور Node.js جداگانه نیاز دارند:

| ویژگی | پایه (ورکر) | با سرور خارجی |
|--------|------------|--------------|
| ربات تلگرام | غیرفعال | فعال |
| کیف پول TON | غیرفعال | فعال |
| پیکربندی JSON سفارشی | غیرفعال | فعال |

برای فعال‌سازی، `EXTERNAL_SERVER_URL` را در متغیرهای محیطی تنظیم کنید.

#### پیکربندی‌های JSON سفارشی

به‌طور پیش‌فرض، پیکربندی‌های JSON سفارشی در ورکر پایه مسدود هستند. برای استفاده:

1. یک سرور Node.js راه‌اندازی کنید
2. `EXTERNAL_SERVER_URL` را به URL سرور خود تنظیم کنید
3. در پنل مدیریت → یکپارچگی‌ها فعال کنید

### پایانه‌های API

| متد | مسیر | توضیحات |
|-----|------|---------|
| POST | `/api/login` | احراز هویت کاربر |
| GET | `/api/nodes` | لیست سرورهای پروکسی |
| POST | `/api/nodes` | افزودن سرور جدید |
| GET | `/api/users` | لیست کاربران (مدیر) |
| POST | `/api/users` | ایجاد کاربر (مدیر) |
| PUT | `/api/users/:id` | به‌روزرسانی کاربر (مدیر) |
| GET | `/api/protocols` | لیست پروتکل‌ها (مدیر) |
| POST | `/api/protocols` | افزودن پروتکل (مدیر) |
| GET | `/api/configs` | لیست پیکربندی‌ها (مدیر) |
| POST | `/api/configs` | ایجاد پیکربندی (مدیر) |
| GET | `/api/settings` | دریافت تنظیمات (مدیر) |
| PUT | `/api/settings` | به‌روزرسانی تنظیمات (مدیر) |
| GET | `/sub/:token` | لینک اشتراک کاربر |

### لینک‌های اشتراک

کاربران به اشتراک خود از این آدرس دسترسی دارند:
```
https://your-worker.workers.dev/sub/<user-uuid>
```

فرمت‌های پشتیبانی شده (از طریق پارامتر `?format=`):
- `base64` (پیش‌فرض) — لیست URI رمزگذاری شده base64
- `clash` — پیکربندی YAML Clash/Mihomo
- `singbox` — پیکربندی JSON sing-box
### عیب‌یابی

**ورکر استقرار نمی‌یابد**
- وارد بودن Wrangler را بررسی کنید: `wrangler whoami`
- شناسه پایگاه داده D1 در `wrangler.toml` را تأیید کنید

**API خطای 401 برمی‌گرداند**
- تنظیم `ADMIN_PASSWORD` در متغیرهای محیطی را بررسی کنید
- مطابقت رمز عبور با آنچه وارد می‌کنید را بررسی کنید

**لینک اشتراک کار نمی‌کند**
- فعال بودن وضعیت کاربر و تاریخ انقضای معتبر را بررسی کنید
- صحت UUID در URL را بررسی کنید

### مجوز

MIT
