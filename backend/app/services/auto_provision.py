"""
Detects recurring income and fixed expenses, then creates/updates provisions.

Rules:
- Only acts on categories with type='receita' or type='fixa'
- Income provisions use positive transactions
- Fixed expense provisions use negative transactions
- Creates a provision when there are 2+ transactions from the same
  (category, owner) in different cycles
- Existing provisions are updated with the average amount and average day
- The created/updated provision is returned so the frontend can show feedback
"""
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Category, Provision, Transaction


def _safe_day(transactions: list[Transaction]) -> int:
    """Average day of month between transactions, clamped to 1-31."""
    if not transactions:
        return 1
    avg = sum(t.date.day for t in transactions) / len(transactions)
    return max(1, min(31, round(avg)))


def _avg_amount(transactions: list[Transaction]) -> float:
    return sum(t.amount for t in transactions) / len(transactions)


def _diff_cycles(transactions: list[Transaction]) -> int:
    """How many distinct (year, month) cycles the transactions cover."""
    return len({(t.date.year, t.date.month) for t in transactions})


def _amount_matches_category_type(category_type: str, amount: float) -> bool:
    if category_type == "receita":
        return amount > 0
    if category_type == "fixa":
        return amount < 0
    return False


def maybe_upsert_income_provision(
    db: Session,
    transaction: Transaction,
) -> Optional[Provision]:
    """
    Called after a transaction has been categorized/updated.
    Returns the created/updated Provision, or None when nothing changed.
    """
    if not transaction.category_id:
        return None

    category = db.query(Category).get(transaction.category_id)
    if not category or not _amount_matches_category_type(category.type, transaction.amount):
        return None

    similar = db.query(Transaction).filter(
        Transaction.category_id == transaction.category_id,
    )
    if category.type == "receita":
        similar = similar.filter(Transaction.amount > 0)
    else:
        similar = similar.filter(Transaction.amount < 0)

    if transaction.person_id is not None:
        similar = similar.filter(Transaction.person_id == transaction.person_id)
    else:
        similar = similar.filter(Transaction.person_id.is_(None))

    occurrences = similar.all()

    if _diff_cycles(occurrences) < 2:
        return None

    avg_amount = _avg_amount(occurrences)
    avg_day = _safe_day(occurrences)

    existing_q = db.query(Provision).filter(
        Provision.category_id == transaction.category_id,
        Provision.type == "mensal",
    )
    if transaction.person_id is not None:
        existing_q = existing_q.filter(Provision.person_id == transaction.person_id)
    else:
        existing_q = existing_q.filter(Provision.person_id.is_(None))

    existing = existing_q.first()

    if existing:
        existing.amount = round(avg_amount, 2)
        existing.day = avg_day
        existing.active = True
        db.commit()
        db.refresh(existing)
        return existing

    provision = Provision(
        description=category.name,
        amount=round(avg_amount, 2),
        day=avg_day,
        type="mensal",
        category_id=transaction.category_id,
        person_id=transaction.person_id,
        active=True,
    )
    db.add(provision)
    db.commit()
    db.refresh(provision)
    return provision
