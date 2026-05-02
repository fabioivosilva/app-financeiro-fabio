from __future__ import annotations

from fastapi import APIRouter

from ..database import get_connection


router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/")
def list_transactions(limit: int = 500):
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM transactions
            ORDER BY date DESC, id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]
