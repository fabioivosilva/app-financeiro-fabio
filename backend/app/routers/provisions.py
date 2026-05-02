"""Router: Provisions CRUD."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/provisions", tags=["provisions"])


@router.get("/", response_model=list[schemas.ProvisionOut])
def list_provisions(db: Session = Depends(get_db)):
    return crud.get_provisions(db)


@router.post("/", response_model=schemas.ProvisionOut, status_code=201)
def create_provision(data: schemas.ProvisionCreate, db: Session = Depends(get_db)):
    return crud.create_provision(db, **data.model_dump())


@router.put("/{provision_id}", response_model=schemas.ProvisionOut)
def update_provision(provision_id: int, data: schemas.ProvisionUpdate, db: Session = Depends(get_db)):
    updates = data.model_dump(exclude_unset=True)
    p = crud.update_provision(db, provision_id, **updates)
    if not p:
        raise HTTPException(status_code=404, detail="Provision not found")
    return p


@router.delete("/{provision_id}", status_code=204)
def delete_provision(provision_id: int, db: Session = Depends(get_db)):
    if not crud.delete_provision(db, provision_id):
        raise HTTPException(status_code=404, detail="Provision not found")
    return None


@router.get("/{provision_id}/occurrences", response_model=list[schemas.ProvisionOccurrenceOut])
def list_occurrences(provision_id: int, db: Session = Depends(get_db)):
    return crud.get_occurrences(db, provision_id)


@router.patch("/{provision_id}/occurrences/{occurrence_id}", response_model=schemas.ProvisionOccurrenceOut)
def update_occurrence(
    provision_id: int,
    occurrence_id: int,
    data: schemas.OccurrenceStatusUpdate,
    db: Session = Depends(get_db),
):
    occ = crud.update_occurrence(db, occurrence_id, **data.model_dump(exclude_unset=True))
    if not occ:
        raise HTTPException(status_code=404, detail="Occurrence not found")
    return occ
