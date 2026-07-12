// XRayMOD Installer — Frontend Logic
let selectedMode = null;

function show(id) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function selectMode(mode) {
  selectedMode = mode;
  if (mode === 'cloudflare') {
    show('step-cf');
  } else {
    show('step-server');
  }
}

function goBack() {
  show('step-welcome');
}

function openTokenPage() {
  window.open('https://dash.cloudflare.com/profile/api-tokens', '_blank');
}

function setStatus(msg, ok) {
  const el = document.getElementById('token-status');
  el.className = 'status-msg ' + (ok ? 'ok' : 'err');
  el.textContent = msg;
}

let tokenValid = false;

// Auto-verify token on blur
document.addEventListener('DOMContentLoaded', () => {
  const tokenInput = document.getElementById('apiToken');
  tokenInput.addEventListener('blur', async () => {
    const token = tokenInput.value.trim();
    if (!token) return;
    setStatus('Verifying token...', null);
    try {
      const res = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.valid) {
        setStatus('Token valid — ' + data.account.name, true);
        tokenValid = true;
        document.getElementById('deployBtn').disabled = false;
      } else {
        setStatus(data.error || 'Invalid token', false);
        tokenValid = false;
      }
    } catch (e) {
      setStatus('Network error', false);
    }
  });
});

async function deploy() {
  if (!tokenValid) return;
  const btn = document.getElementById('deployBtn');
  btn.disabled = true;

  show('step-progress');
  const steps = [
    'Verifying Cloudflare account',
    'Creating D1 database',
    'Downloading panel code',
    'Deploying Worker',
    'Enabling subdomain',
  ];
  renderProgress(steps, 0);

  try {
    const res = await fetch('/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: document.getElementById('apiToken').value.trim(),
        worker_name: document.getElementById('workerName').value.trim() || undefined,
        admin_password: document.getElementById('adminPassword').value.trim() || undefined,
      }),
    });
    const data = await res.json();

    if (data.success) {
      renderProgress(steps, steps.length);
      setTimeout(() => {
        document.getElementById('result-url').textContent = data.worker_url;
        document.getElementById('result-pass').textContent = data.admin_password;
        document.getElementById('result-db').textContent = data.d1_database;
        show('step-result');
      }, 500);
    } else {
      show('step-cf');
      setStatus(data.error || 'Deployment failed', false);
      btn.disabled = false;
    }
  } catch (e) {
    show('step-cf');
    setStatus('Network error: ' + e.message, false);
    btn.disabled = false;
  }
}

function renderProgress(steps, done) {
  const el = document.getElementById('progress-steps');
  el.innerHTML = steps.map((s, i) => {
    const cls = i < done ? 'done' : i === done ? 'active' : '';
    return `<div class="progress-step ${cls}"><span class="dot"></span>${s}</div>`;
  }).join('');
}

function copy(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text);
}
