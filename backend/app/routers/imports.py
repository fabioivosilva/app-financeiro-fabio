"""Router: File imports - OFX, PDF and Excel endpoints."""
import re
import unicodedata

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..models import Transaction, FileImport, Person
from ..services.categorizer import categorize
from ..services.itau_excel_parser import parse_itau_excel
from ..services.itau_pdf_parser import parse_itau_pdf
from ..services.ofx_parser import parse_ofx

router = APIRouter(prefix="/imports", tags=["imports"])


def _normalize_person_name(name: str) -> str:
    clean = unicodedata.normalize("NFKD", name or "")
    clean = "".join(ch for ch in clean if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", clean).strip().lower()


def _find_or_create_person_by_first_name(db: Session, first_name: str | None) -> Person | None:
    if not first_name:
        return None

    normalized_first = _normalize_person_name(first_name).split(" ", 1)[0]
    if not normalized_first:
        return None

    for person in db.query(Person).all():
        person_first = _normalize_person_name(person.name).split(" ", 1)[0]
        if person_first == normalized_first:
            return person

    display_name = first_name.strip()[:1].upper() + first_name.strip()[1:].lower()
    person = Person(name=display_name)
    db.add(person)
    db.flush()
    return person


def _backfill_duplicate_credit_card_transaction(
    db: Session,
    tx_hash: str,
    person_id: int | None,
    card_id: int | None,
) -> bool:
    txn = crud.get_transaction_by_hash(db, tx_hash)
    if not txn:
        return False

    changed = False
    if person_id is not None and txn.person_id is None:
        txn.person_id = person_id
        changed = True
    if card_id is not None and txn.card_id is None:
        txn.card_id = card_id
        changed = True
    if changed:
        db.flush()
    return changed


def _import_credit_card_transactions(
    db: Session,
    filename: str,
    file_type: str,
    raw_transactions: list[dict],
) -> schemas.ImportResult:
    file_import = FileImport(
        filename=filename,
        file_type=file_type,
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
        card_digits = raw.get("card_last_digits")
        cardholder = _find_or_create_person_by_first_name(
            db,
            raw.get("cardholder_first_name"),
        )

        # Resolve card -> person.
        card_id = None
        person_from_card = None
        if card_digits:
            card = crud.get_card_by_digits(db, card_digits)
            if card:
                card_id = card.id
                if cardholder and card.person_id != cardholder.id:
                    card.person_id = cardholder.id
                    db.flush()
                person_from_card = card.person_id
            else:
                card = crud.create_card(
                    db,
                    last_digits=card_digits,
                    person_id=cardholder.id if cardholder else None,
                )
                card_id = card.id
                person_from_card = card.person_id

        tx_hash = Transaction.compute_hash(
            raw["date"],
            raw["description"],
            raw["amount"],
            raw["source"],
            card_id,
        )

        if crud.transaction_exists(db, hash_val=tx_hash):
            _backfill_duplicate_credit_card_transaction(
                db,
                tx_hash=tx_hash,
                person_id=person_from_card,
                card_id=card_id,
            )
            duplicates_skipped += 1
            continue

        cat_id, person_id, is_reviewed = categorize(
            db,
            description=raw["description"],
            source=raw["source"],
            person_id=person_from_card,
        )

        txn = Transaction(
            date=raw["date"],
            description=raw["description"],
            amount=raw["amount"],
            transaction_type=raw["transaction_type"],
            source=raw["source"],
            hash=tx_hash,
            category_id=cat_id,
            person_id=person_id,
            card_id=card_id,
            installment_current=raw.get("installment_current"),
            installment_total=raw.get("installment_total"),
            is_reviewed=is_reviewed,
            file_import_id=file_import.id,
        )
        db.add(txn)
        total_imported += 1

        if is_reviewed:
            auto_categorized += 1
        else:
            pending_review += 1

    file_import.auto_categorized = auto_categorized
    file_import.pending_review = pending_review
    file_import.total_transactions = total_imported

    db.commit()

    return schemas.ImportResult(
        filename=filename,
        total_read=total_read,
        total_imported=total_imported,
        duplicates_skipped=duplicates_skipped,
        auto_categorized=auto_categorized,
        pending_review=pending_review,
    )


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

    try:
        raw_transactions = parse_ofx(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse OFX: {str(e)}")

    if not raw_transactions:
        raise HTTPException(status_code=422, detail="No transactions found in OFX file")

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
        external_id = raw.get("external_id")
        tx_hash = Transaction.compute_hash(
            raw["date"], raw["description"], raw["amount"], raw["source"]
        )

        if crud.transaction_exists(db, external_id=external_id, hash_val=tx_hash):
            duplicates_skipped += 1
            continue

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


@router.post("/credit-card-pdf", response_model=schemas.ImportResult)
async def import_credit_card_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Import an Itau credit card PDF statement."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()

    try:
        raw_transactions = parse_itau_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse PDF: {str(e)}")

    if not raw_transactions:
        raise HTTPException(status_code=422, detail="No transactions found in PDF file")

    return _import_credit_card_transactions(
        db=db,
        filename=file.filename,
        file_type="credit_card_pdf",
        raw_transactions=raw_transactions,
    )


@router.post("/credit-card-excel", response_model=schemas.ImportResult)
async def import_credit_card_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Import an Itau credit card Excel statement."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()

    try:
        raw_transactions = parse_itau_excel(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse Excel: {str(e)}")

    if not raw_transactions:
        raise HTTPException(status_code=422, detail="No transactions found in Excel file")

    return _import_credit_card_transactions(
        db=db,
        filename=file.filename,
        file_type="credit_card_excel",
        raw_transactions=raw_transactions,
    )
