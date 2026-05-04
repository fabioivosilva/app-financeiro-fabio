from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.sync import (
    apply_snapshot,
    build_snapshot,
    read_snapshot_file,
    write_snapshot_file,
)

router = APIRouter(prefix="/sync", tags=["sync"])


class SyncCategory(BaseModel):
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None
    limit_value: Optional[float] = None
    type: Optional[str] = None
    exclude_totals: Optional[bool] = False
    parent_name: Optional[str] = None


class SyncRule(BaseModel):
    keyword: str
    category_name: Optional[str] = None
    person_name: Optional[str] = None
    origin: Optional[str] = None
    goal_name: Optional[str] = None


class SyncSnapshot(BaseModel):
    version: int = 1
    generated_at: Optional[str] = None
    categories: list[SyncCategory] = []
    rules: list[SyncRule] = []


@router.get("/rules-categories", response_model=SyncSnapshot)
def get_snapshot(db: Session = Depends(get_db)):
    return build_snapshot(db)


@router.post("/apply")
def post_apply(payload: SyncSnapshot, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        return apply_snapshot(db, payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/apply-file")
def post_apply_file(db: Session = Depends(get_db)) -> dict[str, Any]:
    """Aplica o snapshot salvo localmente em data/sync_snapshot.json."""
    payload = read_snapshot_file()
    if not payload:
        raise HTTPException(status_code=404, detail="sync_snapshot.json não encontrado")
    try:
        return apply_snapshot(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/write-file")
def post_write_file(db: Session = Depends(get_db)) -> dict[str, str]:
    """Força a regravação do snapshot atual em data/sync_snapshot.json."""
    path = write_snapshot_file(db)
    return {"path": path}
