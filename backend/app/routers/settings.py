from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import SessionLocal
from .. import models, schemas, crud

router = APIRouter(prefix="/settings", tags=["settings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.SettingSchema])
def get_settings(db: Session = Depends(get_db)):
    return db.query(models.Setting).all()

@router.get("/{key}", response_model=schemas.SettingSchema)
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(models.Setting).filter(models.Setting.key == key).first()
    if not setting:
        # Return empty value instead of 404 for convenience
        return {"key": key, "value": ""}
    return setting

@router.post("/", response_model=schemas.SettingSchema)
def update_setting(setting_data: schemas.SettingSchema, db: Session = Depends(get_db)):
    setting = db.query(models.Setting).filter(models.Setting.key == setting_data.key).first()
    if setting:
        setting.value = setting_data.value
    else:
        setting = models.Setting(key=setting_data.key, value=setting_data.value)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting

@router.delete("/reset-system")
def reset_system(db: Session = Depends(get_db)):
    """Danger zone: Clear all transactions and imports."""
    try:
        db.query(models.Transaction).delete()
        db.query(models.FileImport).delete()
        db.commit()
        return {"status": "success", "message": "All transactions and imports cleared."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
