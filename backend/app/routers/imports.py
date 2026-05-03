from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Transaction, Card
from app.parsers import PARSER_REGISTRY
from app.parsers.dedup import deduplicate

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

        # Monta cache last4 -> card_id para associar transações ao cartão correto
        card_by_last4: dict[str, int] = {
            c.last4: c.id
            for c in db.query(Card).all()
            if c.last4
        }

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
