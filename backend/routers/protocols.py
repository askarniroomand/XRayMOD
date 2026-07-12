"""Protocol management endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Request

from ..auth import require_admin
from ..database import get_db

router = APIRouter()


@router.get("/api/protocols")
async def list_protocols(request: Request):
    db = await get_db()
    await require_admin(request, db)
    import json
    rows = await db.execute_fetchall("SELECT id, name, schema_json, template_json, price, client_limit, client_price FROM protocols ORDER BY id")
    protocols = []
    for r in rows:
        protocols.append({
            "id": r[0], "name": r[1],
            "schema": json.loads(r[2]) if r[2] else {"fields": []},
            "template": r[3],
            "price": r[4], "clientLimit": r[5], "clientPrice": r[6],
        })
    return {"success": True, "data": protocols}


@router.post("/api/protocols")
async def create_protocol(request: Request):
    db = await get_db()
    await require_admin(request, db)
    import json
    body = await request.json()
    schema = json.dumps(body.get("schema", {"fields": []}))
    await db.execute(
        "INSERT OR REPLACE INTO protocols (id, name, schema_json, template_json, price, client_limit, client_price) VALUES (?,?,?,?,?,?,?)",
        (body["id"], body["name"], schema, body.get("template", "{}"),
         body.get("price", 0), body.get("clientLimit", 1), body.get("clientPrice", 0)),
    )
    await db.commit()
    return {"success": True}
