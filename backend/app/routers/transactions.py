from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import Transaction
from app.services.provision_engine import evaluate_transaction_for_provision

router = APIRouter(prefix="/transactions", tags=["transactions"])


class TransactionIn(BaseModel):
    date: date
    description: str
    amount: float
    category_id: Optional[int] = None
    person_id: Optional[int] = None
    card_id: Optional[int] = None
    origin: Optional[str] = "Débito"
    status: Optional[str] = "confirmado"
    installment_current: Optional[int] = None
    installment_total: Optional[int] = None
    goal_id: Optional[int] = None
    external_id: Optional[str] = None


class TransactionOut(TransactionIn):
    id: int
    model_config = {"from_attributes": True}


@router.get("/", response_model=list[TransactionOut])
def list_transactions(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    person_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    goal_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Transaction)
    if month and year:
        q = q.filter(
            Transaction.date >= date(year, month, 1),
            Transaction.date < date(year + (month // 12), (month % 12) + 1, 1),
        )
    if category_id:
        q = q.filter(Transaction.category_id == category_id)
    if person_id:
        q = q.filter(Transaction.person_id == person_id)
    if status:
        q = q.filter(Transaction.status == status)
    if goal_id:
        q = q.filter(Transaction.goal_id == goal_id)
    return q.order_by(Transaction.date.desc()).all()


@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(data: TransactionIn, db: Session = Depends(get_db)):
    t = Transaction(**data.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/{id}", response_model=TransactionOut)
def update_transaction(id: int, data: TransactionIn, response: Response, db: Session = Depends(get_db)):
    t = db.query(Transaction).get(id)
    if not t:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(t, k, v)
    db.commit()
    db.refresh(t)

    # Motor de provisão central
    prov_result = evaluate_transaction_for_provision(db, t)
    provision = prov_result.get("provision")
    if provision:
        response.headers["X-Auto-Provision-Id"] = str(provision.id)
        response.headers["X-Auto-Provision-Description"] = provision.description
        response.headers["X-Auto-Provision-Amount"] = str(provision.amount)
        response.headers["X-Auto-Provision-Day"] = str(provision.day)

    return t


@router.delete("/{id}", status_code=204)
def delete_transaction(id: int, db: Session = Depends(get_db)):
    t = db.query(Transaction).get(id)
    if not t:
        raise HTTPException(404)
    db.delete(t)
    db.commit()


@router.delete("/", status_code=200)
def clear_all_transactions(db: Session = Depends(get_db)):
    """Remove todas as transações. Preserva pessoas, cartões, categorias e regras."""
    deleted = db.query(Transaction).delete()
    db.commit()
    return {"deleted": deleted}
