"""
Energy consumption router: Read and write energy sensor data.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app.models import EnergyData, User
from app.schemas import EnergyCreate, EnergyOut
from app.auth.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/energy", tags=["Energy"])


@router.get("", response_model=List[EnergyOut])
async def get_energy_data(
    limit: int = Query(default=100, le=1000),
    sector: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Get energy consumption data. Optionally filter by sector.
    """
    query = db.query(EnergyData).order_by(desc(EnergyData.timestamp))
    if sector:
        query = query.filter(EnergyData.sector.ilike(f"%{sector}%"))
    return query.limit(limit).all()


@router.post("", response_model=EnergyOut, status_code=status.HTTP_201_CREATED)
async def create_energy_data(
    data: EnergyCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Create a new energy data record. Admin only.
    """
    entry = EnergyData(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry