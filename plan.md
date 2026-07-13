# XRayMOD v2 — Development Plan (Updated)

**تاریخ:** 2026-07-13
**وضعیت:** در حال توسعه

---

## ویژیون نهایی

پنل مدرن Cloudflare + سرور شخصی. کاربران با اتصال سرور شخصی خود به Cloudflare، کانفیگ‌هایی با کیفیت CF ولی بدون محدودیت‌های اون تولید می‌کنن. کانفیگ‌ها قابل فروش هستن.

---

## Phase 1: Nova Worker Base + Custom Installer

### ۱.۱ Nova Worker.js
- استفاده از `worker.js` Nova-Proxy به عنوان بیس
- Nova 1101 رو حل کرده، VLESS/Trojan/SS داره، obfuscation داره
- فایل: `.references/Nova-Proxy/worker.js`

### ۱.۲ Custom Installer
- OAuth2 PKCE (مثل Nova-Wizard)
- WebUI مدرن
- Deploy ورکر Nova + D1
- نمایش آدرس نهایی پنل
- بخش Update و Delete
- فایل: `installer/app.py`

### ۱.۳ Frontend (Next.js)
- Dashboard با آمار زنده
- مدیریت کاربران (افزودن/ویرایش/حذف)
- مدیریت پروتکل‌ها
- IP تمیز + اسکنر
- تنظیمات پنل
- فایل: `frontend/app/`

---

## Phase 2: Personal Server Mode

### ۲.۱ FastAPI Backend
- اتصال سرور شخصی به CF Worker
- API سازگار با Worker
- SQLite/PostgreSQL
- فایل: `backend/main.py`

### ۲.۲ Worker ↔ Server Bridge
```
CF Worker (Proxy) ←→ VPS Backend (Management)
     ↓                      ↓
  Proxy Traffic         Config Generation
  (Edge Network)        (High Quality)
```

### ۲.۳ Config Generation
- کانفیگ‌های CF-quality بدون محدودیت CF
- قابل فروش
- VLESS/Trojan/SS با Clean IP

---

## Phase 3: Telegram Bot

### ۳.۱ Bot API
- Webhook pattern
- Inline keyboards
- HMAC login tokens

### ۳.۲ Mini App UI
- Responsive panel inside Telegram
- `tg.ready()`, `tg.expand()`
- Safe area CSS
- Dark theme

### ۳.۳ Sync with Panel
- تغییرات در پنل → آپدیت در ربات
- تغییرات در ربات → آپدیت در پنل

---

## Phase 4: Polish & Deploy

### ۴.۱ Obfuscation
- `browser-no-eval` target
- RC4 string encoding
- No `node:` imports
- No `eval()`

### ۴.۲ Testing
- Worker build + deploy
- Installer flow
- Frontend responsiveness
- Bot functionality

### ۴.۳ Documentation
- `.opencode/` structure
- README update
- API docs

---

## Research Sources

- **Nova-Proxy**: `.references/Nova-Proxy/` — Worker base (1101 solved)
- **Nova-Wizard**: `.references/Nova-Wizard/` — OAuth2 PKCE installer
- **cfnew**: `.references/cfnew-deployer/` — Stealth techniques
