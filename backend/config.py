"""Backend configuration."""
from __future__ import annotations

import os
from pathlib import Path

DATA_DIR = Path(os.getenv("XRAYMOD_DATA", Path.home() / ".xraymod"))
DB_PATH = DATA_DIR / "xraymod.db"
SECRET_KEY = os.getenv("XRAYMOD_SECRET", "change-me-in-production")
CF_API_BASE = "https://api.cloudflare.com/client/v4"
