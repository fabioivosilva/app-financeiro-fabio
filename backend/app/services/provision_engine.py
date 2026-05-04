"""
provision_engine.py — Motor central de provisões.

Ponto único de verdade para criação/atualização de provisões.
Chamado após: importação OFX/PDF/Excel, PUT /transactions/{id}, apply rules.

Comportamentos por provision_behavior da categoria:
  recurring_income  → upsert provisão de receita (2+ ciclos = confirmed)
  fixed_expense     → upsert provisão de despesa fixa (2+ ciclos = confirmed)
  installment       → cria provisões futuras das parcelas restantes
  none              → não cria provisão
"""
from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Category, Person, Card, Provision, Transaction


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def _diff_cycles(txs: list[Transaction]) -> int:
    return len({(t.date.year, t.date.month) for t in txs})


def _avg_amount(txs: list[Transaction]) -> float:
    return sum(t.amount for t in txs) / len(txs)


def _avg_day(txs: list[Transaction]) -> int:
    avg = sum(t.date.day for t in txs) / len(txs)
    return max(1, min(31, round(avg)))


def _similar_txs(db: Session, tx: Transaction, cat: Category) -> list[Transaction]:
    """Transações da mesma categoria/dono com sinal correto."""
    q = db.query(Transaction).filter(Transaction.category_id == cat.id)
    if cat.provision_behavior == "recurring_income":
        q = q.filter(Transaction.amount > 0)
    else:
        q = q.filter(Transaction.amount < 0)
    if tx.person_id is not None:
        q = q.filter(Transaction.person_id == tx.person_id)
    else:
        q = q.filter(Transaction.person_id.is_(None))
    return q.all()


def _find_recurrent_provision(
    db: Session, cat_id: int, person_id: Optional[int]
) -> Optional[Provision]:
    q = db.query(Provision).filter(
        Provision.category_id == cat_id,
        Provision.type == "mensal",
    )
    if person_id is not None:
        exact = q.filter(Provision.person_id == person_id).first()
        if exact:
            return exact
        # Fallback: sem pessoa — evita duplicar quando regra atribuiu pessoa depois
        return q.filter(Provision.person_id.is_(None)).first()
    return q.filter(Provision.person_id.is_(None)).first()


def _add_months(base: date, months: int) -> date:
    """Avança N meses sem usar dateutil."""
    import calendar
    month = base.month - 1 + months
    year = base.year + month // 12
    month = month % 12 + 1
    day = min(base.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


# ──────────────────────────────────────────────────────────────
# Handlers por behavior
# ──────────────────────────────────────────────────────────────

def _best_description(txs: list[Transaction], cat: Category) -> str:
    """Usa a descrição da transação mais recente como nome da provisão."""
    if not txs:
        return cat.name
    latest = max(txs, key=lambda t: (t.date, t.id))
    return latest.description or cat.name


def _handle_recurrent(
    db: Session, tx: Transaction, cat: Category
) -> Optional[Provision]:
    """recurring_income | fixed_expense → upsert provisão mensal."""
    txs = _similar_txs(db, tx, cat)
    if _diff_cycles(txs) < 2:
        return None  # Ainda não recorrente — só 1 ciclo

    avg_amt = round(_avg_amount(txs), 2)
    avg_d   = _avg_day(txs)
    desc    = _best_description(txs, cat)

    existing = _find_recurrent_provision(db, cat.id, tx.person_id)
    if existing:
        existing.amount      = avg_amt
        existing.day         = avg_d
        existing.description = desc
        existing.active      = True
        db.commit()
        db.refresh(existing)
        return existing

    prov = Provision(
        description=desc,
        amount=avg_amt,
        day=avg_d,
        type="mensal",
        category_id=cat.id,
        person_id=tx.person_id,
        active=True,
    )
    db.add(prov)
    db.commit()
    db.refresh(prov)
    return prov


def _handle_installment(
    db: Session, tx: Transaction, cat: Category
) -> list[Provision]:
    """installment → cria provisões para parcelas futuras ainda não existentes."""
    if not tx.installment_current or not tx.installment_total:
        return []
    if tx.installment_current >= tx.installment_total:
        return []  # Última parcela, sem futuras

    created: list[Provision] = []
    base_desc = tx.description or ""
    # Normaliza: remove sufixo "01/10" ou "1/10" do final
    import re
    base_desc = re.sub(r"\s+\d{1,2}/\d{1,2}\s*$", "", base_desc).strip()

    remaining_start = tx.installment_current + 1
    remaining_total = tx.installment_total

    for n in range(remaining_start, remaining_total + 1):
        months_ahead = n - tx.installment_current
        due_date = _add_months(tx.date, months_ahead)

        # Deduplicação: mesma desc base + parcela + mês/ano
        already = db.query(Provision).filter(
            Provision.description.like(f"%{base_desc}%"),
            Provision.installment_current == n,
            Provision.installment_total == remaining_total,
            Provision.type == "parcela",
        )
        if tx.person_id:
            already = already.filter(Provision.person_id == tx.person_id)
        if already.first():
            continue

        label = f"{base_desc} {n:02d}/{remaining_total:02d}"
        prov = Provision(
            description=label,
            amount=tx.amount,
            day=due_date.day,
            type="parcela",
            category_id=tx.category_id,
            person_id=tx.person_id,
            installment_current=n,
            installment_total=remaining_total,
            active=True,
        )
        db.add(prov)
        created.append(prov)

    if created:
        db.commit()
        for p in created:
            db.refresh(p)
    return created


# ──────────────────────────────────────────────────────────────
# Ponto de entrada público
# ──────────────────────────────────────────────────────────────

def evaluate_transaction_for_provision(
    db: Session,
    transaction: Transaction,
) -> dict:
    """
    Motor principal. Chamar após qualquer categorização/update de transação.

    Retorna dict com:
      provision: Provision | None  — provisão recorrente criada/atualizada
      installments: list[Provision] — parcelas futuras criadas
    """
    result = {"provision": None, "installments": []}

    if not transaction.category_id:
        return result

    cat = db.query(Category).get(transaction.category_id)
    if not cat:
        return result

    behavior = cat.provision_behavior or "none"

    # Subcategorias herdam o behavior do pai quando não têm o próprio configurado
    if behavior == "none" and getattr(cat, "parent_id", None):
        parent = db.query(Category).get(cat.parent_id)
        if parent:
            behavior = parent.provision_behavior or "none"

    if behavior in ("recurring_income", "fixed_expense"):
        result["provision"] = _handle_recurrent(db, transaction, cat)

    elif behavior == "installment":
        result["installments"] = _handle_installment(db, transaction, cat)

    # none → não cria provisão (variáveis, interna, etc.)
    return result


# Compat: manter nome antigo usado em auto_provision.py + imports.py
def maybe_upsert_income_provision(
    db: Session,
    transaction: Transaction,
) -> Optional[Provision]:
    """Wrapper de compatibilidade — redireciona para evaluate_transaction_for_provision."""
    res = evaluate_transaction_for_provision(db, transaction)
    return res.get("provision")
