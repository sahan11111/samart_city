"""
Waste management router: Read and write waste sensor data.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app.models import WasteData, User
from app.schemas import WasteCreate, WasteOut
from app.auth.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/waste", tags=["Waste"])


@router.get("", response_model=List[WasteOut])
async def get_waste_data(
    limit: int = Query(default=100, le=1000),
    zone: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Get waste data. Optionally filter by zone.
    """
    query = db.query(WasteData).order_by(desc(WasteData.timestamp))
    if zone:
        query = query.filter(WasteData.zone.ilike(f"%{zone}%"))
    return query.limit(limit).all()


@router.post("", response_model=WasteOut, status_code=status.HTTP_201_CREATED)
async def create_waste_data(
    data: WasteCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Create a new waste data record. Admin only.
    """
    entry = WasteData(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry