import unicodedata
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Transaction, Card, Person, Rule
from app.parsers import PARSER_REGISTRY
from app.parsers.dedup import deduplicate
from app.routers.rules import apply_rules_to


def _norm(text: str) -> str:
    return unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode().lower().strip()


def _find_person_id(holder: str, persons: list) -> int | None:
    """Tenta associar o nome do titular a uma pessoa cadastrada pelo primeiro nome."""
    first = _norm(holder.split()[0]) if holder else ""
    if not first:
        return None
    for p in persons:
        if first in _norm(p.name):
            return p.id
    return None


def _ensure_cards(transactions, bank: str, db: Session) -> dict[str, int]:
    """Garante que todos os cartões detectados existem no banco.
    Cria os que faltam e atualiza person_id nos que ainda estão sem titular."""
    existing = {c.last4: c for c in db.query(Card).all() if c.last4}
    card_by_last4: dict[str, int] = {last4: c.id for last4, c in existing.items()}
    persons = db.query(Person).all()

    # Coleta o melhor nome de titular encontrado para cada last4
    holders: dict[str, str | None] = {}
    for tx in transactions:
        raw = tx.raw or {}
        last4 = raw.get("card_last4")
        holder = raw.get("card_holder")
        if last4 and holder and not holders.get(last4):
            holders[last4] = holder

    for last4, holder in holders.items():
        person_id = _find_person_id(holder, persons) if holder else None

        if last4 in existing:
            # Atualiza person_id se ainda estiver vazio
            card = existing[last4]
            if card.person_id is None and person_id:
                card.person_id = person_id
                if card.name == f"{bank} •••• {last4}":
                    card.name = f"{holder} – {bank} •••• {last4}"
        else:
            card_name = f"{holder} – {bank} •••• {last4}" if holder else f"{bank} •••• {last4}"
            new_card = Card(name=card_name, last4=last4, person_id=person_id)
            db.add(new_card)
            db.flush()
            card_by_last4[last4] = new_card.id

    # Cria cartões detectados que ainda não existem e não têm holder
    for tx in transactions:
        raw = tx.raw or {}
        last4 = raw.get("card_last4")
        if last4 and last4 not in card_by_last4:
            new_card = Card(name=f"{bank} •••• {last4}", last4=last4, person_id=None)
            db.add(new_card)
            db.flush()
            card_by_last4[last4] = new_card.id

    return card_by_last4

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    password: Optional[str] = Form(None),
    bank_hint: Optional[str] = Form(None),
    active_bank_ids: Optional[str] = Form(None),  # String separada por vírgula "itau,nubank"
    db: Session = Depends(get_db),
):
    content = await file.read()
    filename = file.filename
    active_ids = [id.strip() for id in active_bank_ids.split(",") if id.strip()] if active_bank_ids else None
    try:
        result = PARSER_REGISTRY.parse(filename, content, password=password, active_bank_ids=active_ids)

        if result is None:
            raise HTTPException(
                status_code=422,
                detail=f"Nenhum parser reconheceu o arquivo '{filename}'. "
                       "Formatos suportados: OFX, XLS/XLSX (Itaú), PDF (Itaú), CSV (Nubank, Inter, genérico).",
            )

        if "PDF_ENCRYPTED" in result.errors:
            raise HTTPException(
                status_code=422,
                detail={"code": "PDF_ENCRYPTED", "message": "Este PDF está protegido por senha."},
            )

        if result.bank == "Generic" and bank_hint:
            # Converte hint do frontend (id) para label bonitinho
            hints = {"itau": "Itaú", "c6": "C6 Bank", "nubank": "Nubank", "inter": "Banco Inter"}
            result.bank = hints.get(bank_hint.lower(), result.bank)

        novas, duplicadas = deduplicate(result, db)

        # Garante que todos os cartões detectados existem; cria os que faltam
        card_by_last4 = _ensure_cards(result.transactions, result.bank, db)

        criadas = []
        for tx in novas:
            card_last4 = (tx.raw or {}).get("card_last4")
            card_id = card_by_last4.get(card_last4) if card_last4 else None
            db_tx = Transaction(
                date=tx.date,
                description=tx.description,
                amount=tx.amount,
                origin=tx.origin,
                status="pendente",
                external_id=tx.external_id,
                installment_current=tx.installment_current,
                installment_total=tx.installment_total,
                card_id=card_id,
            )
            db.add(db_tx)
            criadas.append(db_tx)

        # Aplica regras existentes nas transações recém-importadas
        if criadas:
            rules = db.query(Rule).filter(Rule.category_id.isnot(None)).all()
            apply_rules_to(criadas, rules)

        db.commit()

        return {
            "bank": result.bank,
            "format": result.format,
            "account": result.account,
            "period_start": result.period_start.isoformat() if result.period_start else None,
            "period_end": result.period_end.isoformat() if result.period_end else None,
            "total_found": len(result.transactions),
            "imported": len(novas),
            "duplicates": len(duplicadas),
            "warnings": result.warnings,
            "errors": result.errors,
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"ERRO CRÍTICO NA IMPORTAÇÃO: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno ao processar {filename}: {str(e)}"
        )


@router.get("/history")
def import_history(db: Session = Depends(get_db)):
    total = db.query(Transaction).count()
    pendentes = db.query(Transaction).filter(Transaction.status == "pendente").count()
    confirmadas = db.query(Transaction).filter(Transaction.status == "confirmado").count()
    return {"total": total, "pendentes": pendentes, "confirmadas": confirmadas}
