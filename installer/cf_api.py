"""Cloudflare API client."""
from __future__ import annotations

import json
import secrets

import httpx

CF_API = "https://api.cloudflare.com/client/v4"


class CFApiError(Exception):
    pass


def cf_request(token: str, path: str, method: str = "GET", body: dict | None = None) -> dict:
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    resp = httpx.request(method, f"{CF_API}{path}", headers=headers, json=body, timeout=30)
    data = resp.json()
    if not data.get("success"):
        errors = [e.get("message", str(e)) for e in data.get("errors", [])]
        raise CFApiError(f"Cloudflare API: {'; '.join(errors) or resp.text}")
    return data


def verify_token(token: str) -> dict:
    data = cf_request(token, "/accounts?per_page=1")
    account = data["result"][0]
    return {"id": account["id"], "name": account["name"]}


def list_accounts(token: str) -> list[dict]:
    data = cf_request(token, "/accounts?per_page=50")
    return [{"id": a["id"], "name": a["name"]} for a in data.get("result", [])]


def create_d1(token: str, account_id: str, name: str) -> str:
    try:
        data = cf_request(token, f"/accounts/{account_id}/d1/database", "POST", {"name": name})
        return data["result"].get("uuid") or data["result"].get("id")
    except CFApiError:
        existing = cf_request(token, f"/accounts/{account_id}/d1/database?name={name}")
        if existing.get("result"):
            return existing["result"][0].get("uuid") or existing["result"][0].get("id")
        raise


def get_subdomain(token: str, account_id: str) -> str:
    try:
        data = cf_request(token, f"/accounts/{account_id}/workers/subdomain")
        custom = data["result"].get("subdomain") or data["result"].get("name") or ""
        return f"{custom}.workers.dev" if custom else "workers.dev"
    except CFApiError:
        return "workers.dev"


def deploy_worker(token: str, account_id: str, worker_name: str, worker_code: str,
                  d1_id: str, admin_password: str, pages_url: str = "") -> str:
    metadata = {
        "main_module": "worker.js",
        "compatibility_date": "2025-01-01",
        "compatibility_flags": ["nodejs_compat"],
        "bindings": [
            {"type": "d1", "name": "DB", "database_id": d1_id},
            {"type": "plain_text", "name": "ADMIN_PASSWORD", "text": admin_password},
            {"type": "plain_text", "name": "PAGES_URL", "text": pages_url},
        ],
    }

    boundary = f"----formdata-{secrets.token_hex(8)}"
    parts = []
    parts.append(
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="metadata"\r\n'
        f"Content-Type: application/json\r\n\r\n"
        f"{json.dumps(metadata)}\r\n"
    )
    parts.append(
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="worker.js"; filename="worker.js"\r\n'
        f"Content-Type: application/javascript+module\r\n\r\n"
        f"{worker_code}\r\n"
    )
    parts.append(f"--{boundary}--\r\n")
    body = "".join(parts).encode()

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    }

    resp = httpx.put(
        f"{CF_API}/accounts/{account_id}/workers/scripts/{worker_name}",
        headers=headers,
        content=body,
        timeout=60,
    )
    if resp.status_code not in (200, 201):
        raise CFApiError(f"Worker upload failed: {resp.text}")
    return worker_name


def enable_worker_subdomain(token: str, account_id: str, worker_name: str):
    for method in ("POST", "PUT", "PATCH"):
        try:
            cf_request(token, f"/accounts/{account_id}/workers/scripts/{worker_name}/subdomain", method, {"enabled": True})
            return
        except CFApiError:
            continue


def get_worker_url(token: str, account_id: str, worker_name: str) -> str:
    subdomain = get_subdomain(token, account_id)
    return f"https://{worker_name}.{subdomain}"
