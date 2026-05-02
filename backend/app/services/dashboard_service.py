"""
Dashboard aggregation service.
Computes monthly summaries from transactions.
"""
from datetime import date, datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from ..models import Transaction, Category, Person, Goal
from ..crud import financial_period
from ..schemas import (
    DashboardOut, SpendingByPerson, SpendingByCategory, CategoryLimit,
)


def _countable_transaction_filter():
    return or_(
        Transaction.category_id.is_(None),
        Category.exclude_from_totals == False,
    )


def get_dashboard_data(db: Session, month: Optional[str] = None) -> DashboardOut:
    """Build the full dashboard response for a given month."""
    if month:
        year, m = map(int, month.split("-"))
    else:
        now = datetime.now()
        year, m = now.year, now.month
        month = f"{year:04d}-{m:02d}"

    period_start, period_end = financial_period(month)
    month_filter = and_(
        Transaction.date >= period_start,
        Transaction.date <= period_end,
    )

    # --- Total income ---
    total_income = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .outerjoin(Category, Transaction.category_id == Category.id)
        .filter(month_filter, Transaction.transaction_type == "income")
        .filter(_countable_transaction_filter())
        .scalar()
    )

    # --- Total expenses ---
    total_expenses = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .outerjoin(Category, Transaction.category_id == Category.id)
        .filter(month_filter, Transaction.transaction_type == "expense")
        .filter(_countable_transaction_filter())
        .scalar()
    )
    total_expenses = abs(total_expenses)

    # --- Credit card total ---
    credit_card_total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .outerjoin(Category, Transaction.category_id == Category.id)
        .filter(month_filter, Transaction.source == "credit_card", Transaction.transaction_type == "expense")
        .filter(_countable_transaction_filter())
        .scalar()
    )
    credit_card_total = abs(credit_card_total)

    # --- Bank expenses ---
    bank_expenses_total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .outerjoin(Category, Transaction.category_id == Category.id)
        .filter(month_filter, Transaction.source == "bank_statement", Transaction.transaction_type == "expense")
        .filter(_countable_transaction_filter())
        .scalar()
    )
    bank_expenses_total = abs(bank_expenses_total)

    # --- Balance ---
    monthly_balance = total_income - total_expenses

    # --- Spending by person ---
    person_rows = (
        db.query(
            Person.id,
            Person.name,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .outerjoin(Transaction, and_(
            Transaction.person_id == Person.id,
            month_filter,
            Transaction.transaction_type == "expense",
        ))
        .outerjoin(Category, Transaction.category_id == Category.id)
        .filter(or_(Transaction.id.is_(None), _countable_transaction_filter()))
        .group_by(Person.id, Person.name)
        .all()
    )

    spending_by_person = []
    for pid, pname, ptotal in person_rows:
        ptotal = abs(ptotal)
        pct = (ptotal / total_expenses * 100) if total_expenses > 0 else 0
        spending_by_person.append(SpendingByPerson(
            person_id=pid, person_name=pname, total=ptotal, percentage=round(pct, 1)
        ))

    # --- Spending by category ---
    cat_rows = (
        db.query(
            Category.id,
            Category.name,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .outerjoin(Transaction, and_(
            Transaction.category_id == Category.id,
            month_filter,
            Transaction.transaction_type == "expense",
        ))
        .filter(Category.kind.in_(["fixed", "variable"]))
        .filter(Category.exclude_from_totals == False)
        .group_by(Category.id, Category.name)
        .having(func.sum(Transaction.amount) != 0)
        .all()
    )

    spending_by_category = []
    for cid, cname, ctotal in cat_rows:
        spending_by_category.append(SpendingByCategory(
            category_id=cid, category_name=cname, total=abs(ctotal)
        ))

    # --- Category limits ---
    limit_cats = db.query(Category).filter(
        Category.monthly_limit.isnot(None),
        Category.is_active == True,
        Category.exclude_from_totals == False,
    ).all()

    category_limits = []
    for cat in limit_cats:
        spent = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(
                month_filter,
                Transaction.category_id == cat.id,
                Transaction.transaction_type == "expense",
            )
            .scalar()
        )
        spent = abs(spent)
        pct = (spent / cat.monthly_limit * 100) if cat.monthly_limit > 0 else 0
        category_limits.append(CategoryLimit(
            category_id=cat.id,
            category_name=cat.name,
            spent=spent,
            limit=cat.monthly_limit,
            percentage=round(pct, 1),
            over_budget=spent > cat.monthly_limit,
        ))

    # --- Reserve goal ---
    goal = db.query(Goal).first()
    reserve_current = goal.current_amount if goal else 0
    reserve_goal = goal.target_amount if goal else 0
    reserve_pct = (reserve_current / reserve_goal * 100) if reserve_goal > 0 else 0

    # --- Pending review ---
    pending_count = (
        db.query(func.count(Transaction.id))
        .filter(month_filter, Transaction.is_reviewed == False)
        .scalar()
    )

    return DashboardOut(
        month=month,
        period_start=period_start,
        period_end=period_end,
        total_income=total_income,
        total_expenses=total_expenses,
        credit_card_total=credit_card_total,
        bank_expenses_total=bank_expenses_total,
        monthly_balance=monthly_balance,
        planned_savings=0,  # can be set via settings
        reserve_current=reserve_current,
        reserve_goal=reserve_goal,
        reserve_percentage=round(reserve_pct, 1),
        spending_by_person=spending_by_person,
        spending_by_category=spending_by_category,
        category_limits=category_limits,
        pending_review_count=pending_count,
    )
