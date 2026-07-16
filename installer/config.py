"""Config management for XRayMOD installer.

Local metadata under ~/.xraymod — never store API tokens or passwords.
"""
from __future__ import annotations

import json
from pathlib import Path

CONFIG_DIR = Path.home() / ".xraymod"
CONFIG_FILE = CONFIG_DIR / "config.json"
CACHE_DIR = CONFIG_DIR / "cache"

_SECRET_KEYS = {
    "api_token",
    "token",
    "password",
    "admin_password",
    "CLOUDFLARE_API_TOKEN",
}


def _is_secret_key(key: str) -> bool:
    k = str(key)
    if k in _SECRET_KEYS:
        return True
    low = k.lower()
    return low.endswith(("_token", "_secret", "_password", "_key"))


def _sanitize(config: dict) -> dict:
    return {k: v for k, v in config.items() if not _is_secret_key(k)}


def load() -> dict:
    if CONFIG_FILE.exists():
        try:
            return _sanitize(json.loads(CONFIG_FILE.read_text()))
        except Exception:
            pass
    return {}


def save(config: dict):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(_sanitize(config), indent=2))
    try:
        CONFIG_FILE.chmod(0o600)
    except Exception:
        pass


def get_cache_path(filename: str) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return CACHE_DIR / filename
