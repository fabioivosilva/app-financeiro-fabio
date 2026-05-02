from __future__ import annotations

from datetime import date, datetime
from typing import Any, Callable

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..database import get_connection
from ..models import transaction_hash
from ..services.itau_excel_parser import parse_itau_excel
from ..services.itau_pdf_parser import parse_itau_pdf
from ..services.ofx_parser import parse_ofx


router = APIRouter(prefix="/imports", tags=["imports"])

ParserFn = Callable[[bytes], list[dict[str, Any]]]

PARSERS: dict[str, ParserFn] = {
    "ofx": parse_ofx,
    "itau_pdf": parse_itau_pdf,
    "itau_excel": parse_itau_excel,
}


@router.post("/")
async def import_file(file: UploadFile = File(...), parser: str = Form(...)):
    parser_fn = PARSERS.get(parser)
    if not parser_fn:
        raise HTTPException(status_code=400, detail=f"Parser desconhecido: {parser}")

    content = await file.read()
    try:
        parsed = parser_fn(content)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Falha ao processar arquivo: {exc}") from exc

    now = datetime.utcnow().isoformat(timespec="seconds")
    inserted = 0
    duplicates = 0

    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO imports (filename, parser, imported_at, total_transactions, duplicates)
            VALUES (?, ?, ?, ?, ?)
            """,
            (file.filename or "arquivo", parser, now, len(parsed), 0),
        )
        import_id = int(cursor.lastrowid)

        for item in parsed:
            item_hash = transaction_hash(item, parser)
            raw_date = item.get("date")
            date_value = raw_date.isoformat() if isinstance(raw_date, date) else str(raw_date)
            try:
                conn.execute(
                    """
                    INSERT INTO transactions (
                        date, description, amount, transaction_type, source, parser,
                        external_id, card_last_digits, cardholder_first_name,
                        installment_current, installment_total, import_id, hash, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        date_value,
                        str(item.get("description", "")).strip(),
                        float(item.get("amount", 0.0)),
                        str(item.get("transaction_type", "expense")),
                        str(item.get("source", parser)),
                        parser,
                        item.get("external_id"),
                        item.get("card_last_digits"),
                        item.get("cardholder_first_name"),
                        item.get("installment_current"),
                        item.get("installment_total"),
                        import_id,
                        item_hash,
                        now,
                    ),
                )
                inserted += 1
            except Exception:
                duplicates += 1

        conn.execute(
            "UPDATE imports SET duplicates = ? WHERE id = ?",
            (duplicates, import_id),
        )

    return {
        "import_id": import_id,
        "filename": file.filename,
        "parser": parser,
        "captured": len(parsed),
        "inserted": inserted,
        "duplicates": duplicates,
    }


@router.get("/")
def list_imports():
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM imports ORDER BY imported_at DESC, id DESC").fetchall()
    return [dict(row) for row in rows]
