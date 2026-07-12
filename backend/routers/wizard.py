"""Wizard deployment endpoint."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/wizard")
async def wizard_info():
    return {"status": "ok", "message": "Wizard API — use POST /api/wizard/deploy"}
