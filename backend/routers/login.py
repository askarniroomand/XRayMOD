"""Login endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Request, Response
from pydantic import BaseModel

from ..auth import hash_password, create_session, get_session, extract_token
from ..database import get_db

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/api/login")
async def login(body: LoginRequest, response: Response):
    db = await get_db()
    pw_hash = hash_password(body.password)
    rows = await db.execute_fetchall(
        "SELECT id, username, role, uuid, email, status FROM users WHERE username=? AND password_hash=?",
        (body.username, pw_hash),
    )
    if not rows:
        return {"success": False, "message": "Invalid credentials"}

    user = rows[0]
    if user[5] != "active":
        return {"success": False, "message": "Account disabled"}

    token = await create_session(db, user[0], user[2])
    response.set_cookie("session", token, max_age=7 * 86400, httponly=True, samesite="strict")

    result = {"success": True, "role": user[2], "user": {"id": user[0], "username": user[1], "email": user[4]}}

    # First admin login: return initial config
    if user[2] == "admin":
        admin_uuid_row = await db.execute_fetchall("SELECT v FROM kvstore WHERE k='panel.admin_uuid'")
        access_uuid_row = await db.execute_fetchall("SELECT v FROM kvstore WHERE k='panel.access_uuid'")
        if admin_uuid_row and not access_uuid_row:
            import uuid as _uuid
            access_uuid = str(_uuid.uuid4())
            await db.execute("INSERT OR REPLACE INTO kvstore (k, v, updated) VALUES (?,?,?)",
                           ("panel.access_uuid", access_uuid, __import__("time").time()))
            await db.commit()
            result["initialConfig"] = {
                "adminUuid": admin_uuid_row[0][0],
                "accessUuid": access_uuid,
                "panelUrl": f"(set your panel URL)",
                "subscriptionUrl": f"(set your panel URL)/sub/",
                "instructions": [
                    "Save your admin UUID and access UUID — they are your panel credentials",
                    "Bookmark your panel URL with the access UUID prefix",
                    "Your subscription URL is: /sub/<user-uuid>",
                ],
            }

    return result
