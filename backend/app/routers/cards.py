"""Router: Cards CRUD."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/cards", tags=["cards"])


def _card_out(c) -> schemas.CardOut:
    out = schemas.CardOut.model_validate(c)
    out.person_name = c.person.name if c.person else None
    return out


@router.get("/", response_model=list[schemas.CardOut])
def list_cards(db: Session = Depends(get_db)):
    return [_card_out(card) for card in crud.get_cards(db)]


@router.post("/", response_model=schemas.CardOut, status_code=201)
def create_card(data: schemas.CardCreate, db: Session = Depends(get_db)):
    c = crud.create_card(db, last_digits=data.last_digits, person_id=data.person_id, description=data.description)
    return _card_out(c)


@router.put("/{card_id}", response_model=schemas.CardOut)
def update_card(card_id: int, data: schemas.CardUpdate, db: Session = Depends(get_db)):
    c = crud.update_card(db, card_id, last_digits=data.last_digits, person_id=data.person_id, description=data.description)
    if not c:
        raise HTTPException(status_code=404, detail="Card not found")
    return _card_out(c)
