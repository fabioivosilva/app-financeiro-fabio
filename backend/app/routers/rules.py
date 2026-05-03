from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Rule

router = APIRouter(prefix="/rules", tags=["rules"])


class RuleIn(BaseModel):
    keyword: str
    category_id: Optional[int] = None
    person_id: Optional[int] = None
    origin: Optional[str] = None
    goal_id: Optional[int] = None


class RuleOut(RuleIn):
    id: int
    model_config = {"from_attributes": True}


@router.get("/", response_model=list[RuleOut])
def list_rules(db: Session = Depends(get_db)):
    return db.query(Rule).all()


@router.post("/", response_model=RuleOut, status_code=201)
def create_rule(data: RuleIn, db: Session = Depends(get_db)):
    rule = Rule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/{id}", response_model=RuleOut)
def update_rule(id: int, data: RuleIn, db: Session = Depends(get_db)):
    rule = db.query(Rule).get(id)
    if not rule:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(rule, k, v)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{id}", status_code=204)
def delete_rule(id: int, db: Session = Depends(get_db)):
    rule = db.query(Rule).get(id)
    if not rule:
        raise HTTPException(404)
    db.delete(rule)
    db.commit()
