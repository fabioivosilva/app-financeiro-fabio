from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date as date_type
from app.database import get_db
from app.models import Transaction
from app.parsers import PARSER_REGISTRY
from app.parsers.dedup import deduplicate

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    filename = file.filename or "upload"

    result = PARSER_REGISTRY.parse(filename, content)

    if result is None:
        raise HTTPException(
            status_code=422,
            detail=f"Nenhum parser reconheceu o arquivo '{filename}'. "
                   "Formatos suportados: OFX, XLS/XLSX (Itaú)."
        )

    novas, duplicadas = deduplicate(result, db)

    # Persiste as transações novas
    criadas = []
    for tx in novas:
        db_tx = Transaction(
            date=tx.date,
            description=tx.description,
            amount=tx.amount,
            origin=tx.origin,
            status="pendente",          # importadas entram como pendente para revisão
            external_id=tx.external_id,
            installment_current=tx.installment_current,
            installment_total=tx.installment_total,
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


@router.get("/history")
def import_history(db: Session = Depends(get_db)):
    """Retorna contagem de transações por status para histórico de imports."""
    total = db.query(Transaction).count()
    pendentes = db.query(Transaction).filter(Transaction.status == "pendente").count()
    confirmadas = db.query(Transaction).filter(Transaction.status == "confirmado").count()
    return {"total": total, "pendentes": pendentes, "confirmadas": confirmadas}
