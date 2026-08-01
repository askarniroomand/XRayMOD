from __future__ import annotations

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "panels.db"


def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c


def init_db() -> None:
    with _conn() as c:
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS panels (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              tg_user_id INTEGER NOT NULL,
              worker_name TEXT NOT NULL,
              d1_id TEXT NOT NULL,
              account_id TEXT NOT NULL,
              panel_url TEXT NOT NULL,
              login_url TEXT NOT NULL,
              sub_url TEXT DEFAULT '',
              username TEXT NOT NULL,
              password TEXT NOT NULL,
              access_uuid TEXT NOT NULL,
              cf_token TEXT NOT NULL,
              created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
            )
            """
        )


def save_panel(**kwargs) -> int:
    with _conn() as c:
        cur = c.execute(
            """
            INSERT INTO panels (
              tg_user_id, worker_name, d1_id, account_id, panel_url, login_url,
              sub_url, username, password, access_uuid, cf_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                kwargs["tg_user_id"],
                kwargs["worker_name"],
                kwargs["d1_id"],
                kwargs["account_id"],
                kwargs["panel_url"],
                kwargs["login_url"],
                kwargs.get("sub_url", ""),
                kwargs["username"],
                kwargs["password"],
                kwargs["access_uuid"],
                kwargs["cf_token"],
            ),
        )
        return int(cur.lastrowid)


def list_panels(tg_user_id: int) -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM panels WHERE tg_user_id = ? ORDER BY id DESC",
            (tg_user_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def delete_panel(panel_id: int, tg_user_id: int) -> None:
    with _conn() as c:
        c.execute(
            "DELETE FROM panels WHERE id = ? AND tg_user_id = ?",
            (panel_id, tg_user_id),
        )
