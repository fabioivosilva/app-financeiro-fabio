import re
import unicodedata
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Category, Provision, Transaction
from app.services.auto_provision import maybe_upsert_income_provision

router = APIRouter(prefix="/provisions", tags=["provisions"])


class ProvisionIn(BaseModel):
    description: str
    amount: float
    day: int
    type: str = "mensal"
    category_id: Optional[int] = None
    active: bool = True
    person_id: Optional[int] = None
    installment_current: Optional[int] = None
    installment_total: Optional[int] = None


class ProvisionOut(ProvisionIn):
    id: int
    model_config = {"from_attributes": True}


class ImportInstallmentsOut(BaseModel):
    created: int
    skipped: int


def _normalize_description(value: str) -> str:
    text = re.sub(r"\s+\d{1,3}/\d{1,3}\s*$", "", value.strip())
    text = unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", text).lower().strip()


@router.get("/", response_model=list[ProvisionOut])
def list_provisions(db: Session = Depends(get_db)):
    return db.query(Provision).order_by(Provision.day).all()


@router.post("/import-installments", response_model=ImportInstallmentsOut)
def import_installments(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(
        Transaction.installment_current.isnot(None),
        Transaction.installment_total.isnot(None),
        Transaction.installment_current < Transaction.installment_total,
    ).all()

    grouped: dict[str, list[Transaction]] = defaultdict(list)
    for tx in transactions:
        grouped[_normalize_description(tx.description)].append(tx)

    existing = db.query(Provision).filter(Provision.type == "parcela").all()
    existing_keys = {
        (_normalize_description(p.description), p.installment_current, p.installment_total)
        for p in existing
    }

    created = 0
    skipped = 0
    for normalized, items in grouped.items():
        latest = max(items, key=lambda tx: (tx.installment_current or 0, tx.date, tx.id))
        max_current = max(tx.installment_current or 0 for tx in items)
        total = latest.installment_total or 0
        if max_current >= total:
            continue

        next_installment = max_current + 1
        key = (normalized, next_installment, total)
        if key in existing_keys:
            skipped += 1
            continue

        avg_amount = sum(tx.amount for tx in items) / len(items)
        provision = Provision(
            description=latest.description,
            amount=-abs(avg_amount),
            day=min(max(latest.date.day, 1), 31),
            type="parcela",
            category_id=latest.category_id,
            active=True,
            person_id=latest.person_id,
            installment_current=next_installment,
            installment_total=total,
        )
        db.add(provision)
        existing_keys.add(key)
        created += 1

    db.commit()
    return {"created": created, "skipped": skipped}


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


@router.post("/reinforce-auto")
def reinforce_auto_provisions(db: Session = Depends(get_db)):
    """Re-runs auto-provision logic on all already-categorized transactions."""
    eligible_types = {"receita", "fixa"}
    cats = {c.id: c for c in db.query(Category).filter(Category.type.in_(eligible_types)).all()}
    txs = db.query(Transaction).filter(Transaction.category_id.in_(list(cats.keys()))).all()
    affected = 0
    for tx in txs:
        if maybe_upsert_income_provision(db, tx):
            affected += 1
    return {"processed": len(txs), "provisions_affected": affected}
