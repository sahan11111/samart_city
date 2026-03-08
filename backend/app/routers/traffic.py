"""
Traffic data router: Read and write traffic sensor data.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import TrafficData
from app.schemas import TrafficCreate, TrafficOut
from app.auth.dependencies import get_current_user, require_admin
from app.models import User

router = APIRouter(prefix="/api/traffic", tags=["Traffic"])


@router.get("", response_model=List[TrafficOut])
async def get_traffic_data(
    limit: int = Query(default=100, le=1000),
    location: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Get traffic data. Optionally filter by location.
    Returns latest records ordered by timestamp descending.
    """
    query = db.query(TrafficData).order_by(desc(TrafficData.timestamp))
    if location:
        query = query.filter(TrafficData.location.ilike(f"%{location}%"))
    return query.limit(limit).all()


@router.post("", response_model=TrafficOut, status_code=status.HTTP_201_CREATED)
async def create_traffic_data(
    data: TrafficCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Create a new traffic data record. Admin only.
    """
    entry = TrafficData(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry