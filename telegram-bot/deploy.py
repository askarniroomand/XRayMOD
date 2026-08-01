"""Cloudflare panel create / destroy / update for the Telegram bot."""

from __future__ import annotations

import json
import os
import re
import secrets
import shutil
import subprocess
import time
from pathlib import Path
from typing import Any

import httpx

CF_API = "https://api.cloudflare.com/client/v4"


def _run(cmd: list[str], cwd: Path | None = None, env: dict | None = None, timeout: int = 900) -> str:
    full_env = os.environ.copy()
    if env:
        full_env.update(env)
    p = subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        env=full_env,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if p.returncode != 0:
        err = (p.stderr or p.stdout or "")[-800:]
        raise RuntimeError(f"{' '.join(cmd[:4])}… failed:\n{err}")
    return p.stdout or ""


def _cf(token: str, method: str, path: str, json_body: dict | None = None) -> dict:
    r = httpx.request(
        method,
        f"{CF_API}{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json=json_body,
        timeout=60,
    )
    data = r.json()
    if not data.get("success"):
        raise RuntimeError(json.dumps(data.get("errors") or data, ensure_ascii=False)[:400])
    return data


def ensure_repo(work_root: Path, repo_url: str) -> Path:
    work_root.mkdir(parents=True, exist_ok=True)
    repo = work_root / "XRayMOD"
    if (repo / ".git").exists():
        _run(["git", "fetch", "--all"], cwd=repo)
        _run(["git", "reset", "--hard", "origin/main"], cwd=repo)
        _run(["git", "pull", "--ff-only", "origin", "main"], cwd=repo)
    else:
        if repo.exists():
            shutil.rmtree(repo)
        _run(["git", "clone", "--depth", "1", "--branch", "main", repo_url, str(repo)])
    return repo


def ensure_workers_subdomain(token: str, account_id: str) -> str:
    try:
        data = _cf(token, "GET", f"/accounts/{account_id}/workers/subdomain")
        sub = (data.get("result") or {}).get("subdomain")
        if sub:
            return sub
    except Exception:
        pass
    for name in ("xraymod", f"xrm{secrets.token_hex(3)}"):
        try:
            data = _cf(
                token,
                "PUT",
                f"/accounts/{account_id}/workers/subdomain",
                {"subdomain": name},
            )
            return (data.get("result") or {}).get("subdomain") or name
        except Exception:
            continue
    return "workers"


def create_d1(token: str, account_id: str, name: str) -> str:
    data = _cf(
        token,
        "POST",
        f"/accounts/{account_id}/d1/database",
        {"name": name},
    )
    return data["result"]["uuid"]


def write_wrangler(repo: Path, worker_name: str, d1_id: str) -> None:
    content = f'''name = "{worker_name}"
main = "worker/index.ts"
compatibility_date = "2024-11-01"
workers_dev = true
preview_urls = true

[assets]
directory = "./frontend/out"
binding = "ASSETS"
run_worker_first = true

[[d1_databases]]
binding = "DB"
database_name = "{worker_name}-db"
database_id = "{d1_id}"
preview_database_id = "{d1_id}"

[vars]
ENABLE_TELEGRAM = "false"
ENABLE_TON_WALLET = "false"
EXTERNAL_SERVER_URL = ""
DISGUISE_PAGE = "404"
PANEL_RECOVERY = "false"
TG_BOT_TOKEN = ""
CRYPTO_KEY = ""
'''
    (repo / "wrangler.toml").write_text(content)


def build_and_deploy(repo: Path, token: str, account_id: str, worker_name: str) -> str:
    _run(["npm", "install", "--no-fund", "--no-audit"], cwd=repo, timeout=600)
    _run(["npm", "install", "--prefix", "frontend", "--no-fund", "--no-audit"], cwd=repo, timeout=600)
    _run(["npm", "run", "build:ui"], cwd=repo, timeout=600)
    env = {"CLOUDFLARE_API_TOKEN": token, "CLOUDFLARE_ACCOUNT_ID": account_id}
    _run(["npx", "wrangler", "deploy"], cwd=repo, env=env, timeout=600)
    try:
        _cf(
            token,
            "POST",
            f"/accounts/{account_id}/workers/scripts/{worker_name}/subdomain",
            {"enabled": True, "previews_enabled": True},
        )
    except Exception:
        pass
    sub = ensure_workers_subdomain(token, account_id)
    return f"https://{worker_name}.{sub}.workers.dev"


