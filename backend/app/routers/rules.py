import unicodedata
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Rule, Transaction
from app.services.provision_engine import evaluate_transaction_for_provision
from app.services.sync import write_snapshot_file

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
    # Upsert: se já existe regra com mesmo keyword (normalizado), atualiza
    norm = _normalize(data.keyword.strip())
    existing = db.query(Rule).all()
    match = next((r for r in existing if _normalize(r.keyword.strip()) == norm), None)
    if match:
        for k, v in data.model_dump().items():
            setattr(match, k, v)
        db.commit()
        db.refresh(match)
        write_snapshot_file(db)
        return match
    rule = Rule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    write_snapshot_file(db)
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
    write_snapshot_file(db)
    return rule


@router.delete("/{id}", status_code=204)
def delete_rule(id: int, db: Session = Depends(get_db)):
    rule = db.query(Rule).get(id)
    if not rule:
        raise HTTPException(404)
    db.delete(rule)
    db.commit()
    write_snapshot_file(db)


def _normalize(text: str) -> str:
    return unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode().lower()


def apply_rules_to(transactions: list, rules: list) -> int:
    """Aplica regras a uma lista de transações sem categoria. Retorna quantas foram atualizadas."""
    updated = 0
    for tx in transactions:
        if tx.category_id is not None:
            continue
        desc = _normalize(tx.description)
        for rule in rules:
            if rule.category_id and _normalize(rule.keyword) in desc:
                tx.category_id = rule.category_id
                if rule.person_id:
                    tx.person_id = rule.person_id
                tx.status = "confirmado"
                updated += 1
                break
    return updated


@router.post("/deduplicate", summary="Remove regras duplicadas pelo mesmo keyword")
def deduplicate_rules(db: Session = Depends(get_db)):
    rules = db.query(Rule).order_by(Rule.id).all()
    seen: dict[str, int] = {}
    removed = 0
    for rule in rules:
        norm = _normalize(rule.keyword.strip())
        if norm in seen:
            db.delete(rule)
            removed += 1
        else:
            seen[norm] = rule.id
    db.commit()
    return {"removed": removed}


@router.post("/apply", summary="Aplica regras a todas as transações sem categoria")
def apply_rules(db: Session = Depends(get_db)):
    from app.models import Category as Cat
    rules = db.query(Rule).filter(Rule.category_id.isnot(None)).all()
    if not rules:
        return {"updated": 0, "auto_provisions": 0}
    pending = db.query(Transaction).filter(Transaction.category_id.is_(None)).all()
    updated = apply_rules_to(pending, rules)
    db.commit()
    eligible_behaviors = {"recurring_income", "fixed_expense", "installment"}
    all_cats = db.query(Cat).all()
    parent_ids = {c.id for c in all_cats if (c.provision_behavior or "none") in eligible_behaviors}
    cat_ids = {
        c.id for c in all_cats
        if (c.provision_behavior or "none") in eligible_behaviors
        or (getattr(c, "parent_id", None) in parent_ids)
    }
    auto_provisions = 0
    for tx in pending:
        if tx.category_id in cat_ids:
            result = evaluate_transaction_for_provision(db, tx)
            if result.get("provision") or result.get("installments"):
                auto_provisions += 1
    return {"updated": updated, "auto_provisions": auto_provisions}
