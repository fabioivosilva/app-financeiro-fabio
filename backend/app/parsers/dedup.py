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

    # 1. Garante IDs para todos e remove duplicatas no batch
    batch_map: dict[str, ParsedTransaction] = {}
    for tx in result.transactions:
        if not tx.external_id:
            tx.external_id = tx.canonical_hash(result.bank, result.account or "")
        
        if tx.external_id in seen_in_batch:
            duplicadas.append(tx)
            continue
        
        seen_in_batch.add(tx.external_id)
        batch_map[tx.external_id] = tx

    # 2. Busca todos os IDs do batch de uma vez no banco
    existing_ids = {
        row[0] for row in db.query(Transaction.external_id)
        .filter(Transaction.external_id.in_(list(seen_in_batch)))
        .all()
    }

    # 3. Separa novas de duplicadas
    for tx_id, tx in batch_map.items():
        if tx_id in existing_ids:
            duplicadas.append(tx)
        else:
            novas.append(tx)

    return novas, duplicadas
