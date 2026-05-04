from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import Goal, Transaction
from app.models.transaction import TransactionStatus, Category

router = APIRouter(prefix="/goals", tags=["goals"])


class GoalIn(BaseModel):
    name: str
    target: float
    current: Optional[float] = 0.0
    deadline: Optional[date] = None
    category_id: Optional[int] = None
    keyword: Optional[str] = None
    icon: Optional[str] = None


class GoalOut(GoalIn):
    id: int
    model_config = {"from_attributes": True}


def _category_ids(category_id: int, db: Session) -> list[int]:
    """Retorna a categoria e todas as suas subcategorias (1 nível)."""
    children = [r[0] for r in db.query(Category.id).filter(Category.parent_id == category_id).all()]
    return [category_id] + children


def _calculated_current(goal: Goal, db: Session) -> float:
    filters = [Transaction.goal_id == goal.id]
    if goal.category_id:
        # Inclui a categoria vinculada E todas as suas subcategorias
        cat_ids = _category_ids(goal.category_id, db)
        filters.append(Transaction.category_id.in_(cat_ids))

    tx_total = (
        db.query(func.coalesce(func.sum(func.abs(Transaction.amount)), 0.0))
        .filter(Transaction.status == TransactionStatus.confirmado)
        .filter(or_(*filters))
        .scalar()
    )
    return float(goal.current or 0.0) + float(tx_total or 0.0)


def _goal_out(goal: Goal, db: Session) -> GoalOut:
    return GoalOut(
        id=goal.id,
        name=goal.name,
        target=goal.target,
        current=_calculated_current(goal, db),
        deadline=goal.deadline,
        category_id=goal.category_id,
        keyword=goal.keyword,
    )


@router.get("/", response_model=list[GoalOut])
def list_goals(db: Session = Depends(get_db)):
    return [_goal_out(goal, db) for goal in db.query(Goal).order_by(Goal.id).all()]


@router.post("/", response_model=GoalOut, status_code=201)
def create_goal(data: GoalIn, db: Session = Depends(get_db)):
    goal = Goal(**data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _goal_out(goal, db)


@router.put("/{id}", response_model=GoalOut)
def update_goal(id: int, data: GoalIn, db: Session = Depends(get_db)):
    goal = db.query(Goal).get(id)
    if not goal:
        raise HTTPException(404)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(goal, k, v)
    db.commit()
    db.refresh(goal)
    return _goal_out(goal, db)


class DepositIn(BaseModel):
    amount: float
    description: str = "Aporte Manual"
    date: Optional[date] = None


@router.post("/{id}/deposit", response_model=GoalOut, status_code=201)
def deposit(id: int, data: DepositIn, db: Session = Depends(get_db)):
    goal = db.query(Goal).get(id)
    if not goal:
        raise HTTPException(404)
    tx = Transaction(
        date=data.date or date.today(),
        description=data.description,
        amount=abs(data.amount),
        goal_id=id,
        origin="Aporte Manual",
        status="confirmado",
    )
    db.add(tx)
    db.commit()
    return _goal_out(goal, db)


@router.delete("/{id}", status_code=204)
def delete_goal(id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).get(id)
    if not goal:
        raise HTTPException(404)
    db.delete(goal)
    db.commit()
