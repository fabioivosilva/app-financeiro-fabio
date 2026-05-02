"""
CRUD operations for all models.
"""
from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import extract
from . import models


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
) -> List[models.Transaction]:
    q = db.query(models.Transaction)
    if month:
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
def get_goals(db: Session) -> List[models.Goal]:
    return db.query(models.Goal).all()

def get_goal(db: Session, goal_id: int) -> Optional[models.Goal]:
    return db.query(models.Goal).filter(models.Goal.id == goal_id).first()

def create_goal(db: Session, **kwargs) -> models.Goal:
    g = models.Goal(**kwargs)
    db.add(g)
    db.commit()
    db.refresh(g)
    return g

def update_goal(db: Session, goal_id: int, **kwargs) -> Optional[models.Goal]:
    g = get_goal(db, goal_id)
    if g:
        for k, v in kwargs.items():
            if hasattr(g, k) and v is not None:
                setattr(g, k, v)
        db.commit()
        db.refresh(g)
    return g


# ---------------------------------------------------------------------------
# File Imports
# ---------------------------------------------------------------------------
def get_imports(db: Session) -> List[models.FileImport]:
    return db.query(models.FileImport).order_by(models.FileImport.imported_at.desc()).all()
