from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import Goal

router = APIRouter(prefix="/goals", tags=["goals"])


class GoalIn(BaseModel):
    name: str
    target: float
    current: Optional[float] = 0.0
    deadline: Optional[date] = None
    category_id: Optional[int] = None
    keyword: Optional[str] = None


class GoalOut(GoalIn):
    id: int
    model_config = {"from_attributes": True}


@router.get("/", response_model=list[GoalOut])
def list_goals(db: Session = Depends(get_db)):
    return db.query(Goal).all()


@router.post("/", response_model=GoalOut, status_code=201)
def create_goal(data: GoalIn, db: Session = Depends(get_db)):
    goal = Goal(**data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{id}", response_model=GoalOut)
def update_goal(id: int, data: GoalIn, db: Session = Depends(get_db)):
    goal = db.query(Goal).get(id)
    if not goal:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(goal, k, v)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{id}", status_code=204)
def delete_goal(id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).get(id)
    if not goal:
        raise HTTPException(404)
    db.delete(goal)
    db.commit()
