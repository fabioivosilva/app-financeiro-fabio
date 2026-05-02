"""
CRUD operations for all models.
"""
from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import extract
from . import models


FINANCIAL_CYCLE_START_DAY = 27


def financial_period(month: str) -> tuple[date, date]:
    year, m = map(int, month.split("-"))
    if m == 1:
        start_year, start_month = year - 1, 12
    else:
        start_year, start_month = year, m - 1
    return (
        date(start_year, start_month, FINANCIAL_CYCLE_START_DAY),
        date(year, m, FINANCIAL_CYCLE_START_DAY - 1),
    )


# ---------------------------------------------------------------------------
# Persons
# ---------------------------------------------------------------------------
def get_persons(db: Session) -> List[models.Person]:
    return db.query(models.Person).order_by(models.Person.name).all()

def get_person(db: Session, person_id: int) -> Optional[models.Person]:
    return db.query(models.Person).filter(models.Person.id == person_id).first()

def create_person(db: Session, name: str) -> models.Person:
    p = models.Person(name=name)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

def update_person(db: Session, person_id: int, name: str) -> Optional[models.Person]:
    p = get_person(db, person_id)
    if p:
        p.name = name
        db.commit()
        db.refresh(p)
    return p


# ---------------------------------------------------------------------------
# Cards
# ---------------------------------------------------------------------------
def get_cards(db: Session) -> List[models.Card]:
    return db.query(models.Card).all()

def get_card(db: Session, card_id: int) -> Optional[models.Card]:
    return db.query(models.Card).filter(models.Card.id == card_id).first()

def get_card_by_digits(db: Session, last_digits: str) -> Optional[models.Card]:
    return db.query(models.Card).filter(models.Card.last_digits == last_digits).first()

def create_card(db: Session, last_digits: str, person_id: int = None, description: str = None) -> models.Card:
    c = models.Card(last_digits=last_digits, person_id=person_id, description=description)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

def update_card(db: Session, card_id: int, **kwargs) -> Optional[models.Card]:
    c = get_card(db, card_id)
    if c:
        for k, v in kwargs.items():
            if hasattr(c, k) and v is not None:
                setattr(c, k, v)
        db.commit()
        db.refresh(c)
    return c


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------
def get_categories(db: Session, active_only: bool = True) -> List[models.Category]:
    q = db.query(models.Category)
    if active_only:
        q = q.filter(models.Category.is_active == True)
    return q.order_by(models.Category.kind, models.Category.name).all()

def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def create_category(db: Session, **kwargs) -> models.Category:
    c = models.Category(**kwargs)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

def update_category(db: Session, category_id: int, **kwargs) -> Optional[models.Category]:
    c = get_category(db, category_id)
    if c:
        for k, v in kwargs.items():
            if hasattr(c, k) and v is not None:
                setattr(c, k, v)
        db.commit()
        db.refresh(c)
    return c

def soft_delete_category(db: Session, category_id: int) -> Optional[models.Category]:
    c = get_category(db, category_id)
    if c:
        c.is_active = False
        db.commit()
        db.refresh(c)
    return c


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------
def get_transactions(
    db: Session,
    month: Optional[str] = None,
    category_id: Optional[int] = None,
    person_id: Optional[int] = None,
    source: Optional[str] = None,
    pending_only: bool = False,
    financial_cycle: bool = False,
) -> List[models.Transaction]:
    q = db.query(models.Transaction)
    if month:
        if financial_cycle:
            period_start, period_end = financial_period(month)
            q = q.filter(
                models.Transaction.date >= period_start,
                models.Transaction.date <= period_end,
            )
        else:
            year, m = map(int, month.split("-"))
            q = q.filter(
                extract("year", models.Transaction.date) == year,
                extract("month", models.Transaction.date) == m,
            )
    if category_id:
        q = q.filter(models.Transaction.category_id == category_id)
    if person_id:
        q = q.filter(models.Transaction.person_id == person_id)
    if source:
        q = q.filter(models.Transaction.source == source)
    if pending_only:
        q = q.filter(models.Transaction.is_reviewed == False)
    return q.order_by(models.Transaction.date.desc()).all()

