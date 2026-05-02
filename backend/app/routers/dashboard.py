"""Router: Dashboard aggregations."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from .. import schemas
from ..database import get_db
from ..services.dashboard_service import get_dashboard_data

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", response_model=schemas.DashboardOut)
def get_dashboard(
    month: Optional[str] = Query(None, description="YYYY-MM format"),
    db: Session = Depends(get_db),
):
    return get_dashboard_data(db, month)
