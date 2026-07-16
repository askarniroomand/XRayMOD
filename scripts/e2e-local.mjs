/**
 * Local E2E against wrangler dev --local.
 * Starts worker, runs API flows: health → login → users → settings → sub.
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

async function waitForHealth(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok || r.status === 500) return; // process is up
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

async function main() {
  console.log('\nXRayMOD local E2E\n');

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
      env: {
        ...process.env,
        ADMIN_PASSWORD: ADMIN_PASS,
      },
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
    await waitForHealth();
    log('worker ready');

    // Health
    {
      const r = await fetch(`${BASE}/api/health`);
      const body = await json(r);
      assert.equal(body.service, 'xraymod');
      log('✓ GET /api/health');
    }

    // Install / ensure configured via ADMIN_PASSWORD or login seed
    // Seed admin is admin/admin from schema; try that first then install password
    let cookie = '';
    {
      let r = await fetch(`${BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' }),
      });
      let body = await json(r);

      if (!body.success) {
        // try install env password if used
        r = await fetch(`${BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: ADMIN_PASS }),
        });
        body = await json(r);
      }

      if (body.require2fa) {
        throw new Error('2FA unexpectedly enabled in fresh local DB');
      }
      assert.equal(body.success, true, `login failed: ${JSON.stringify(body)}`);
      const setCookie = r.headers.getSetCookie?.() || [];
      const raw = setCookie[0] || r.headers.get('set-cookie') || '';
      cookie = raw.split(';')[0];
      assert.ok(cookie.startsWith('session='), 'missing session cookie');
      log('✓ POST /api/login (admin)');
    }

    const auth = { Cookie: cookie, 'Content-Type': 'application/json' };

    // List users
    let adminUuid = '';
    {
      const r = await fetch(`${BASE}/api/users`, { headers: { Cookie: cookie } });
      const body = await json(r);
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length >= 1);
      const admin = body.data.find((u) => u.username === 'admin') || body.data[0];
      adminUuid = admin.uuid || admin.sub_id;
      log(`✓ GET /api/users (${body.data.length} users)`);
    }

    // Create user
    let newUserId = null;
    let newUserUuid = '';
    {
      const uname = `e2e_${Date.now().toString(36)}`;
      const r = await fetch(`${BASE}/api/users`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ username: uname, limit: 10, expiryDays: 7 }),
      });
      const body = await json(r);
      assert.equal(body.success, true, JSON.stringify(body));
      newUserId = body.data.id;
      newUserUuid = body.data.uuid;
      assert.ok(newUserUuid);
      log(`✓ POST /api/users → ${uname}`);
    }

    // Update user
    {
      const r = await fetch(`${BASE}/api/users/${newUserId}`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ limit: 20, enable: true }),
      });
      const body = await json(r);
      assert.equal(body.success, true);
      log('✓ PUT /api/users/:id');
    }

    // Settings write/read
    {
      const r = await fetch(`${BASE}/api/settings`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ 'panel.sub_name': 'E2E-XRayMOD' }),
      });
      const body = await json(r);
      assert.equal(body.success, true);
      const r2 = await fetch(`${BASE}/api/settings`, { headers: { Cookie: cookie } });
      const s = await json(r2);
      assert.equal(s.data['panel.sub_name'], 'E2E-XRayMOD');
      log('✓ GET/PUT /api/settings');
    }

    // Clean IP list
    {
      const r = await fetch(`${BASE}/api/cleanip/list`, { headers: { Cookie: cookie } });
      const body = await json(r);
      assert.equal(body.success, true);
      log('✓ GET /api/cleanip/list');
    }

    // Nodes
    {
      const r = await fetch(`${BASE}/api/nodes`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ name: 'E2E Node', ip: '1.1.1.1' }),
      });
      const body = await json(r);
      assert.equal(body.success, true);
      const id = body.data.id;
      const del = await fetch(`${BASE}/api/nodes/${id}`, {
        method: 'DELETE',
        headers: { Cookie: cookie },
      });
      const delBody = await json(del);
      assert.equal(delBody.success, true);
      log('✓ POST/DELETE /api/nodes');
    }

    // Subscription for new user (may be empty base64 if no configs path issues — we auto-create config)
    {
      const r = await fetch(`${BASE}/sub/${newUserUuid}`);
      assert.ok(r.status === 200 || r.status === 200, `sub status ${r.status}`);
      const text = await r.text();
      assert.ok(text.length > 0, 'empty subscription body');
      log('✓ GET /sub/:uuid');
    }

    // UI asset
    {
      const r = await fetch(`${BASE}/login`);
      // may be 200 HTML from assets or fallback
      assert.ok([200, 302].includes(r.status));
      const ct = r.headers.get('content-type') || '';
      const body = await r.text();
      if (r.status === 200) {
        assert.ok(
          ct.includes('text/html') || body.includes('html') || body.includes('Xray'),
          'expected HTML UI'
        );
      }
      log('✓ GET /login (UI)');
    }

    // Logout
    {
      const r = await fetch(`${BASE}/api/logout`, {
        method: 'POST',
        headers: { Cookie: cookie },
      });
      const body = await json(r);
      assert.equal(body.success, true);
      log('✓ POST /api/logout');
    }

    // Delete test user (re-login)
    {
      const r = await fetch(`${BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' }),
      });
      const body = await json(r);
      if (body.success) {
        const c = (r.headers.getSetCookie?.() || [r.headers.get('set-cookie') || ''])[0]?.split(';')[0];
        await fetch(`${BASE}/api/users/${newUserId}`, {
          method: 'DELETE',
          headers: { Cookie: c },
        });
        log('✓ DELETE /api/users/:id');
      }
    }

    console.log('\nAll E2E checks passed.\n');
    cleanup();
    process.exit(0);
  } catch (e) {
    console.error('\nE2E FAILED:', e.message || e);
    if (stderr) console.error('\n--- wrangler stderr (tail) ---\n', stderr.slice(-3000));
    cleanup();
    process.exit(1);
  }
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
  });
}

main();
