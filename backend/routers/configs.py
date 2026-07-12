"""Config management endpoints."""
from __future__ import annotations

import time

from fastapi import APIRouter, Request

from ..auth import require_admin
from ..database import get_db

router = APIRouter()


@router.get("/api/configs")
async def list_configs(request: Request):
    db = await get_db()
    await require_admin(request, db)
    rows = await db.execute_fetchall("SELECT id, user_id, protocol_id, name, settings_json, port, path, link, node_ip, client_limit FROM configs ORDER BY id")
    configs = [{"id": r[0], "userId": r[1], "protocolId": r[2], "name": r[3], "settings": r[4],
                "port": r[5], "path": r[6], "link": r[7], "nodeIp": r[8], "clientLimit": r[9]} for r in rows]
    return {"success": True, "data": configs}


@router.post("/api/configs")
async def create_config(request: Request):
    db = await get_db()
    await require_admin(request, db)
    body = await request.json()
    await db.execute(
        "INSERT INTO configs (user_id, protocol_id, name, settings_json, port, path, link, node_ip, client_limit, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (body.get("userId", 0), body.get("protocolId", ""), body.get("name", ""),
         body.get("settings", "{}"), body.get("port", 443), body.get("path", ""),
         body.get("link", ""), body.get("nodeIp", ""), body.get("clientLimit", 1), int(time.time())),
    )
    await db.commit()
    return {"success": True}


@router.delete("/api/configs/{config_id}")
async def delete_config(config_id: int, request: Request):
    db = await get_db()
    await require_admin(request, db)
    await db.execute("DELETE FROM configs WHERE id=?", (config_id,))
    await db.commit()
    return {"success": True}
