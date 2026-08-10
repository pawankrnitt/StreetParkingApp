from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from controller.analyticsController import get_analytics_overview
from middleware.auth import require_admin

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/overview")
def get_overview(db: Session = Depends(get_db), admin = Depends(require_admin)):
    return get_analytics_overview(db)
