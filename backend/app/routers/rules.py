"""Router: Rules CRUD."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/rules", tags=["rules"])


@router.get("/", response_model=list[schemas.RuleOut])
def list_rules(db: Session = Depends(get_db)):
    rules = crud.get_rules(db)
    results = []
    for r in rules:
        out = schemas.RuleOut.model_validate(r)
        out.category_name = r.category.name if r.category else None
        out.person_name = r.person.name if r.person else None
        results.append(out)
    return results


@router.post("/", response_model=schemas.RuleOut, status_code=201)
def create_rule(data: schemas.RuleCreate, db: Session = Depends(get_db)):
    r = crud.create_rule(db, **data.model_dump())
    out = schemas.RuleOut.model_validate(r)
    out.category_name = r.category.name if r.category else None
    out.person_name = r.person.name if r.person else None
    return out


@router.put("/{rule_id}", response_model=schemas.RuleOut)
def update_rule(rule_id: int, data: schemas.RuleUpdate, db: Session = Depends(get_db)):
    updates = data.model_dump(exclude_unset=True)
    r = crud.update_rule(db, rule_id, **updates)
    if not r:
        raise HTTPException(status_code=404, detail="Rule not found")
    out = schemas.RuleOut.model_validate(r)
    out.category_name = r.category.name if r.category else None
    out.person_name = r.person.name if r.person else None
    return out


@router.delete("/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    if not crud.delete_rule(db, rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
