import type { Env, DisguiseConfig } from './types';

const EMPTY_DISGUISE: DisguiseConfig = {
  on: false,
  adminPath: '',
  loginPath: '',
  subPath: '',
  pubAdmin: '/admin',
  pubLogin: '/login',
  fallbackPage: '1101',
};

function cleanPath(v: string | undefined): string {
  return String(v || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 40);
}

export async function getDisguiseConfig(env: Env, db: D1Database): Promise<DisguiseConfig> {
  try {
    if (env.PANEL_RECOVERY === '1' || env.PANEL_RECOVERY === 'true') {
      return { ...EMPTY_DISGUISE };
    }

    const rows = await db
      .prepare('SELECT k, v FROM kvstore WHERE k LIKE ?')
      .bind('disguise.%')
      .all<{ k: string; v: string }>();

    const settings: Record<string, string> = {};
    for (const row of rows.results) {
      settings[row.k] = row.v;
    }

    const enabled = settings['disguise.enabled'] === 'true';

    const adminPath =
      cleanPath(env.ADMIN_PATH) || cleanPath(settings['disguise.admin_path']);
    const loginPath =
      cleanPath(env.LOGIN_PATH) || cleanPath(settings['disguise.login_path']);
    const subPath =
      cleanPath(env.SUB_PATH) || cleanPath(settings['disguise.sub_path']);

    const on =
      (enabled || !!(env.ADMIN_PATH || env.LOGIN_PATH || env.SUB_PATH)) &&
      !!(adminPath || loginPath || subPath);

    if (!on) {
      return { ...EMPTY_DISGUISE, fallbackPage: settings['disguise.fallback_page'] || '1101' };
    }

    return {
      on: true,
      adminPath,
      loginPath,
      subPath,
      pubAdmin: adminPath ? '/' + adminPath : '/admin',
      pubLogin: loginPath ? '/' + loginPath : '/login',
      fallbackPage: env.DISGUISE_PAGE || settings['disguise.fallback_page'] || '1101',
    };
  } catch {
    return { ...EMPTY_DISGUISE };
  }
}

export function remapDisguisePath(
  pathname: string,
  config: DisguiseConfig
): { remapped: string; isDecoy: boolean } {
  if (!config.on) {
    return { remapped: pathname, isDecoy: false };
  }

  const clean = pathname.toLowerCase().replace(/\/+$/, '');

  if (config.adminPath && clean === '/' + config.adminPath) {
    return { remapped: '/admin', isDecoy: false };
  }
  if (config.adminPath && clean.startsWith('/' + config.adminPath + '/')) {
    return { remapped: '/admin' + clean.slice(config.adminPath.length + 1), isDecoy: false };
  }

  if (config.loginPath && clean === '/' + config.loginPath) {
    return { remapped: '/login', isDecoy: false };
  }

  if (config.subPath && clean === '/' + config.subPath) {
    return { remapped: '/sub', isDecoy: false };
  }
  if (config.subPath && clean.startsWith('/' + config.subPath + '/')) {
    return { remapped: '/sub' + clean.slice(config.subPath.length + 1), isDecoy: false };
  }

  // Real paths leaked — serve decoy
  if (clean === '/admin' || clean === '/login') {
    return { remapped: pathname, isDecoy: true };
  }

  return { remapped: pathname, isDecoy: false };
}

export function html1101(host: string): string {
  const now = new Date();
  const ts =
    now.getFullYear() +
    '-' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(now.getDate()).padStart(2, '0') +
    ' ' +
    String(now.getHours()).padStart(2, '0') +
    ':' +
    String(now.getMinutes()).padStart(2, '0') +
    ':' +
    String(now.getSeconds()).padStart(2, '0');
  const rayId = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `<!DOCTYPE html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en-US"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en-US"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en-US"> <!--<![endif]-->
<head>
<title>Worker threw exception | ${host} | Cloudflare</title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<meta name="robots" content="noindex, nofollow" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" id="cf_styles-css" href="/cdn-cgi/styles/cf.errors.css" />
<!--[if lt IE 9]><link rel="stylesheet" id='cf_styles-ie.css' href="/cdn-cgi/styles/cf.errors.ie.css" /><![endif]-->
<style>body{margin:0;padding:0}</style>

<!--[if gte IE 10]><!-->
<script>
  if (!navigator.cookieEnabled) {
    window.addEventListener('DOMContentLoaded', function () {
      var cookieEl = document.getElementById('cookie-alert');
      cookieEl.style.display = 'block';
    })
  }
</script>
<!--<![endif]-->

</head>
<body>
    <div id="cf-wrapper">
        <div class="cf-alert cf-alert-error cf-cookie-error" id="cookie-alert" data-translate="enable_cookies">Please enable cookies.</div>
        <div id="cf-error-details" class="cf-error-details-wrapper">
            <div class="cf-wrapper cf-header cf-error-overview">
                <h1>
                    <span class="cf-error-type" data-translate="error">Error</span>
                    <span class="cf-error-code">1101</span>
                    <small class="heading-ray-id">Ray ID: ${rayId} &bull; ${ts} UTC</small>
                </h1>
                <h2 class="cf-subheadline" data-translate="error_desc">Worker threw exception</h2>
            </div>

            <section></section>

            <div class="cf-section cf-wrapper">
                <div class="cf-columns two">
                    <div class="cf-column">
                        <h2 data-translate="what_happened">What happened?</h2>
                        <p>You've requested a page on a website (${host}) that is on the <a href="https://www.cloudflare.com/5xx-error-landing?utm_source=error_100x" target="_blank">Cloudflare</a> network. An unknown error occurred while rendering the page.</p>
                    </div>

                    <div class="cf-column">
                        <h2 data-translate="what_can_i_do">What can I do?</h2>
                        <p><strong>If you are the owner of this website:</strong><br />refer to <a href="https://developers.cloudflare.com/workers/observability/errors/" target="_blank">Workers - Errors and Exceptions</a> and check Workers Logs for ${host}.</p>
                    </div>
                </div>
            </div>

            <div class="cf-section cf-wrapper">
                <h2 data-translate="more_info">More information</h2>
                <p>If you are the owner of this website, you can check <a href="https://developers.cloudflare.com/workers/observability/errors/" target="_blank">Workers Logs</a> for ${host} to learn more about this error.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

export function nginxPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
  body {
    width: 35em;
    margin: 0 auto;
    font-family: Tahoma, Verdana, Arial, sans-serif;
  }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>`;
}

