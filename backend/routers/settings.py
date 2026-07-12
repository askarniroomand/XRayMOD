"""Settings endpoints."""
from __future__ import annotations

import time

from fastapi import APIRouter, Request

from ..auth import require_admin
from ..database import get_db

router = APIRouter()


@router.get("/api/settings")
async def get_settings(request: Request):
    db = await get_db()
    await require_admin(request, db)
    rows = await db.execute_fetchall("SELECT k, v FROM kvstore WHERE k LIKE 'disguise.%' OR k LIKE 'ech.%' OR k LIKE 'tls_fragment.%' OR k LIKE 'tg.%' OR k LIKE 'panel.%' OR k LIKE 'integrations.%' OR k LIKE 'financial.%'")
    settings = {r[0]: r[1] for r in rows}
    return {"success": True, "data": settings}


@router.put("/api/settings")
async def update_settings(request: Request):
    db = await get_db()
    await require_admin(request, db)
    body = await request.json()
    for k, v in body.items():
        await db.execute(
            "INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?,?,?)",
            (k, v, int(time.time())),
        )
    await db.commit()
    return {"success": True}
