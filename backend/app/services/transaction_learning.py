from typing import Optional
from sqlalchemy.orm import Session
from ..models import Rule, Transaction
from .categorizer import build_learning_keyword, normalize_text


def categorize_with_learning(
    db: Session,
    transaction: Transaction,
    category_id: int,
    person_id: Optional[int] = None,
    create_rule: bool = True,
    apply_similar: bool = True,
) -> tuple[Transaction, Optional[Rule], int]:
    keyword = build_learning_keyword(transaction.description)
    rule_person_id = person_id if person_id is not None else transaction.person_id

    transaction.category_id = category_id
    if person_id is not None:
        transaction.person_id = person_id
    transaction.is_reviewed = True

    rule = None
    if create_rule:
        for existing_rule in db.query(Rule).filter(Rule.is_active == True).all():
            same_keyword = normalize_text(existing_rule.keyword) == keyword
            same_source = existing_rule.source == transaction.source
            same_category = existing_rule.category_id == category_id
            same_person = existing_rule.person_id == rule_person_id
            if same_keyword and same_source and same_category and same_person:
                rule = existing_rule
                break

        if rule is None:
            rule = Rule(
                keyword=keyword,
                category_id=category_id,
                person_id=rule_person_id,
                source=transaction.source,
                priority=20,
                is_active=True,
            )
            db.add(rule)

    similar_updated = 0
    if apply_similar:
        candidates = (
            db.query(Transaction)
            .filter(
                Transaction.id != transaction.id,
                Transaction.source == transaction.source,
                Transaction.is_reviewed == False,
            )
            .all()
        )
        for candidate in candidates:
            if normalize_text(candidate.description) != keyword:
                continue
            candidate.category_id = category_id
            if rule_person_id is not None and candidate.person_id is None:
                candidate.person_id = rule_person_id
            candidate.is_reviewed = True
            similar_updated += 1

    db.commit()
    db.refresh(transaction)
    if rule is not None:
        db.refresh(rule)
    return transaction, rule, similar_updated
