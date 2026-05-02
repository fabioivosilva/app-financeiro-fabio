"""Router: Persons CRUD."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/persons", tags=["persons"])


@router.get("/", response_model=list[schemas.PersonOut])
def list_persons(db: Session = Depends(get_db)):
    return crud.get_persons(db)


@router.post("/", response_model=schemas.PersonOut, status_code=201)
def create_person(data: schemas.PersonCreate, db: Session = Depends(get_db)):
    return crud.create_person(db, name=data.name)


@router.put("/{person_id}", response_model=schemas.PersonOut)
def update_person(person_id: int, data: schemas.PersonUpdate, db: Session = Depends(get_db)):
    p = crud.update_person(db, person_id, name=data.name)
    if not p:
        raise HTTPException(status_code=404, detail="Person not found")
    return p
