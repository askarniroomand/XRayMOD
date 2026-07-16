/**
 * Self-contained login UI — no React/Next dependency.
 * Guarantees the submit button works even if /_next assets fail.
 */
export function renderLoginPage(origin: string, panelPrefix: string): Response {
  const prefix = panelPrefix || '';
  const panelUrl = `${prefix}/panel`;
  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="theme-color" content="#050506" />
  <title>ورود · XrayMOD</title>
  <script>window.__API_BASE=${JSON.stringify(origin)};window.__PANEL_PREFIX=${JSON.stringify(prefix)};window.__LANG=localStorage.getItem('xraymod_lang')||'fa';</script>
  <style>
    :root {
      --bg: #050506;
      --card: rgba(18, 18, 22, 0.85);
      --border: rgba(63, 63, 70, 0.65);
      --text: #fafafa;
      --muted: #71717a;
      --accent: #10b981;
      --accent2: #34d399;
      --danger: #f43f5e;
      --input: #09090b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Tahoma, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: grid;
      place-items: center;
      padding: 1.25rem;
      -webkit-font-smoothing: antialiased;
    }
    body::before {
      content: "";
      position: fixed; inset: 0; z-index: -1; pointer-events: none;
      background:
        radial-gradient(ellipse 70% 50% at 50% -10%, rgba(16,185,129,.18), transparent 55%),
        radial-gradient(ellipse 40% 30% at 100% 100%, rgba(59,130,246,.08), transparent 50%);
    }
    .wrap { width: 100%; max-width: 420px; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1.35rem;
      padding: 2rem 1.75rem 1.75rem;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      box-shadow: 0 25px 50px -12px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);
    }
    .logo {
      width: 64px; height: 64px; margin: 0 auto 1.25rem;
      border-radius: 1.1rem;
      display: grid; place-items: center;
      background: linear-gradient(145deg, #34d399, #059669);
      color: #000; font-weight: 900; font-size: 1.6rem;
      box-shadow: 0 12px 40px rgba(16,185,129,.35);
    }
    h1 { text-align: center; font-size: 1.65rem; font-weight: 900; letter-spacing: -0.03em; }
    h1 span { color: var(--accent); }
    .sub { text-align: center; color: var(--muted); font-size: .875rem; margin: .5rem 0 1.75rem; line-height: 1.6; }
    label {
      display: block; font-size: .7rem; font-weight: 700; color: #a1a1aa;
      text-transform: uppercase; letter-spacing: .08em; margin-bottom: .45rem;
    }
    .field { margin-bottom: 1rem; position: relative; }
    input {
      width: 100%;
      padding: .95rem 1rem;
      background: var(--input);
      border: 1px solid #27272a;
      border-radius: .9rem;
      color: var(--text);
      font-size: .95rem;
      transition: border-color .15s, box-shadow .15s;
      outline: none;
    }
    input:focus {
      border-color: rgba(16,185,129,.7);
      box-shadow: 0 0 0 3px rgba(16,185,129,.15);
    }
    input::placeholder { color: #3f3f46; }
    .toggle {
      position: absolute; left: .75rem; top: 2.15rem;
      background: none; border: 0; color: #52525b; cursor: pointer; font-size: .75rem; padding: .25rem;
    }
    .toggle:hover { color: #a1a1aa; }
    [dir="rtl"] .toggle { left: .75rem; right: auto; }
    [dir="rtl"] input.has-toggle { padding-left: 3rem; padding-right: 1rem; }
    .btn {
      width: 100%; margin-top: .35rem;
      padding: 1rem;
      border: 0; border-radius: .9rem;
      background: linear-gradient(180deg, var(--accent2), var(--accent));
      color: #052e1c; font-weight: 800; font-size: .95rem;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(16,185,129,.28);
      transition: transform .12s, filter .12s, opacity .12s;
    }
    .btn:hover { filter: brightness(1.05); }
    .btn:active { transform: scale(.985); }
    .btn:disabled { opacity: .55; cursor: not-allowed; transform: none; filter: none; }
    .err {
      display: none; margin: .75rem 0 0;
      padding: .85rem 1rem; border-radius: .85rem;
      background: rgba(244,63,94,.1); border: 1px solid rgba(244,63,94,.25);
      color: #fb7185; font-size: .85rem; line-height: 1.55;
    }
    .err.show { display: block; }
    .foot {
      text-align: center; margin-top: 1.25rem;
      font-size: .7rem; color: #3f3f46; line-height: 1.7;
    }
    .spin {
      display: inline-block; width: 1em; height: 1em; margin-left: .4rem;
      border: 2px solid rgba(0,0,0,.2); border-top-color: #052e1c;
      border-radius: 50%; animation: s .7s linear infinite; vertical-align: -2px;
    }
    @keyframes s { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="logo">X</div>
      <h1>Xray<span>MOD</span></h1>
      <p class="sub">ورود به پنل مدیریت پروکسی</p>

      <form id="f" autocomplete="on">
        <div class="field">
          <label for="user">نام کاربری</label>
          <input id="user" name="username" type="text" value="admin" autocomplete="username" required />
        </div>
        <div class="field">
          <label for="pass">رمز عبور</label>
          <input id="pass" class="has-toggle" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" />
          <button type="button" class="toggle" id="eye" aria-label="toggle">نمایش</button>
        </div>
        <div class="field" id="totpWrap" style="display:none">
          <label for="totp">کد Authenticator</label>
          <input id="totp" name="totp" type="text" inputmode="numeric" maxlength="6" placeholder="000000" style="text-align:center;letter-spacing:.35em;font-family:ui-monospace,monospace" />
        </div>
        <div class="err" id="err"></div>
        <button class="btn" id="go" type="submit">ورود به پنل</button>
      </form>
    </div>
    <div style="display:flex;justify-content:center;gap:.5rem;margin-top:1rem">
      <button type="button" id="langFa" style="padding:.35rem .7rem;border-radius:.5rem;border:1px solid #27272a;background:#10b981;color:#000;font-weight:800;font-size:.7rem;cursor:pointer">FA</button>
      <button type="button" id="langEn" style="padding:.35rem .7rem;border-radius:.5rem;border:1px solid #27272a;background:#09090b;color:#a1a1aa;font-weight:800;font-size:.7rem;cursor:pointer">EN</button>
    </div>
    <p class="foot" id="foot">دسترسی مخفی · Cloudflare Workers<br/>Stealth panel</p>
  </div>

  <script>
(function () {
  var API = (window.__API_BASE || location.origin).replace(/\\/$/, '');
  var PREFIX = window.__PANEL_PREFIX || '';
  var form = document.getElementById('f');
  var err = document.getElementById('err');
  var go = document.getElementById('go');
  var eye = document.getElementById('eye');
  var pass = document.getElementById('pass');
  var totpWrap = document.getElementById('totpWrap');
  var challenge = null;
  var lang = localStorage.getItem('xraymod_lang') || 'fa';
  var i18n = {
    fa: { title: 'ورود به پنل مدیریت پروکسی', user: 'نام کاربری', pass: 'رمز عبور', go: 'ورود به پنل', show: 'نمایش', hide: 'مخفی', bad: 'نام کاربری یا رمز اشتباه است', net: 'خطای شبکه — دوباره تلاش کنید', ok: 'موفق — در حال انتقال...' },
    en: { title: 'Sign in to proxy panel', user: 'Username', pass: 'Password', go: 'Sign in', show: 'Show', hide: 'Hide', bad: 'Invalid username or password', net: 'Network error — try again', ok: 'OK — redirecting...' }
  };
  function applyLang() {
    var t = i18n[lang] || i18n.fa;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    var sub = document.querySelector('.sub'); if (sub) sub.textContent = t.title;
    var labs = document.querySelectorAll('label');
    if (labs[0]) labs[0].textContent = t.user;
    if (labs[1]) labs[1].textContent = t.pass;
    go.textContent = t.go;
    eye.textContent = pass.type === 'password' ? t.show : t.hide;
    document.getElementById('langFa').style.background = lang==='fa' ? '#10b981' : '#09090b';
    document.getElementById('langFa').style.color = lang==='fa' ? '#000' : '#a1a1aa';
    document.getElementById('langEn').style.background = lang==='en' ? '#10b981' : '#09090b';
    document.getElementById('langEn').style.color = lang==='en' ? '#000' : '#a1a1aa';
  }
  document.getElementById('langFa').onclick = function(){ lang='fa'; localStorage.setItem('xraymod_lang','fa'); applyLang(); };
  document.getElementById('langEn').onclick = function(){ lang='en'; localStorage.setItem('xraymod_lang','en'); applyLang(); };
  applyLang();

  eye.addEventListener('click', function () {
    var show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    var t = i18n[lang] || i18n.fa;
    eye.textContent = show ? t.hide : t.show;
  });

  function showError(msg) {
    err.textContent = msg || 'خطا';
    err.classList.add('show');
  }
  function clearError() {
    err.textContent = '';
    err.classList.remove('show');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();
    clearError();
    go.disabled = true;
    var old = go.innerHTML;
    go.innerHTML = 'در حال ورود <span class="spin"></span>';

    var body;
    if (challenge) {
      body = { challenge: challenge, totp: document.getElementById('totp').value.trim() };
    } else {
      body = {
        username: document.getElementById('user').value.trim(),
        password: pass.value
      };
    }

    try {
      var res = await fetch(API + '/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body)
      });
      var data = {};
      try { data = await res.json(); } catch (_) {}

      if (data.require2fa && data.challenge) {
        challenge = data.challenge;
        totpWrap.style.display = 'block';
        document.getElementById('totp').required = true;
        document.getElementById('totp').focus();
        go.disabled = false;
        go.innerHTML = 'تأیید کد';
        return;
      }

      if (data.success) {
        go.innerHTML = 'موفق — در حال انتقال...';
        location.replace(PREFIX + '/panel');
        return;
      }

      var tt = i18n[lang] || i18n.fa;
      showError(data.message || data.error || tt.bad);
      go.disabled = false;
      go.innerHTML = old;
    } catch (err2) {
      var tt2 = i18n[lang] || i18n.fa;
      showError(tt2.net);
      go.disabled = false;
      go.innerHTML = old;
    }
  });
})();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
