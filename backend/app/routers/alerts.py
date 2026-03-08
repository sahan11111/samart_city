"""
Alerts router: Read system-generated alerts.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app.models import Alert, User
from app.schemas import AlertOut
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertOut])
async def get_alerts(
    limit: int = Query(default=50, le=200),
    severity: Optional[str] = Query(default=None),
    resolved: Optional[bool] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Get system alerts. Filter by severity or resolution status.
    """
    query = db.query(Alert).order_by(desc(Alert.timestamp))
    if severity:
        query = query.filter(Alert.severity == severity)
    if resolved is not None:
        query = query.filter(Alert.is_resolved == resolved)
    return query.limit(limit).all()