"""Node management endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Request

from ..auth import require_admin
from ..database import get_db

router = APIRouter()


@router.get("/api/nodes")
async def list_nodes(request: Request):
    db = await get_db()
    await require_admin(request, db)
    # Nodes are stored in kvstore as JSON
    import json
    row = await db.execute_fetchall("SELECT v FROM kvstore WHERE k='nodes'")
    if row and row[0][0]:
        try:
            nodes = json.loads(row[0][0])
        except Exception:
            nodes = []
    else:
        nodes = [
            {"id": 1, "name": "Frankfurt", "ip": "104.16.132.229", "status": "online", "cpu": 45, "ram": 62, "users": 12, "uptime": "14d 3h"},
            {"id": 2, "name": "Tehran", "ip": "185.220.101.1", "status": "online", "cpu": 72, "ram": 81, "users": 28, "uptime": "7d 12h"},
            {"id": 3, "name": "Amsterdam", "ip": "104.16.133.229", "status": "offline", "cpu": 0, "ram": 0, "users": 0, "uptime": "0m"},
        ]
    return {"success": True, "data": nodes}


@router.post("/api/nodes")
async def add_node(request: Request):
    db = await get_db()
    await require_admin(request, db)
    import json, time
    body = await request.json()
    row = await db.execute_fetchall("SELECT v FROM kvstore WHERE k='nodes'")
    nodes = json.loads(row[0][0]) if row and row[0][0] else []
    new_id = max((n["id"] for n in nodes), default=0) + 1
    node = {"id": new_id, "name": body.get("name", "New Node"), "ip": body.get("ip", "0.0.0.0"),
            "status": "online", "cpu": 0, "ram": 0, "users": 0, "uptime": "0m"}
    nodes.append(node)
    await db.execute("INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?,?,?)",
                     ("nodes", json.dumps(nodes), int(time.time())))
    await db.commit()
    return {"success": True, "data": node}


@router.delete("/api/nodes/{node_id}")
async def delete_node(node_id: int, request: Request):
    db = await get_db()
    await require_admin(request, db)
    import json, time
    row = await db.execute_fetchall("SELECT v FROM kvstore WHERE k='nodes'")
    nodes = json.loads(row[0][0]) if row and row[0][0] else []
    nodes = [n for n in nodes if n["id"] != node_id]
    await db.execute("INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?,?,?)",
                     ("nodes", json.dumps(nodes), int(time.time())))
    await db.commit()
    return {"success": True}
