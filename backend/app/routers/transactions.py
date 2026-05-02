"""Router: Transactions list + update."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[schemas.TransactionOut])
def list_transactions(
    month: Optional[str] = Query(None, description="YYYY-MM"),
    category_id: Optional[int] = None,
    person_id: Optional[int] = None,
    source: Optional[str] = None,
    pending: bool = False,
    db: Session = Depends(get_db),
):
    txns = crud.get_transactions(
        db,
        month=month,
        category_id=category_id,
        person_id=person_id,
        source=source,
        pending_only=pending,
    )
    results = []
    for t in txns:
        out = schemas.TransactionOut.model_validate(t)
        out.category_name = t.category.name if t.category else None
        out.person_name = t.person.name if t.person else None
        results.append(out)
    return results


@router.put("/{transaction_id}", response_model=schemas.TransactionOut)
def update_transaction(
    transaction_id: int,
    data: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
):
    updates = data.model_dump(exclude_unset=True)
    t = crud.update_transaction(db, transaction_id, **updates)
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    out = schemas.TransactionOut.model_validate(t)
    out.category_name = t.category.name if t.category else None
    out.person_name = t.person.name if t.person else None
    return out
