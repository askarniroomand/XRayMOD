"""Logout endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Request, Response

from ..auth import extract_token, delete_session
from ..database import get_db

router = APIRouter()


@router.post("/api/logout")
async def logout(request: Request, response: Response):
    token = extract_token(request)
    if token:
        db = await get_db()
        await delete_session(db, token)
    response.delete_cookie("session")
    return {"success": True}
