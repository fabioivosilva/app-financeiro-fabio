"""
Snapshot de regras + categorias para auto-sync entre instalações.

Fluxo:
- `build_snapshot(db)` serializa categorias e regras em JSON-friendly dict.
- `apply_snapshot(db, payload)` faz upsert por nome (categorias) e por keyword
  normalizada (regras), preservando IDs locais.
- `write_snapshot_file(db, path=None)` escreve o snapshot em
  `data/sync_snapshot.json` para que a outra instalação possa importar via
  `POST /sync/apply` mesmo offline.

Categorias usam `name` como chave natural; regras usam `keyword` normalizada.
Pessoas e metas referenciadas em regras são opcionais e referenciadas por nome.
"""
from __future__ import annotations

import json
import os
import unicodedata
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.database import DB_PATH
from app.models import Category, Goal, Person, Rule


SNAPSHOT_VERSION = 1


def _normalize_keyword(text: str) -> str:
    return unicodedata.normalize("NFD", text or "").encode("ascii", "ignore").decode().lower().strip()


def _snapshot_path() -> str:
    base_dir = os.path.dirname(os.path.abspath(DB_PATH))
    os.makedirs(base_dir, exist_ok=True)
    return os.path.join(base_dir, "sync_snapshot.json")


def build_snapshot(db: Session) -> dict[str, Any]:
    cats = db.query(Category).order_by(Category.id).all()
    cat_by_id = {c.id: c for c in cats}
    categories = [
        {
            "name": c.name,
            "color": c.color,
            "icon": c.icon,
            "limit_value": c.limit_value,
            "type": c.type,
            "exclude_totals": bool(c.exclude_totals),
            "parent_name": cat_by_id[c.parent_id].name if c.parent_id and c.parent_id in cat_by_id else None,
        }
        for c in cats
    ]

    rules: list[dict[str, Any]] = []
    for r in db.query(Rule).order_by(Rule.id).all():
        cat_name = cat_by_id[r.category_id].name if r.category_id and r.category_id in cat_by_id else None
        person_name = None
        if r.person_id:
            person = db.query(Person).get(r.person_id)
            person_name = person.name if person else None
        goal_name = None
        if r.goal_id:
            goal = db.query(Goal).get(r.goal_id)
            goal_name = goal.name if goal else None
        rules.append(
            {
                "keyword": r.keyword,
                "category_name": cat_name,
                "person_name": person_name,
                "origin": r.origin,
                "goal_name": goal_name,
            }
        )

    return {
        "version": SNAPSHOT_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "categories": categories,
        "rules": rules,
    }


def apply_snapshot(db: Session, payload: dict[str, Any]) -> dict[str, int]:
    if not isinstance(payload, dict):
        raise ValueError("payload deve ser um objeto JSON")

    cat_payload = payload.get("categories") or []
    rule_payload = payload.get("rules") or []
    if not isinstance(cat_payload, list) or not isinstance(rule_payload, list):
        raise ValueError("categories e rules precisam ser listas")

    categories_created = 0
    categories_updated = 0
    rules_created = 0
    rules_updated = 0

    # Pass 1: upsert categorias sem parent_id (resolve depois).
    by_name: dict[str, Category] = {c.name: c for c in db.query(Category).all()}
    for entry in cat_payload:
        name = (entry.get("name") or "").strip()
        if not name:
            continue
        cat = by_name.get(name)
        if cat:
            cat.color = entry.get("color") or cat.color
            cat.icon = entry.get("icon") or cat.icon
            cat.limit_value = entry.get("limit_value") if entry.get("limit_value") is not None else cat.limit_value
            cat.type = entry.get("type") or cat.type
            cat.exclude_totals = bool(entry.get("exclude_totals")) if entry.get("exclude_totals") is not None else cat.exclude_totals
            categories_updated += 1
        else:
            cat = Category(
                name=name,
                color=entry.get("color") or "#888888",
                icon=entry.get("icon") or "label",
                limit_value=entry.get("limit_value"),
                type=entry.get("type") or "variavel",
                exclude_totals=bool(entry.get("exclude_totals") or False),
                parent_id=None,
            )
            db.add(cat)
            categories_created += 1
            by_name[name] = cat
    db.flush()

    # Pass 2: aplica parent_id por nome.
    for entry in cat_payload:
        name = (entry.get("name") or "").strip()
        parent_name = (entry.get("parent_name") or "").strip() or None
        if not name:
            continue
        cat = by_name.get(name)
        if not cat:
            continue
        if parent_name:
            parent = by_name.get(parent_name)
            cat.parent_id = parent.id if parent else None
        else:
            cat.parent_id = None
    db.flush()

    # Pass 3: upsert regras por keyword normalizada.
    existing_rules = db.query(Rule).all()
    by_keyword: dict[str, Rule] = {}
    for rule in existing_rules:
        by_keyword[_normalize_keyword(rule.keyword)] = rule

    for entry in rule_payload:
        keyword = (entry.get("keyword") or "").strip()
        if not keyword:
            continue
        cat_name = entry.get("category_name") or None
        category_id = by_name[cat_name].id if cat_name and cat_name in by_name else None
        person_id = None
        if entry.get("person_name"):
            person = db.query(Person).filter(Person.name == entry["person_name"]).first()
            person_id = person.id if person else None
        goal_id = None
        if entry.get("goal_name"):
            goal = db.query(Goal).filter(Goal.name == entry["goal_name"]).first()
            goal_id = goal.id if goal else None

        rule = by_keyword.get(_normalize_keyword(keyword))
        if rule:
            rule.keyword = keyword
            rule.category_id = category_id
            rule.person_id = person_id
            rule.origin = entry.get("origin")
            rule.goal_id = goal_id
            rules_updated += 1
        else:
            rule = Rule(
                keyword=keyword,
                category_id=category_id,
                person_id=person_id,
                origin=entry.get("origin"),
                goal_id=goal_id,
            )
            db.add(rule)
            rules_created += 1
            by_keyword[_normalize_keyword(keyword)] = rule

    db.commit()

    return {
        "categories_created": categories_created,
        "categories_updated": categories_updated,
        "rules_created": rules_created,
        "rules_updated": rules_updated,
    }


def write_snapshot_file(db: Session, path: Optional[str] = None) -> str:
    """Escreve o snapshot atual no disco. Falha silenciosamente em I/O error."""
    target = path or _snapshot_path()
    try:
        snapshot = build_snapshot(db)
        with open(target, "w", encoding="utf-8") as fp:
            json.dump(snapshot, fp, ensure_ascii=False, indent=2)
        return target
    except OSError:
        return target


def read_snapshot_file(path: Optional[str] = None) -> Optional[dict[str, Any]]:
    target = path or _snapshot_path()
    if not os.path.exists(target):
        return None
    try:
        with open(target, "r", encoding="utf-8") as fp:
            return json.load(fp)
    except (OSError, json.JSONDecodeError):
        return None