export function github404Page(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Page not found · GitHub · GitHub</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;background:#0d1117;color:#c9d1d9}
.wrap{max-width:540px;margin:12vh auto;padding:0 1.5rem;text-align:center}
h1{font-size:1.5rem;font-weight:600;margin:1rem 0 .5rem}
p{color:#8b949e;font-size:.95rem;line-height:1.5}
a{color:#58a6ff;text-decoration:none}
.logo{font-size:3rem;opacity:.85}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">🐈</div>
  <h1>404 — Page not found</h1>
  <p>The page you were looking for could not be found. Maybe you mistyped the address, or the page has moved.</p>
  <p style="margin-top:1.25rem"><a href="https://github.com">Return to GitHub</a></p>
</div>
</body>
</html>`;
}

export function wordpressPage(): string {
  return `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WordPress › Error</title>
<style>
body{background:#f1f1f1;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;margin:0}
.box{background:#fff;border:1px solid #c3c4c7;border-left:4px solid #d63638;box-shadow:0 1px 1px rgba(0,0,0,.04);margin:2em auto;max-width:520px;padding:1em 1.5em}
h1{font-size:1.1em;margin:0 0 .6em;color:#1d2327}
p{margin:.5em 0;color:#3c434a;font-size:14px;line-height:1.5}
</style>
</head>
<body>
<div class="box">
  <h1>There has been a critical error on this website.</h1>
  <p>Learn more about troubleshooting WordPress.</p>
</div>
</body>
</html>`;
}

export function blankPage(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title></title></head><body></body></html>`;
}

export function html1020(host: string): string {
  const rayId = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `<!DOCTYPE html>
<html lang="en-US">
<head>
<title>Access denied | ${host} | Cloudflare</title>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#fff;color:#333}
.w{max-width:60em;margin:4em auto;padding:0 1.5em}h1{font-size:1.6em}code{background:#f4f4f4;padding:.1em .35em;border-radius:3px}
.ray{color:#666;font-size:.9em;margin-top:2em}</style>
</head>
<body>
<div class="w">
  <h1>Access denied</h1>
  <p>You do not have permission to access this resource on <code>${host}</code>.</p>
  <p>If you are the site owner, check your Cloudflare security settings.</p>
  <p class="ray">Ray ID: ${rayId}</p>
</div>
</body>
</html>`;
}

export const DISGUISE_SKINS = ['1101', 'nginx', 'github', 'wordpress', 'blank', '1020'] as const;

export function getDecoyResponse(host: string, pageType: string): Response {
  const t = (pageType || '1101').toLowerCase();
  let html: string;
  let status = 200;
  switch (t) {
    case 'nginx':
      html = nginxPage();
      break;
    case 'github':
    case 'github404':
      html = github404Page();
      status = 404;
      break;
    case 'wordpress':
    case 'wp':
      html = wordpressPage();
      status = 500;
      break;
    case 'blank':
      html = blankPage();
      break;
    case '1020':
      html = html1020(host);
      status = 403;
      break;
    case '1101':
    default:
      html = html1101(host);
      break;
  }
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

/** Comma/space-separated path segments that trigger canary logging */
export async function getCanaryPaths(db: D1Database): Promise<string[]> {
  try {
    const row = await db
      .prepare('SELECT v FROM kvstore WHERE k = ?')
      .bind('disguise.canary_paths')
      .first<{ v: string }>();
    if (!row?.v || row.v === 'false') return [];
    return row.v
      .split(/[\n,;\s]+/)
      .map((s) => s.trim().toLowerCase().replace(/^\/+|\/+$/g, ''))
      .filter((s) => s.length > 0 && s.length < 64);
  } catch {
    return [];
  }
}

export function matchCanary(pathname: string, canaries: string[]): string | null {
  if (!canaries.length) return null;
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const segs = clean.split('/').filter(Boolean);
  for (const c of canaries) {
    if (clean === '/' + c || clean.endsWith('/' + c) || segs.includes(c)) return c;
  }
  return null;
}
