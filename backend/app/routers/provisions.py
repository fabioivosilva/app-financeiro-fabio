from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Provision

router = APIRouter(prefix="/provisions", tags=["provisions"])


class ProvisionIn(BaseModel):
    description: str
    amount: float
    day: int
    type: str = "mensal"
    category_id: Optional[int] = None
    active: bool = True
    installment_current: Optional[int] = None
    installment_total: Optional[int] = None


class ProvisionOut(ProvisionIn):
    id: int
    model_config = {"from_attributes": True}


@router.get("/", response_model=list[ProvisionOut])
def list_provisions(db: Session = Depends(get_db)):
    return db.query(Provision).order_by(Provision.day).all()


@router.post("/", response_model=ProvisionOut, status_code=201)
def create_provision(data: ProvisionIn, db: Session = Depends(get_db)):
    p = Provision(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/{id}", response_model=ProvisionOut)
def update_provision(id: int, data: ProvisionIn, db: Session = Depends(get_db)):
    p = db.query(Provision).get(id)
    if not p:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{id}", status_code=204)
def delete_provision(id: int, db: Session = Depends(get_db)):
    p = db.query(Provision).get(id)
    if not p:
        raise HTTPException(404)
    db.delete(p)
    db.commit()
