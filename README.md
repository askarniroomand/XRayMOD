# XrayMOD

> A modular proxy management panel built on Cloudflare Workers with React, shadcn/ui, and Tailwind CSS v4.

[English](#english) | [فارسی](#persian-فارسی)

---

## English

### Overview

XrayMOD is a serverless proxy management panel that runs entirely on Cloudflare Workers. It provides a complete admin dashboard for managing proxy protocols (VLESS, Trojan, Shadowsocks), users, and subscription links.

### Features

| Feature | Description |
|---------|-------------|
| **Proxy Engine** | VLESS, Trojan, Shadowsocks over WebSocket with traffic tracking |
| **Admin Panel** | Dashboard, node management, user management, protocol configuration |
| **User Panel** | Subscription dashboard, marketplace, referral program, payment, profile |
| **Modular Protocols** | Define new protocols via JSON schema + Xray config templates |
| **Subscription Links** | Auto-generate configs for Clash, sing-box, V2RayNG, and base64 |
| **Dark Theme** | Emerald accent color scheme with responsive design |
| **Optional Integrations** | Telegram Bot and TON Wallet (requires external server) |
| **Wizard Deployer** | One-click deployment to other users' Cloudflare accounts |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Worker                                       │
│  ┌─────────────┐  ┌──────────────────────────────────┐  │
│  │ Static Assets│  │ API Router                       │  │
│  │ (React SPA)  │  │ /api/login, /api/logout          │  │
│  │              │  │ /api/users, /api/nodes            │  │
│  └─────────────┘  │ /api/protocols, /api/configs      │  │
│                    │ /api/settings, /api/health        │  │
│                    │ /sub/:token (subscription)        │  │
│                    │ /proxy/* (traffic handler)        │  │
│                    └──────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐│
│  │ D1 Database: users | protocols | configs | kvstore ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Quick Start

#### Option 1: Manual Deployment (Cloudflare Dashboard)

**Step 1: Create D1 Database**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → D1
2. Click **Create a database**
3. Name it `xraymod-db`
4. Copy the **Database ID**

**Step 2: Clone and Build**

```bash
git clone https://github.com/EvolveBeyond/XRayMOD.git
cd XRayMOD
npm install
```

**Step 3: Configure Wrangler**

Update `wrangler.toml` with your D1 database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "xraymod-db"
database_id = "your-d1-database-id-here"
```

**Step 4: Deploy**

```bash
npm run deploy
```

**Step 5: Set Admin Password**

In Cloudflare Dashboard → Workers → xraymod → Settings → Variables:

| Variable | Value |
|----------|-------|
| `ADMIN_PASSWORD` | Your secure password |

**Step 6: Access Your Panel**

Visit `https://xraymod.<your-subdomain>.workers.dev`

Default login: `admin` / `admin`

> ⚠️ Change the default password immediately!

#### Option 2: Wizard Deployment (One-Click)

The Wizard allows deploying XRayMOD to other users' Cloudflare accounts using their API token.

**Setup Wizard:**

```bash
cd wizard
wrangler deploy
```

**Using the Wizard:**

1. Open `https://xraymod-wizard.<your-subdomain>.workers.dev`
2. Enter the target user's Cloudflare API token
3. Click **Deploy to Cloudflare**
4. Share the deployed URL with the user

**Required API Token Permissions:**

- `Account: Workers Scripts: Edit`
- `Account: D1: Edit`

### Conditional Features

Some features require a separate Node.js server:

| Feature | Base (Worker) | With External Server |
|---------|---------------|---------------------|
| Telegram Bot | Disabled | Enabled |
| TON Wallet | Disabled | Enabled |
| Custom JSON Configs | Disabled | Enabled |

To enable, set `EXTERNAL_SERVER_URL` in environment variables.

### API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/login` | Authenticate user | No |
| POST | `/api/logout` | Logout user | Yes |
| GET | `/api/health` | Health check | No |
| GET | `/api/nodes` | List nodes | Admin |
| POST | `/api/nodes` | Add node | Admin |
| GET | `/api/users` | List users | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| GET | `/api/protocols` | List protocols | Admin |
| POST | `/api/protocols` | Add protocol | Admin |
| GET | `/api/configs` | List configs | Admin |
| POST | `/api/configs` | Create config | Admin |
| GET | `/api/settings` | Get settings | Admin |
| PUT | `/api/settings` | Update settings | Admin |
| GET | `/sub/:token` | User subscription | No |

### Subscription Links

Access subscription at:
```
https://your-worker.workers.dev/sub/<user-uuid>
```

**Supported formats** (via `?format=` parameter):
- `base64` (default) — Base64-encoded URI list
- `clash` — Clash/Mihomo YAML config
- `singbox` — sing-box JSON config

### Project Structure

```
XRayMOD/
├── worker/              # Cloudflare Worker source
│   ├── index.ts         # Entry point
│   ├── router.ts        # Request routing
│   ├── auth.ts          # Authentication
│   ├── schema.ts        # D1 database schema
│   ├── types.ts         # TypeScript types
│   ├── api/             # API handlers
│   ├── proxy/           # Proxy traffic engine
│   └── subscription.ts  # Subscription generation
├── src/                 # React frontend
│   ├── App.tsx          # Main application
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind CSS v4 theme
├── components/ui/       # shadcn/ui components
├── wizard/              # One-click deployer
├── wrangler.toml        # Cloudflare config
└── ROADMAP.md           # Development roadmap
```

### Troubleshooting

#### Git Push Errors

If you encounter `fatal: unknown index entry format 0x6c540000`:

```bash
# Fix corrupted index
rm -f .git/index
git init
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:EvolveBeyond/XRayMOD.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

#### Worker Won't Deploy

1. Verify Wrangler is logged in: `wrangler whoami`
2. Check D1 database ID in `wrangler.toml`
3. Ensure all dependencies are installed: `npm install`

#### API Returns 401

1. Ensure `ADMIN_PASSWORD` is set in environment variables
2. Clear browser cookies and try again
3. Check the password matches what you're entering

### License

MIT

---

## فارسی (فارسی)

### معرفی

XrayMOD یک پنل مدیریت پروکسی سرورلس است که به‌طور کامل روی Cloudflare Workers اجرا می‌شود. این پنل یک داشبورد کامل برای مدیریت پروتکل‌های پروکسی (VLESS، Trojan، Shadowsocks)، کاربران و لینک‌های اشتراک فراهم می‌کند.

### ویژگی‌ها

| ویژگی | توضیحات |
|-------|---------|
| **موتور پروکسی** | VLESS، Trojan، Shadowsocks روی WebSocket با ردیابی ترافیک |
| **پنل مدیریت** | داشبورد، مدیریت سرورها، مدیریت کاربران، پیکربندی پروتکل‌ها |
| **پنل کاربر** | داشبورد اشتراک، بازار، برنامه ارجاع، پرداخت، پروفایل |
| **پروتکل‌های ماژولار** | تعریف پروتکل‌های جدید از طریق JSON schema |
| **لینک‌های اشتراک** | تولید خودکار پیکربندی برای Clash، sing-box، V2RayNG |
| **حالت تاریک** | طرح رنگی زمردی با طراحی واکنشگرا |
| **یکپارچگی‌های اختیاری** | ربات تلگرام و کیف پول TON |
| **ویزار استقرار** | استقرار با یک کلیک روی حساب‌های Cloudflare دیگران |

### شروع سریع

#### گزینه ۱: استقرار دستی (داشبورد کلاودفلر)

**مرحله ۱: ایجاد پایگاه داده D1**

1. به [داشبورد کلاودفلر](https://dash.cloudflare.com/) → Workers & Pages → D1 بروید
2. روی **ایجاد پایگاه داده** کلیک کنید
3. نام آن را `xraymod-db` بگذارید
4. **شناسه پایگاه داده** را کپی کنید

**مرحله ۲: کلون و بیلد**

```bash
git clone https://github.com/EvolveBeyond/XRayMOD.git
cd XRayMOD
npm install
```

**مرحله ۳: پیکربندی Wrangler**

شناسه پایگاه داده D1 خود را در `wrangler.toml` وارد کنید:

```toml
[[d1_databases]]
binding = "DB"
database_name = "xraymod-db"
database_id = "your-d1-database-id-here"
```

**مرحله ۴: استقرار**

```bash
npm run deploy
```

**مرحله ۵: تنظیم رمز عبور مدیر**

در داشبورد کلاودفلر → Workers → xraymod → Settings → Variables:

| متغیر | مقدار |
|--------|-------|
| `ADMIN_PASSWORD` | رمز عبور امن شما |

**مرحله ۶: دسترسی به پنل**

به آدرس `https://xraymod.<your-subdomain>.workers.dev` بروید

ورود پیش‌فرض: `admin` / `admin`

> ⚠️ فوراً رمز عبور پیش‌فرض را تغییر دهید!

#### گزینه ۲: استقرار با ویزار (با یک کلیک)

ویزار امکان استقرار XRayMOD روی حساب‌های Cloudflare دیگران با استفاده از توکن API آنها را فراهم می‌کند.

**راه‌اندازی ویزار:**

```bash
cd wizard
wrangler deploy
```

**استفاده از ویزار:**

1. `https://xraymod-wizard.<your-subdomain>.workers.dev` را باز کنید
2. توکن API کلاودفلر کاربر مورد نظر را وارد کنید
3. روی **Deploy to Cloudflare** کلیک کنید
4. URL استقرار شده را با کاربر به اشتراک بگذارید

**مجوزهای توکن API مورد نیاز:**

- `Account: Workers Scripts: Edit`
- `Account: D1: Edit`

### ویژگی‌های مشروط

برخی ویژگی‌ها به یک سرور Node.js جداگانه نیاز دارند:

| ویژگی | پایه (ورکر) | با سرور خارجی |
|--------|------------|--------------|
| ربات تلگرام | غیرفعال | فعال |
| کیف پول TON | غیرفعال | فعال |
| پیکربندی JSON سفارشی | غیرفعال | فعال |

برای فعال‌سازی، `EXTERNAL_SERVER_URL` را در متغیرهای محیطی تنظیم کنید.

### پایانه‌های API

| متد | مسیر | توضیحات | احراز هویت |
|-----|------|---------|-----------|
| POST | `/api/login` | احراز هویت کاربر | خیر |
| POST | `/api/logout` | خروج کاربر | بله |
| GET | `/api/health` | بررسی سلامت | خیر |
| GET | `/api/nodes` | لیست سرورها | مدیر |
| POST | `/api/nodes` | افزودن سرور | مدیر |
| GET | `/api/users` | لیست کاربران | مدیر |
| POST | `/api/users` | ایجاد کاربر | مدیر |
| PUT | `/api/users/:id` | به‌روزرسانی کاربر | مدیر |
| GET | `/api/protocols` | لیست پروتکل‌ها | مدیر |
| POST | `/api/protocols` | افزودن پروتکل | مدیر |
| GET | `/api/configs` | لیست پیکربندی‌ها | مدیر |
| POST | `/api/configs` | ایجاد پیکربندی | مدیر |
| GET | `/api/settings` | دریافت تنظیمات | مدیر |
| PUT | `/api/settings` | به‌روزرسانی تنظیمات | مدیر |
| GET | `/sub/:token` | لینک اشتراک کاربر | خیر |

### لینک‌های اشتراک

دسترسی به اشتراک:
```
https://your-worker.workers.dev/sub/<user-uuid>
```

**فرمت‌های پشتیبانی شده** (از طریق پارامتر `?format=`):
- `base64` (پیش‌فرض) — لیست URI رمزگذاری شده
- `clash` — پیکربندی YAML Clash/Mihomo
- `singbox` — پیکربندی JSON sing-box

### ساختار پروژه

```
XRayMOD/
├── worker/              # سورس ورکر کلاودفلر
│   ├── index.ts         # نقطه ورود
│   ├── router.ts        # مسیریابی درخواست‌ها
│   ├── auth.ts          # احراز هویت
│   ├── schema.ts        # شema پایگاه داده D1
│   ├── types.ts         # تایپ‌های TypeScript
│   ├── api/             # هندلرهای API
│   ├── proxy/           # موتور ترافیک پروکسی
│   └── subscription.ts  # تولید اشتراک
├── src/                 # فرانت‌اند React
│   ├── App.tsx          # برنامه اصلی
│   ├── main.tsx         # نقطه ورود
│   └── index.css        # تم Tailwind CSS v4
├── components/ui/       # کامپوننت‌های shadcn/ui
├── wizard/              # ابزار استقرار یک کلیکی
├── wrangler.toml        # پیکربندی کلاودفلر
└── ROADMAP.md           # نقشه راه توسعه
```

### عیب‌یابی

#### خطاهای Git Push

اگر با خطای `fatal: unknown index entry format 0x6c540000` مواجه شدید:

```bash
# رفع ایندکس خراب
rm -f .git/index
git init
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:EvolveBeyond/XRayMOD.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

#### ورکر استقرار نمی‌یابد

1. وارد بودن Wrangler را بررسی کنید: `wrangler whoami`
2. شناسه پایگاه داده D1 در `wrangler.toml` را تأیید کنید
3. نصب بودن تمام وابستگی‌ها را بررسی کنید: `npm install`

#### API خطای 401 برمی‌گرداند

1. تنظیم `ADMIN_PASSWORD` در متغیرهای محیطی را بررسی کنید
2. کوکی‌های مرورگر را پاک کرده و دوباره تلاش کنید
3. مطابقت رمز عبور با آنچه وارد می‌کنید را بررسی کنید

### مجوز

MIT