def get_transaction(db: Session, txn_id: int) -> Optional[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.id == txn_id).first()

def update_transaction(db: Session, txn_id: int, **kwargs) -> Optional[models.Transaction]:
    t = get_transaction(db, txn_id)
    if t:
        for k, v in kwargs.items():
            if hasattr(t, k) and v is not None:
                setattr(t, k, v)
        db.commit()
        db.refresh(t)
    return t

def transaction_exists(db: Session, external_id: str = None, hash_val: str = None) -> bool:
    """Check if a transaction already exists by external_id or hash."""
    if external_id:
        return db.query(models.Transaction).filter(
            models.Transaction.external_id == external_id
        ).first() is not None
    if hash_val:
        return db.query(models.Transaction).filter(
            models.Transaction.hash == hash_val
        ).first() is not None
    return False

def get_transaction_by_hash(db: Session, hash_val: str) -> Optional[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.hash == hash_val).first()


# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------
def get_rules(db: Session) -> List[models.Rule]:
    return db.query(models.Rule).order_by(models.Rule.priority.desc()).all()

def get_rule(db: Session, rule_id: int) -> Optional[models.Rule]:
    return db.query(models.Rule).filter(models.Rule.id == rule_id).first()

def create_rule(db: Session, **kwargs) -> models.Rule:
    r = models.Rule(**kwargs)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r

def update_rule(db: Session, rule_id: int, **kwargs) -> Optional[models.Rule]:
    r = get_rule(db, rule_id)
    if r:
        for k, v in kwargs.items():
            if hasattr(r, k) and v is not None:
                setattr(r, k, v)
        db.commit()
        db.refresh(r)
    return r

def delete_rule(db: Session, rule_id: int) -> bool:
    r = get_rule(db, rule_id)
    if r:
        db.delete(r)
        db.commit()
        return True
    return False


# ---------------------------------------------------------------------------
# Goals
# ---------------------------------------------------------------------------
from sqlalchemy import func

def _enrich_goal(db: Session, goal: models.Goal) -> models.Goal:
    if not goal:
        return goal
    linked_sum = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))\
        .join(models.Category, models.Transaction.category_id == models.Category.id)\
        .filter(models.Category.goal_id == goal.id)\
        .scalar()
    # Assuming expenses are negative or positive, we want the absolute sum stored
    setattr(goal, "linked_transactions_sum", abs(linked_sum))
    return goal

def get_goals(db: Session) -> List[models.Goal]:
    goals = db.query(models.Goal).all()
    return [_enrich_goal(db, g) for g in goals]

def get_goal(db: Session, goal_id: int) -> Optional[models.Goal]:
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    return _enrich_goal(db, goal)

def create_goal(db: Session, **kwargs) -> models.Goal:
    g = models.Goal(**kwargs)
    db.add(g)
    db.commit()
    db.refresh(g)
    return _enrich_goal(db, g)

def update_goal(db: Session, goal_id: int, **kwargs) -> Optional[models.Goal]:
    g = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if g:
        for k, v in kwargs.items():
            if hasattr(g, k) and v is not None:
                setattr(g, k, v)
        db.commit()
        db.refresh(g)
    return _enrich_goal(db, g)

def delete_goal(db: Session, goal_id: int) -> bool:
    g = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if g:
        # Nullify goal_id in associated categories
        db.query(models.Category).filter(models.Category.goal_id == goal_id)\
          .update({models.Category.goal_id: None})
        db.delete(g)
        db.commit()
        return True
    return False


# ---------------------------------------------------------------------------
# Provisions
# ---------------------------------------------------------------------------
import calendar as _cal

def _add_months(dt: date, months: int) -> date:
    month = dt.month - 1 + months
    year = dt.year + month // 12
    month = month % 12 + 1
    day = min(dt.day, _cal.monthrange(year, month)[1])
    return date(year, month, day)


