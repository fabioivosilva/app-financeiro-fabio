"""Router: Categories CRUD."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@router.post("/", response_model=schemas.CategoryOut, status_code=201)
def create_category(data: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, **data.model_dump())


@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(category_id: int, data: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    updates = data.model_dump(exclude_unset=True)
    c = crud.update_category(db, category_id, **updates)
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    return c


@router.delete("/{category_id}", response_model=schemas.CategoryOut)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    c = crud.soft_delete_category(db, category_id)
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    return c
