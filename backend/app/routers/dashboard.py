from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter

from ..database import get_connection


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/")
def get_dashboard():
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT date, description, amount, transaction_type, source, card_last_digits, cardholder_first_name
            FROM transactions
            ORDER BY date DESC, id DESC
            """
        ).fetchall()

    income = sum(float(row["amount"]) for row in rows if float(row["amount"]) > 0)
    expenses = -sum(float(row["amount"]) for row in rows if float(row["amount"]) < 0)
    by_source: dict[str, float] = defaultdict(float)
    by_person: dict[str, float] = defaultdict(float)

    for row in rows:
        amount = float(row["amount"])
        if amount < 0:
            by_source[row["source"]] += -amount
            person = row["cardholder_first_name"] or "Nao identificado"
            by_person[person] += -amount

    return {
        "summary": {
            "income": income,
            "expenses": expenses,
            "balance": income - expenses,
            "transactions": len(rows),
        },
        "spending_by_source": [
            {"source": source, "amount": amount}
            for source, amount in sorted(by_source.items(), key=lambda item: item[1], reverse=True)
        ],
        "spending_by_person": [
            {"person": person, "amount": amount}
            for person, amount in sorted(by_person.items(), key=lambda item: item[1], reverse=True)
        ],
        "recent_transactions": [dict(row) for row in rows[:10]],
    }
