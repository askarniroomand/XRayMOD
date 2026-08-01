# XrayMOD Telegram Bot

ربات پایتون جدا برای ساخت / حذف / آپدیت پنل روی Cloudflare.

## قابلیت‌ها

- گرفتن **توکن CF** → **یوزر** → **رمز** و ساخت پنل کامل
- چند پنل برای هر کاربر
- حذف پنل (Worker + D1)
- دکمه **آپدیت** → `git pull` آخرین `main` + rebuild + redeploy

## نیازمندی‌ها روی سرور

- Python 3.10+
- Node.js + npm
- git
- دسترسی شبکه به Cloudflare و GitHub

## نصب و اجرا (همیشه روشن)

```bash
cd telegram-bot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# BOT_TOKEN را از @BotFather بگذار
nano .env
python bot.py
```

با systemd (نمونه):

```ini
[Unit]
Description=XrayMOD Telegram Bot
After=network.target

[Service]
WorkingDirectory=/opt/xraymod/telegram-bot
ExecStart=/opt/xraymod/telegram-bot/.venv/bin/python bot.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

## امنیت

- توکن‌ها در SQLite محلی (`panels.db`) ذخیره می‌شوند — فایل را محافظت کن
- برای قفل کردن ربات: `ALLOW_USER_IDS=123456789`
- توکن CF را فقط در چت خصوصی بفرست