def bootstrap(worker_url: str, username: str, password: str) -> dict[str, Any]:
    url = f"{worker_url.rstrip('/')}/install"
    body = {"username": username, "password": password, "auto": False}
    last_err = ""
    for _ in range(8):
        try:
            r = httpx.post(url, json=body, timeout=60, follow_redirects=True)
            data = r.json() if r.content else {}
            if r.status_code < 400 and (data.get("success") or data.get("loginUrl") or data.get("accessUUID")):
                return data if isinstance(data, dict) else {"raw": data}
            # already configured?
            if r.status_code in (200, 302, 409):
                return data if isinstance(data, dict) else {"status": r.status_code}
            last_err = f"{r.status_code} {r.text[:200]}"
        except Exception as e:
            last_err = str(e)
        time.sleep(3)
    raise RuntimeError(f"bootstrap failed: {last_err}")


def create_panel(
    token: str,
    username: str,
    password: str,
    worker_name: str,
    work_root: Path,
    repo_url: str,
) -> dict[str, Any]:
    worker_name = re.sub(r"[^a-z0-9-]", "-", worker_name.lower())[:40]
    accounts = _cf(token, "GET", "/accounts?per_page=5")
    results = accounts.get("result") or []
    if not results:
        raise RuntimeError("No Cloudflare account on this token")
    account_id = results[0]["id"]

    repo = ensure_repo(work_root, repo_url)
    d1_name = f"{worker_name}-db"
    d1_id = create_d1(token, account_id, d1_name)
    write_wrangler(repo, worker_name, d1_id)
    worker_url = build_and_deploy(repo, token, account_id, worker_name)
    time.sleep(4)
    boot = bootstrap(worker_url, username, password)

    access = boot.get("accessUUID") or boot.get("access_uuid") or ""
    login = boot.get("loginUrl") or boot.get("login_url") or ""
    panel = boot.get("panelUrl") or boot.get("panel_url") or ""
    sub = (
        boot.get("subscriptionUrl")
        or boot.get("subUrl")
        or boot.get("subscription_url")
        or ""
    )
    data = boot.get("data") or {}
    if isinstance(data, dict):
        access = data.get("accessUUID") or data.get("access_uuid") or access
        login = data.get("loginUrl") or login
        panel = data.get("panelUrl") or panel
        sub = data.get("subscriptionUrl") or data.get("subUrl") or sub

    if access and not login:
        login = f"{worker_url}/{access}/login"
    if access and not panel:
        panel = f"{worker_url}/{access}/panel"

    return {
        "worker_name": worker_name,
        "d1_id": d1_id,
        "account_id": account_id,
        "worker_url": worker_url,
        "login_url": login or f"{worker_url}/install",
        "panel_url": panel or worker_url,
        "sub_url": sub,
        "access_uuid": access or "see-install",
        "bootstrap": boot,
    }


def destroy_panel(panel: dict) -> None:
    token = panel["cf_token"]
    account_id = panel["account_id"]
    worker = panel["worker_name"]
    d1_id = panel["d1_id"]
    try:
        _cf(token, "DELETE", f"/accounts/{account_id}/workers/scripts/{worker}")
    except Exception:
        pass
    try:
        _cf(token, "DELETE", f"/accounts/{account_id}/d1/database/{d1_id}")
    except Exception:
        pass


def update_panel(panel: dict, work_root: Path, repo_url: str) -> str:
    token = panel["cf_token"]
    account_id = panel["account_id"]
    worker_name = panel["worker_name"]
    d1_id = panel["d1_id"]
    repo = ensure_repo(work_root, repo_url)
    write_wrangler(repo, worker_name, d1_id)
    return build_and_deploy(repo, token, account_id, worker_name)
