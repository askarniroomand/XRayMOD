"""Session-based auth (SHA-256 + cookies)."""
from __future__ import annotations

import hashlib
import time
import uuid
from functools import wraps

from fastapi import Request, HTTPException


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


async def create_session(db, user_id: int, role: str) -> str:
    token = str(uuid.uuid4())
    await db.execute(
        "INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?, ?, ?)",
        (f"session:{token}", f"{user_id}:{role}", int(time.time())),
    )
    await db.commit()
    return token


async def get_session(db, token: str) -> dict | None:
    row = await db.execute_fetchall("SELECT v FROM kvstore WHERE k=?", (f"session:{token}",))
    if not row:
        return None
    val = row[0][0]
    parts = val.split(":")
    if len(parts) != 2:
        return None
    return {"user_id": int(parts[0]), "role": parts[1]}


async def delete_session(db, token: str):
    await db.execute("DELETE FROM kvstore WHERE k=?", (f"session:{token}",))
    await db.commit()


def extract_token(request: Request) -> str | None:
    cookie = request.headers.get("cookie", "")
    for part in cookie.split(";"):
        part = part.strip()
        if part.startswith("session="):
            return part.split("=", 1)[1]
    return None


async def require_admin(request: Request, db) -> dict:
    token = extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await get_session(db, token)
    if not session or session["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return session


async def require_auth(request: Request, db) -> dict:
    token = extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await get_session(db, token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    return session
