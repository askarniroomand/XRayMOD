# XrayMOD — راهنمای فارسی

## نصب برای همه (فقط یک دستور)

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/EvolveBeyond/XRayMOD/refs/heads/main/install.sh)
```

### چی از کاربر می‌پرسد؟

1. **توکن Cloudflare**  
2. **نام کاربری** پنل  
3. **رمز عبور** پنل  

سپس خودکار: ساخت D1، بیلد UI، دیپلوی Worker، ساخت کانفیگ پیشنهادی، چاپ لینک‌ها.

### توکن از کجا؟

[ساخت API Token](https://dash.cloudflare.com/profile/api-tokens) → قالب **Edit Cloudflare Workers**

### پشتیبانی

[@MRROBOT_DT](https://t.me/MRROBOT_DT)

### توصیه کانفیگ

**VLESS + WebSocket + TLS** روی پورت **443** — بهترین حالت برای Cloudflare Workers.

### امنیت

- لینک پنل شامل UUID مخفی است؛ فقط خودت نگه دار.  
- توکن API را در چت عمومی نفرست.  
- بعد از نصب رمز قوی بگذار.
