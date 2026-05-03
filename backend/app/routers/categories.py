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
    limit_value: Optional[float] = None
    type: Optional[str] = "variavel"
    parent_id: Optional[int] = None


class CategoryOut(CategoryIn):
    id: int
    model_config = {"from_attributes": True}


@router.get("/", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post("/", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryIn, db: Session = Depends(get_db)):
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{id}", response_model=CategoryOut)
def update_category(id: int, data: CategoryIn, db: Session = Depends(get_db)):
    cat = db.query(Category).get(id)
    if not cat:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(cat, k, v)
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