def _generate_occurrences(provision: models.Provision) -> list:
    result = []
    current = provision.start_date
    end = provision.end_date
    rec = provision.recurrence

    if rec == "once":
        result.append(models.ProvisionOccurrence(
            expected_date=current,
            expected_amount=provision.amount,
            status="pending",
        ))
        return result

    delta = {"monthly": 1, "quarterly": 3, "annual": 12}.get(rec, 1)
    max_occ = {"monthly": 24, "quarterly": 8, "annual": 5}.get(rec, 24)

    count = 0
    while count < max_occ:
        if end and current > end:
            break
        result.append(models.ProvisionOccurrence(
            expected_date=current,
            expected_amount=provision.amount,
            status="pending",
        ))
        current = _add_months(current, delta)
        count += 1

    return result


def _enrich_provision(provision: models.Provision) -> models.Provision:
    occs = provision.occurrences
    setattr(provision, "pending_count", sum(1 for o in occs if o.status == "pending"))
    setattr(provision, "realized_count", sum(1 for o in occs if o.status == "realized"))
    return provision


def get_provisions(db: Session) -> list:
    provisions = (
        db.query(models.Provision)
        .filter(models.Provision.is_active == True)
        .order_by(models.Provision.created_at.desc())
        .all()
    )
    return [_enrich_provision(p) for p in provisions]


def get_provision(db: Session, provision_id: int) -> Optional[models.Provision]:
    p = db.query(models.Provision).filter(models.Provision.id == provision_id).first()
    return _enrich_provision(p) if p else None


def create_provision(db: Session, **kwargs) -> models.Provision:
    p = models.Provision(**kwargs)
    db.add(p)
    db.flush()
    for occ in _generate_occurrences(p):
        occ.provision_id = p.id
        db.add(occ)
    db.commit()
    db.refresh(p)
    return _enrich_provision(p)


def update_provision(db: Session, provision_id: int, **kwargs) -> Optional[models.Provision]:
    p = db.query(models.Provision).filter(models.Provision.id == provision_id).first()
    if not p:
        return None

    regenerate = any(k in kwargs for k in ("amount", "start_date", "end_date", "recurrence"))

    for k, v in kwargs.items():
        if hasattr(p, k):
            setattr(p, k, v)

    if regenerate:
        realized_dates = {
            occ.expected_date
            for occ in p.occurrences
            if occ.status in ("realized", "adjusted")
        }
        db.query(models.ProvisionOccurrence).filter(
            models.ProvisionOccurrence.provision_id == provision_id,
            models.ProvisionOccurrence.status == "pending",
        ).delete(synchronize_session="fetch")
        for occ in _generate_occurrences(p):
            if occ.expected_date not in realized_dates:
                occ.provision_id = p.id
                db.add(occ)

    db.commit()
    db.refresh(p)
    return _enrich_provision(p)


def delete_provision(db: Session, provision_id: int) -> bool:
    p = db.query(models.Provision).filter(models.Provision.id == provision_id).first()
    if not p:
        return False
    db.delete(p)
    db.commit()
    return True


def get_occurrences(db: Session, provision_id: int) -> list:
    return (
        db.query(models.ProvisionOccurrence)
        .filter(models.ProvisionOccurrence.provision_id == provision_id)
        .order_by(models.ProvisionOccurrence.expected_date)
        .all()
    )


def update_occurrence(db: Session, occurrence_id: int, **kwargs) -> Optional[models.ProvisionOccurrence]:
    occ = db.query(models.ProvisionOccurrence).filter(models.ProvisionOccurrence.id == occurrence_id).first()
    if not occ:
        return None
    for k, v in kwargs.items():
        if hasattr(occ, k) and v is not None:
            setattr(occ, k, v)
    db.commit()
    db.refresh(occ)
    return occ


# ---------------------------------------------------------------------------
# File Imports
# ---------------------------------------------------------------------------
def get_imports(db: Session) -> List[models.FileImport]:
    return db.query(models.FileImport).order_by(models.FileImport.imported_at.desc()).all()
