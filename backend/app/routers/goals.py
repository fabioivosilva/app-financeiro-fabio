"""Router: Goals CRUD."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("/", response_model=list[schemas.GoalOut])
def list_goals(db: Session = Depends(get_db)):
    return crud.get_goals(db)


@router.post("/", response_model=schemas.GoalOut, status_code=201)
def create_goal(data: schemas.GoalCreate, db: Session = Depends(get_db)):
    return crud.create_goal(db, **data.model_dump())


@router.put("/{goal_id}", response_model=schemas.GoalOut)
def update_goal(goal_id: int, data: schemas.GoalUpdate, db: Session = Depends(get_db)):
    updates = data.model_dump(exclude_unset=True)
    g = crud.update_goal(db, goal_id, **updates)
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    return g


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    success = crud.delete_goal(db, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return None
