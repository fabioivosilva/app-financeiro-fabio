"""
Deduplicação centralizada de transações importadas.
Usa external_id quando disponível; caso contrário, hash canônico.
"""
from sqlalchemy.orm import Session
from app.models import Transaction
from app.parsers.base import ParsedTransaction, ImportResult


def deduplicate(result: ImportResult, db: Session) -> tuple[list[ParsedTransaction], list[ParsedTransaction]]:
    """
    Retorna (novas, duplicadas) separando as que já existem no banco
    E eliminando duplicatas dentro do próprio batch.
    """
    novas: list[ParsedTransaction] = []
    duplicadas: list[ParsedTransaction] = []
    seen_in_batch: set[str] = set()

    for tx in result.transactions:
        # Resolve o ID a ser usado
        if not tx.external_id:
            tx.external_id = tx.canonical_hash(result.bank, result.account or "")

        # Dedup dentro do batch
        if tx.external_id in seen_in_batch:
            duplicadas.append(tx)
            continue
        seen_in_batch.add(tx.external_id)

        # Dedup contra o banco
        existe = db.query(Transaction).filter(
            Transaction.external_id == tx.external_id
        ).first()

        if existe:
            duplicadas.append(tx)
        else:
            novas.append(tx)

    return novas, duplicadas
