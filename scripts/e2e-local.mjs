/**
 * Local E2E against wrangler dev --local — Gen 5.1.1 SECURE PATH aware.
 * Flow: wait /install → bootstrap → API under /{SECURE}/api → sub under /{SECURE}/sub
 *
 * Run: npm run test:e2e
 * Requires: npm run build:ui first (or uses existing frontend/out)
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8799;
const BASE = `http://127.0.0.1:${PORT}`;
const ADMIN_PASS = 'TestPass123!';

function log(msg) {
  console.log(`  ${msg}`);
}

async function waitForInstall(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/install`);
      if (r.status === 200 || r.status === 302) return;
    } catch {
      /* retry */
    }
    await sleep(800);
  }
  throw new Error('wrangler dev did not become ready in time');
}

async function json(res) {
  const t = await res.text();
  try {
    return JSON.parse(t);
  } catch {
    return { raw: t, status: res.status };
  }
}

async function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  console.log('\nXRayMOD local E2E (Gen 5.1.1)\n');

  if (!fs.existsSync(path.join(ROOT, 'frontend/out/index.html'))) {
    console.log('Building UI…');
    await run('npm', ['run', 'build:ui'], ROOT);
  }

  console.log(`Starting wrangler dev --local on :${PORT}…`);
  const child = spawn(
    'npx',
    ['wrangler', 'dev', '--local', '--port', String(PORT), '--ip', '127.0.0.1'],
    {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    }
  );

  let stderr = '';
  child.stderr.on('data', (d) => {
    stderr += d.toString();
  });
  child.stdout.on('data', (d) => {
    const s = d.toString();
    if (process.env.VERBOSE) process.stdout.write(s);
  });

  const cleanup = () => {
    try {
      child.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });

  try {
    await waitForInstall();
    log('worker ready');

    // Public /api/health before install may 404 (not configured) — install first
    let secure = '';
    {
      const r = await fetch(`${BASE}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: ADMIN_PASS }),
      });
      const body = await json(r);
      assert.equal(body.success, true, `install failed: ${JSON.stringify(body)}`);
      assert.ok(body.accessUUID, 'missing accessUUID');
      secure = `/${body.accessUUID}`;
      log(`✓ POST /install → SECURE PATH ${body.accessUUID.slice(0, 8)}…`);
    }

    const api = (p) => `${BASE}${secure}${p}`;

    // Bare public fingerprints must be closed
    {
      const r = await fetch(`${BASE}/api/health`);
      assert.equal(r.status, 404, 'bare /api/health should 404');
      const r2 = await fetch(`${BASE}/sub/does-not-exist`);
      assert.equal(r2.status, 404, 'bare /sub should 404');
      log('✓ bare /api and /sub → 404');
    }

    // Unauthenticated health under SECURE PATH = silent ok
    {
      const r = await fetch(api('/api/health'));
      const body = await json(r);
      assert.equal(r.status, 200);
      assert.equal(body.ok, true);
      assert.equal(body.service, undefined);
      log('✓ GET /{SECURE}/api/health (anonymous)');
    }

    let cookie = '';
    {
      const r = await fetch(api('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: ADMIN_PASS }),
      });
      const body = await json(r);
      if (body.require2fa) throw new Error('2FA unexpectedly enabled');
      assert.equal(body.success, true, `login failed: ${JSON.stringify(body)}`);
      const setCookie = r.headers.getSetCookie?.() || [];
      const raw = setCookie[0] || r.headers.get('set-cookie') || '';
      cookie = raw.split(';')[0];
      assert.ok(cookie.startsWith('session='), 'missing session cookie');
      log('✓ POST /{SECURE}/api/login');
    }

    const auth = { Cookie: cookie, 'Content-Type': 'application/json' };

    // Authenticated health
    {
      const r = await fetch(api('/api/health'), { headers: { Cookie: cookie } });
      const body = await json(r);
      assert.equal(body.status, 'ok');
      assert.equal(body.version, '5.1.1');
      log('✓ GET /{SECURE}/api/health (admin) version 5.1.1');
    }

    // Admin dashboard
    {
      const r = await fetch(api('/api/admin/dashboard'), { headers: { Cookie: cookie } });
      const body = await json(r);
      assert.equal(body.success, true);
      assert.equal(body.data.version, '5.1.1');
      assert.ok(body.data.secure_path);
      log('✓ GET /{SECURE}/api/admin/dashboard');
    }

    // Users
    let newUserUuid = '';
    {
      const r = await fetch(api('/api/users'), { headers: { Cookie: cookie } });
      const body = await json(r);
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      log(`✓ GET /{SECURE}/api/users (${body.data.length})`);
    }

    {
      const uname = `e2e_${Date.now().toString(36)}`;
      const r = await fetch(api('/api/users'), {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ username: uname, limit: 10, expiryDays: 7 }),
      });
      const body = await json(r);
      assert.equal(body.success, true, JSON.stringify(body));
      newUserUuid = body.data.uuid;
      assert.ok(body.data.sub_url.includes(secure + '/sub/'));
      log(`✓ POST /{SECURE}/api/users → SECURE sub URL`);
    }

    // Settings
    {
      const r = await fetch(api('/api/settings'), {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ 'panel.sub_name': 'E2E-XRayMOD' }),
      });
      assert.equal((await json(r)).success, true);
      const r2 = await fetch(api('/api/settings'), { headers: { Cookie: cookie } });
      assert.equal((await json(r2)).data['panel.sub_name'], 'E2E-XRayMOD');
      log('✓ GET/PUT /{SECURE}/api/settings');
    }

    // Subscription under SECURE PATH
    {
      const r = await fetch(api(`/sub/${newUserUuid}`));
      assert.equal(r.status, 200, `sub status ${r.status}`);
      const text = await r.text();
      assert.ok(text.length > 0, 'empty subscription body');
      log('✓ GET /{SECURE}/sub/:uuid');
    }

    // Portal
    {
      const r = await fetch(api(`/me/${newUserUuid}`));
      assert.equal(r.status, 200);
      log('✓ GET /{SECURE}/me/:uuid');
    }

    console.log('\nAll E2E checks passed.\n');
    cleanup();
    process.exit(0);
  } catch (e) {
    console.error('\nE2E failed:', e);
    if (stderr) console.error('\n--- wrangler stderr (tail) ---\n', stderr.slice(-4000));
    cleanup();
    process.exit(1);
  }
}

main();
