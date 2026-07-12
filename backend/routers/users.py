"""User management endpoints."""
from __future__ import annotations

import time
import uuid as _uuid

from fastapi import APIRouter, Request

from ..auth import require_admin
from ..database import get_db

router = APIRouter()


@router.get("/api/users")
async def list_users(request: Request):
    db = await get_db()
    await require_admin(request, db)
    rows = await db.execute_fetchall(
        "SELECT id, username, role, uuid, email, traffic_limit, traffic_used, expiry_date, status FROM users ORDER BY id"
    )
    users = []
    for r in rows:
        users.append({
            "id": r[0], "username": r[1], "role": r[2], "uuid": r[3],
            "email": r[4], "limit": round(r[5] / (1024**3), 2) if r[5] else 0,
            "used": round(r[6] / (1024**3), 2) if r[6] else 0,
            "expiry": r[7], "status": r[8],
        })
    return {"success": True, "data": users}


@router.post("/api/users")
async def create_user(request: Request):
    db = await get_db()
    await require_admin(request, db)
    body = await request.json()
    import hashlib
    pw = body.get("password") or _uuid.uuid4().hex[:12]
    pw_hash = hashlib.sha256(pw.encode()).hexdigest()
    user_uuid = str(_uuid.uuid4())
    import datetime
    expiry_days = body.get("expiryDays", 30)
    expiry = (datetime.date.today() + datetime.timedelta(days=expiry_days)).isoformat()
    limit_gb = body.get("limit", 100)
    limit_bytes = int(limit_gb) * (1024**3)

    await db.execute(
        "INSERT INTO users (username, password_hash, role, uuid, email, traffic_limit, expiry_date, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        (body.get("username", f"user_{int(time.time())}"), pw_hash, "user", user_uuid,
         body.get("email", ""), limit_bytes, expiry, "active", int(time.time())),
    )
    await db.commit()
    return {"success": True, "data": {"password": pw, "uuid": user_uuid}}


@router.put("/api/users/{user_id}")
async def update_user(user_id: int, request: Request):
    db = await get_db()
    await require_admin(request, db)
    body = await request.json()
    updates = []
    params = []
    for field in ("limit", "expiry", "status", "used"):
        if field in body:
            col = {"limit": "traffic_limit", "expiry": "expiry_date", "used": "traffic_used"}.get(field, field)
            val = body[field]
            if field == "limit":
                val = int(val) * (1024**3)
            elif field == "used":
                val = int(val) * (1024**3)
            updates.append(f"{col}=?")
            params.append(val)
    if updates:
        params.append(user_id)
        await db.execute(f"UPDATE users SET {','.join(updates)} WHERE id=?", params)
        await db.commit()
    return {"success": True}
