"""Backend/VPS registration endpoints."""
from __future__ import annotations

import time

from fastapi import APIRouter, Request

from ..auth import require_admin
from ..database import get_db

router = APIRouter()


@router.get("/api/backends")
async def list_backends(request: Request):
    db = await get_db()
    await require_admin(request, db)
    rows = await db.execute_fetchall("SELECT id, user_id, vps_ip, vps_port, vps_uuid, status, created_at FROM backends ORDER BY id")
    backends = [{"id": r[0], "userId": r[1], "vpsIp": r[2], "vpsPort": r[3], "vpsUuid": r[4],
                 "status": r[5], "createdAt": r[6]} for r in rows]
    return {"success": True, "data": backends}


@router.post("/api/backends")
async def register_backend(request: Request):
    db = await get_db()
    await require_admin(request, db)
    body = await request.json()
    await db.execute(
        "INSERT INTO backends (user_id, vps_ip, vps_port, status, created_at) VALUES (?,?,?,?,?)",
        (0, body.get("vps_ip", ""), body.get("vps_port", 443), "pending", int(time.time())),
    )
    await db.commit()
    return {"success": True}


@router.delete("/api/backends/{backend_id}")
async def delete_backend(backend_id: int, request: Request):
    db = await get_db()
    await require_admin(request, db)
    await db.execute("DELETE FROM backends WHERE id=?", (backend_id,))
    await db.commit()
    return {"success": True}
