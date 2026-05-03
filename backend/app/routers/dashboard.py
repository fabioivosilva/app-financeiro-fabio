from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import Transaction

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_summary(
    month: int = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    start = date(year, month, 1)
    end = date(year + (month // 12), (month % 12) + 1, 1)

    transactions = db.query(Transaction).filter(
        Transaction.date >= start,
        Transaction.date < end,
    ).all()

    income = sum(t.amount for t in transactions if t.amount > 0)
    expense = sum(t.amount for t in transactions if t.amount < 0)

    return {
        "month": f"{year}-{month:02d}",
        "income": round(income, 2),
        "expense": round(abs(expense), 2),
        "balance": round(income + expense, 2),
        "transaction_count": len(transactions),
    }
