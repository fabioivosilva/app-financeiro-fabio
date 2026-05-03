from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import Person

router = APIRouter(prefix="/persons", tags=["persons"])


class PersonIn(BaseModel):
    name: str


class PersonOut(PersonIn):
    id: int
    model_config = {"from_attributes": True}


@router.get("/", response_model=list[PersonOut])
def list_persons(db: Session = Depends(get_db)):
    return db.query(Person).all()


@router.post("/", response_model=PersonOut, status_code=201)
def create_person(data: PersonIn, db: Session = Depends(get_db)):
    p = Person(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/{id}", response_model=PersonOut)
def update_person(id: int, data: PersonIn, db: Session = Depends(get_db)):
    p = db.query(Person).get(id)
    if not p:
        raise HTTPException(404)
    p.name = data.name
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{id}", status_code=204)
def delete_person(id: int, db: Session = Depends(get_db)):
    p = db.query(Person).get(id)
    if not p:
        raise HTTPException(404)
    db.delete(p)
    db.commit()
