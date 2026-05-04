from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Category

router = APIRouter(prefix="/categories", tags=["categories"])


class CategoryIn(BaseModel):
    name: str
    color: Optional[str] = "#888888"
    icon: Optional[str] = "label"
    limit_value: Optional[float] = None
    type: Optional[str] = "variavel"
    parent_id: Optional[int] = None
    exclude_totals: Optional[bool] = False


class CategoryOut(CategoryIn):
    id: int
    model_config = {"from_attributes": True}


@router.get("/", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post("/", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryIn, db: Session = Depends(get_db)):
    payload = data.model_dump()
    # Subcategoria sempre herda a cor do pai
    if payload.get("parent_id"):
        parent = db.query(Category).get(payload["parent_id"])
        if parent:
            payload["color"] = parent.color
    cat = Category(**payload)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{id}", response_model=CategoryOut)
def update_category(id: int, data: CategoryIn, db: Session = Depends(get_db)):
    cat = db.query(Category).get(id)
    if not cat:
        raise HTTPException(404)
    old_color = cat.color
    for k, v in data.model_dump().items():
        setattr(cat, k, v)
    # Se mudou a cor de uma categoria pai, propaga para subcategorias
    if data.parent_id is None and data.color and data.color != old_color:
        subs = db.query(Category).filter(Category.parent_id == id).all()
        for s in subs:
            s.color = data.color
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{id}", status_code=204)
def delete_category(id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).get(id)
    if not cat:
        raise HTTPException(404)
    db.delete(cat)
    db.commit()
