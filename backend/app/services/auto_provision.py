"""
Detecta receitas recorrentes e cria/atualiza provisões automaticamente
quando uma transação é categorizada em uma subcategoria de receita.

Regras:
- Só age sobre categorias com type='receita'
- Cria provisão quando há 2+ transações da mesma (categoria, dono) em ciclos diferentes
- Se já existe provisão, atualiza valor médio e dia médio
- Provisão criada/atualizada é retornada para o frontend exibir feedback
"""
from collections import defaultdict
from typing import Optional
from sqlalchemy.orm import Session
from app.models import Transaction, Category, Provision


def _safe_day(transactions: list[Transaction]) -> int:
    """Dia médio do mês entre as transações, clamped 1-28."""
    if not transactions:
        return 1
    avg = sum(t.date.day for t in transactions) / len(transactions)
    return max(1, min(28, round(avg)))


def _avg_amount(transactions: list[Transaction]) -> float:
    return sum(t.amount for t in transactions) / len(transactions)


def _diff_cycles(transactions: list[Transaction]) -> int:
    """Quantos (ano, mês) distintos as transações cobrem."""
    return len({(t.date.year, t.date.month) for t in transactions})


def maybe_upsert_income_provision(
    db: Session,
    transaction: Transaction,
) -> Optional[Provision]:
    """
    Chamado após uma transação ter sido categorizada/atualizada.
    Retorna a Provision criada/atualizada, ou None se nada mudou.
    """
    if not transaction.category_id or transaction.amount <= 0:
        return None

    category = db.query(Category).get(transaction.category_id)
    if not category or category.type != "receita":
        return None

    # Busca todas as transações de receita dessa categoria com mesmo dono
    similar = db.query(Transaction).filter(
        Transaction.category_id == transaction.category_id,
        Transaction.amount > 0,
    )
    if transaction.person_id is not None:
        similar = similar.filter(Transaction.person_id == transaction.person_id)
    else:
        similar = similar.filter(Transaction.person_id.is_(None))

    occurrences = similar.all()

    # Precisa de 2+ ocorrências em ciclos distintos para criar/atualizar
    if _diff_cycles(occurrences) < 2:
        return None

    avg_amount = _avg_amount(occurrences)
    avg_day = _safe_day(occurrences)

    # Provisão existe para essa (categoria, dono)?
    existing_q = db.query(Provision).filter(
        Provision.category_id == transaction.category_id,
        Provision.type == "mensal",
    )
    if transaction.person_id is not None:
        existing_q = existing_q.filter(Provision.person_id == transaction.person_id)
    else:
        existing_q = existing_q.filter(Provision.person_id.is_(None))

    existing = existing_q.first()

    if existing:
        # Atualiza com a nova média
        existing.amount = round(avg_amount, 2)
        existing.day = avg_day
        existing.active = True
        db.commit()
        db.refresh(existing)
        return existing

    # Cria nova provisão
    desc = category.name
    provision = Provision(
        description=desc,
        amount=round(avg_amount, 2),
        day=avg_day,
        type="mensal",
        category_id=transaction.category_id,
        person_id=transaction.person_id,
        active=True,
    )
    db.add(provision)
    db.commit()
    db.refresh(provision)
    return provision
