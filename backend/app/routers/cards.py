from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Card

router = APIRouter(prefix="/cards", tags=["cards"])


class CardIn(BaseModel):
    name: str
    last4: Optional[str] = None
    limit_value: Optional[float] = None
    person_id: int


class CardOut(CardIn):
    id: int
    model_config = {"from_attributes": True}


@router.get("/", response_model=list[CardOut])
def list_cards(db: Session = Depends(get_db)):
    return db.query(Card).all()


@router.post("/", response_model=CardOut, status_code=201)
def create_card(data: CardIn, db: Session = Depends(get_db)):
    card = Card(**data.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.put("/{id}", response_model=CardOut)
def update_card(id: int, data: CardIn, db: Session = Depends(get_db)):
    card = db.query(Card).get(id)
    if not card:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(card, k, v)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/{id}", status_code=204)
def delete_card(id: int, db: Session = Depends(get_db)):
    card = db.query(Card).get(id)
    if not card:
        raise HTTPException(404)
    db.delete(card)
    db.commit()
