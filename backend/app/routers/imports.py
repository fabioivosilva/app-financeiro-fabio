"""Router: File imports — OFX and PDF endpoints."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db
from ..models import Transaction, FileImport
from ..services.ofx_parser import parse_ofx
from ..services.categorizer import categorize

router = APIRouter(prefix="/imports", tags=["imports"])


@router.get("/", response_model=list[schemas.FileImportOut])
def list_imports(db: Session = Depends(get_db)):
    return crud.get_imports(db)


@router.post("/bank-statement-ofx", response_model=schemas.ImportResult)
async def import_bank_statement_ofx(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Import an OFX bank statement file."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()

    # Parse OFX
    try:
        raw_transactions = parse_ofx(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse OFX: {str(e)}")

    if not raw_transactions:
        raise HTTPException(status_code=422, detail="No transactions found in OFX file")

    # Create import record
    file_import = FileImport(
        filename=file.filename,
        file_type="bank_statement_ofx",
        total_transactions=len(raw_transactions),
    )
    db.add(file_import)
    db.flush()

    total_read = len(raw_transactions)
    total_imported = 0
    duplicates_skipped = 0
    auto_categorized = 0
    pending_review = 0

    for raw in raw_transactions:
        # Check for duplicate by external_id (FITID)
        external_id = raw.get("external_id")
        tx_hash = Transaction.compute_hash(
            raw["date"], raw["description"], raw["amount"], raw["source"]
        )

        if crud.transaction_exists(db, external_id=external_id, hash_val=tx_hash):
            duplicates_skipped += 1
            continue

        # Auto-categorize
        cat_id, person_id, is_reviewed = categorize(
            db,
            description=raw["description"],
            source=raw["source"],
        )

        txn = Transaction(
            date=raw["date"],
            description=raw["description"],
            amount=raw["amount"],
            transaction_type=raw["transaction_type"],
            source=raw["source"],
            external_id=external_id,
            hash=tx_hash,
            category_id=cat_id,
            person_id=person_id,
            is_reviewed=is_reviewed,
            file_import_id=file_import.id,
        )
        db.add(txn)
        total_imported += 1

        if is_reviewed:
            auto_categorized += 1
        else:
            pending_review += 1

    # Update import record
    file_import.auto_categorized = auto_categorized
    file_import.pending_review = pending_review
    file_import.total_transactions = total_imported

    db.commit()

    return schemas.ImportResult(
        filename=file.filename,
        total_read=total_read,
        total_imported=total_imported,
        duplicates_skipped=duplicates_skipped,
        auto_categorized=auto_categorized,
        pending_review=pending_review,
    )


# POST /imports/credit-card-pdf → FASE 3
