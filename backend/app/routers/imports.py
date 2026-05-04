import hashlib
import json
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Card, ImportRecord, Person, Rule, Settings, Transaction
from app.parsers import PARSER_REGISTRY
from app.parsers.dedup import deduplicate
from app.routers.rules import apply_rules_to
from app.services.auto_provision import maybe_upsert_income_provision


SUPPORTED_EXTENSIONS = {".ofx", ".xls", ".xlsx", ".pdf", ".csv"}

router = APIRouter(prefix="/imports", tags=["imports"])


class ImportSettingsIn(BaseModel):
    default_import_folder: Optional[str] = None
    cycle_start_day: Optional[int] = None


class ImportPathIn(BaseModel):
    path: str
    password: Optional[str] = None
    bank_hint: Optional[str] = None
    active_bank_ids: list[str] | None = None


def _sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def _get_settings(db: Session) -> Settings:
    settings = db.query(Settings).first()
    if not settings:
        settings = Settings(cycle_start_day=27)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _supported_file(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS


def _file_type(filename: str, fallback: str | None = None) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".ofx":
        return "OFX"
    if suffix == ".pdf":
        return "PDF"
    if suffix in {".xls", ".xlsx"}:
        return "Excel"
    if suffix == ".csv":
        return "CSV"
    return fallback or "Arquivo"


def _inside_folder(path: Path, folder: Path) -> bool:
    try:
        path.resolve().relative_to(folder.resolve())
        return True
    except ValueError:
        return False


def _norm(text: str) -> str:
    return unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode().lower().strip()


def _find_person_id(holder: str, persons: list) -> int | None:
    first = _norm(holder.split()[0]) if holder else ""
    if not first:
        return None
    for p in persons:
        if first in _norm(p.name):
            return p.id
    return None


def _ensure_cards(transactions, bank: str, db: Session) -> dict[str, int]:
    existing = {c.last4: c for c in db.query(Card).all() if c.last4}
    card_by_last4: dict[str, int] = {last4: c.id for last4, c in existing.items()}
    persons = db.query(Person).all()

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

    for tx in transactions:
        raw = tx.raw or {}
        last4 = raw.get("card_last4")
        if last4 and last4 not in card_by_last4:
            new_card = Card(name=f"{bank} •••• {last4}", last4=last4, person_id=None)
            db.add(new_card)
            db.flush()
            card_by_last4[last4] = new_card.id

    return card_by_last4


def _record_import(
    db: Session,
    *,
    fingerprint: str,
    filename: str,
    source_path: str | None,
    size: int | None,
    modified_at: datetime | None,
    result,
    imported: int,
    duplicates: int,
) -> None:
    record = db.query(ImportRecord).filter(ImportRecord.fingerprint == fingerprint).first()
    if not record:
        record = ImportRecord(fingerprint=fingerprint, filename=filename)
        db.add(record)

    record.filename = filename
    record.source_path = source_path
    record.size = size
    record.modified_at = modified_at
    record.imported_at = datetime.utcnow()
    record.bank = result.bank
    record.format = result.format
    record.account = result.account
    record.total_found = len(result.transactions)
    record.imported = imported
    record.duplicates = duplicates
    record.status = "ok"
    record.warnings = json.dumps(result.warnings, ensure_ascii=False)
    record.errors = json.dumps(result.errors, ensure_ascii=False)


def _process_import(
    *,
    filename: str,
    content: bytes,
    db: Session,
    password: str | None = None,
    bank_hint: str | None = None,
    active_ids: list[str] | None = None,
    source_path: str | None = None,
    size: int | None = None,
    modified_at: datetime | None = None,
):
    result = PARSER_REGISTRY.parse(filename, content, password=password, active_bank_ids=active_ids)

    if result is None:
        raise HTTPException(
            status_code=422,
            detail=f"Nenhum parser reconheceu o arquivo '{filename}'. "
                   "Formatos suportados: OFX, XLS/XLSX (Itau), PDF (Itau), CSV (Nubank, Inter, generico).",
        )

    if "PDF_ENCRYPTED" in result.errors:
        raise HTTPException(
            status_code=422,
            detail={"code": "PDF_ENCRYPTED", "message": "Este PDF esta protegido por senha."},
        )

    if result.bank == "Generic" and bank_hint:
        hints = {"itau": "Itau", "c6": "C6 Bank", "nubank": "Nubank", "inter": "Banco Inter"}
        result.bank = hints.get(bank_hint.lower(), result.bank)

    novas, duplicadas = deduplicate(result, db)
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

    if criadas:
        rules = db.query(Rule).filter(Rule.category_id.isnot(None)).all()
        apply_rules_to(criadas, rules)
        for tx in criadas:
            if tx.category_id:
                maybe_upsert_income_provision(db, tx)

    _record_import(
        db,
        fingerprint=_sha256(content),
        filename=filename,
        source_path=source_path,
        size=size if size is not None else len(content),
        modified_at=modified_at,
        result=result,
        imported=len(novas),
        duplicates=len(duplicadas),
    )

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


@router.get("/settings")
def get_import_settings(db: Session = Depends(get_db)):
    settings = _get_settings(db)
    return {
        "cycle_start_day": settings.cycle_start_day or 27,
        "default_import_folder": settings.default_import_folder,
    }


@router.put("/settings")
def update_import_settings(data: ImportSettingsIn, db: Session = Depends(get_db)):
    settings = _get_settings(db)
    if data.default_import_folder is not None:
        settings.default_import_folder = data.default_import_folder.strip() or None
    if data.cycle_start_day is not None:
        settings.cycle_start_day = max(1, min(31, data.cycle_start_day))
    db.commit()
    db.refresh(settings)
    return {
        "cycle_start_day": settings.cycle_start_day or 27,
        "default_import_folder": settings.default_import_folder,
    }


@router.get("/scan")
def scan_import_folder(
    include_imported: bool = Query(False),
    db: Session = Depends(get_db),
):
    settings = _get_settings(db)
    if not settings.default_import_folder:
        return {"folder": None, "files": []}

    folder = Path(settings.default_import_folder).expanduser()
    if not folder.exists() or not folder.is_dir():
        raise HTTPException(status_code=404, detail=f"Pasta de importacao nao encontrada: {folder}")

    files = []
    candidates = [path for path in folder.iterdir() if _supported_file(path)]
    for path in sorted(candidates, key=lambda item: item.stat().st_mtime, reverse=True):
        stat = path.stat()
        content = path.read_bytes()
        fingerprint = _sha256(content)
        record = db.query(ImportRecord).filter(ImportRecord.fingerprint == fingerprint).first()
        imported = record is not None and record.status == "ok"
        if imported and not include_imported:
            continue
        files.append({
            "name": path.name,
            "path": str(path),
            "type": _file_type(path.name, record.format if record else None),
            "size": stat.st_size,
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "imported": imported,
            "fingerprint": fingerprint,
            "bank": record.bank if record else None,
            "format": record.format if record else None,
            "total_found": record.total_found if record else None,
            "imported_count": record.imported if record else None,
            "duplicates": record.duplicates if record else None,
        })

    return {"folder": str(folder), "files": files}


@router.post("/import-path")
def import_path(data: ImportPathIn, db: Session = Depends(get_db)):
    settings = _get_settings(db)
    if not settings.default_import_folder:
        raise HTTPException(status_code=400, detail="Configure a pasta de importacao padrao antes de importar.")

    folder = Path(settings.default_import_folder).expanduser().resolve()
    path = Path(data.path).expanduser().resolve()
    if not _inside_folder(path, folder):
        raise HTTPException(status_code=403, detail="Arquivo fora da pasta de importacao padrao.")
    if not _supported_file(path):
        raise HTTPException(status_code=422, detail="Formato de arquivo nao suportado para importacao assistida.")

    try:
        stat = path.stat()
        return _process_import(
            filename=path.name,
            content=path.read_bytes(),
            db=db,
            password=data.password,
            bank_hint=data.bank_hint,
            active_ids=data.active_bank_ids,
            source_path=str(path),
            size=stat.st_size,
            modified_at=datetime.fromtimestamp(stat.st_mtime),
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"ERRO CRITICO NA IMPORTACAO ASSISTIDA: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar {path.name}: {str(e)}")


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    password: Optional[str] = Form(None),
    bank_hint: Optional[str] = Form(None),
    active_bank_ids: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    content = await file.read()
    filename = file.filename
    active_ids = [item.strip() for item in active_bank_ids.split(",") if item.strip()] if active_bank_ids else None
    try:
        return _process_import(
            filename=filename,
            content=content,
            db=db,
            password=password,
            bank_hint=bank_hint,
            active_ids=active_ids,
            size=len(content),
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"ERRO CRITICO NA IMPORTACAO: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno ao processar {filename}: {str(e)}",
        )


@router.get("/history")
def import_history(db: Session = Depends(get_db)):
    total = db.query(Transaction).count()
    pendentes = db.query(Transaction).filter(Transaction.status == "pendente").count()
    confirmadas = db.query(Transaction).filter(Transaction.status == "confirmado").count()
    return {"total": total, "pendentes": pendentes, "confirmadas": confirmadas}
