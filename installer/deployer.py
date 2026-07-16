"""Deploy logic for XRayMOD panel."""
from __future__ import annotations

import secrets
import subprocess
from pathlib import Path

import httpx

from . import cf_api
from .config import load, save, get_cache_path

# Fallback: published obfuscated worker (when local bundle unavailable)
WORKER_BUNDLE_URL = "https://raw.githubusercontent.com/askarniroomand/XRayMOD/main/README.md"
REPO_ROOT = Path(__file__).resolve().parent.parent


def fetch_worker_code() -> str:
    """Prefer local build (worker.js or wrangler dry-run), else remote bundle."""
    local_worker = REPO_ROOT / "worker.js"
    if local_worker.exists() and local_worker.stat().st_size > 1000:
        return local_worker.read_text()

    # Try wrangler dry-run bundle
    try:
        outdir = get_cache_path("wrangler-bundle")
        outdir.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["npx", "wrangler", "deploy", "--dry-run", f"--outdir={outdir}"],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            timeout=120,
        )
        bundled = outdir / "index.js"
        if bundled.exists():
            return bundled.read_text()
    except Exception:
        pass

    cached = get_cache_path("xraymod-worker.js")
    if cached.exists():
        return cached.read_text()

    resp = httpx.get(WORKER_BUNDLE_URL, timeout=30, follow_redirects=True)
    if resp.status_code != 200:
        raise RuntimeError(f"Failed to download XRayMOD worker: HTTP {resp.status_code}")

    cached.parent.mkdir(parents=True, exist_ok=True)
    cached.write_text(resp.text)
    return resp.text


def generate_password(length: int = 16) -> str:
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"
    return "".join(secrets.choice(chars) for _ in range(length))


def deploy_cf(token: str, worker_name: str, d1_name: str, admin_password: str) -> dict:
    account = cf_api.verify_token(token)
    account_id = account["id"]

    d1_id = cf_api.create_d1(token, account_id, d1_name)
    worker_code = fetch_worker_code()
    cf_api.deploy_worker(token, account_id, worker_name, worker_code, d1_id, admin_password)
    cf_api.enable_worker_subdomain(token, account_id, worker_name)
    worker_url = cf_api.get_worker_url(token, account_id, worker_name)

    # Never persist Cloudflare API tokens on disk
    save({
        "worker_name": worker_name,
        "d1_name": d1_name,
        "d1_id": d1_id,
        "worker_url": worker_url,
        "mode": "cloudflare",
    })

    return {
        "worker_name": worker_name,
        "worker_url": worker_url,
        "d1_database": d1_name,
        "d1_id": d1_id,
        "admin_password": admin_password,
        "account_name": account["name"],
    }


def deploy_server(host: str, port: int = 22, password: str = "") -> dict:
    """Deploy to a personal VPS via SSH."""
    # Phase 2: implement SSH-based deployment
    raise NotImplementedError("VPS deployment will be implemented in Phase 2")
