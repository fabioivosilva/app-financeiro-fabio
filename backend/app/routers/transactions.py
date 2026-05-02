"""Router: Transactions list + update."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db
from ..services.transaction_learning import categorize_with_learning

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _transaction_out(t) -> schemas.TransactionOut:
    out = schemas.TransactionOut.model_validate(t)
    out.category_name = t.category.name if t.category else None
    out.person_name = t.person.name if t.person else None
    return out


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
        results.append(_transaction_out(t))
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
    return _transaction_out(t)


@router.post("/{transaction_id}/categorize", response_model=schemas.TransactionCategorizeOut)
def categorize_transaction(
    transaction_id: int,
    data: schemas.TransactionCategorizeRequest,
    db: Session = Depends(get_db),
):
    t = crud.get_transaction(db, transaction_id)
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if not crud.get_category(db, data.category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    if data.person_id is not None and not crud.get_person(db, data.person_id):
        raise HTTPException(status_code=404, detail="Person not found")

    t, rule, similar_updated = categorize_with_learning(
        db,
        transaction=t,
        category_id=data.category_id,
        person_id=data.person_id,
        create_rule=data.create_rule,
        apply_similar=data.apply_similar,
    )
    return schemas.TransactionCategorizeOut(
        transaction=_transaction_out(t),
        rule_id=rule.id if rule else None,
        similar_updated=similar_updated,
    )
