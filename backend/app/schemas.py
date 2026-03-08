"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional, List
from app.models import UserRole, AlertSeverity


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.citizen

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Traffic Schemas ──────────────────────────────────────────────────────────

class TrafficCreate(BaseModel):
    location: str = Field(..., min_length=2, max_length=100)
    vehicle_count: int = Field(..., ge=0)
    congestion_level: float = Field(..., ge=0, le=100)
    speed_avg: float = Field(default=0.0, ge=0)

class TrafficOut(TrafficCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Waste Schemas ────────────────────────────────────────────────────────────

class WasteCreate(BaseModel):
    zone: str = Field(..., min_length=1, max_length=50)
    fill_percentage: float = Field(..., ge=0, le=100)
    collection_status: str = Field(default="pending")
    weight_kg: float = Field(default=0.0, ge=0)

class WasteOut(WasteCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Energy Schemas ───────────────────────────────────────────────────────────

class EnergyCreate(BaseModel):
    sector: str = Field(..., min_length=1, max_length=50)
    consumption_kwh: float = Field(..., ge=0)
    peak_load: float = Field(..., ge=0)
    renewable_percentage: float = Field(default=0.0, ge=0, le=100)

class EnergyOut(EnergyCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Alert Schemas ────────────────────────────────────────────────────────────

class AlertOut(BaseModel):
    id: int
    type: str
    message: str
    severity: AlertSeverity
    is_resolved: bool
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Prediction Schemas ───────────────────────────────────────────────────────

class PredictionPoint(BaseModel):
    hour: int
    predicted_kwh: float

class PredictionResponse(BaseModel):
    predictions: List[PredictionPoint]
    model_accuracy: float
    generated_at: datetime


# ─── Dashboard Summary ────────────────────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_vehicles: int
    avg_congestion: float
    high_fill_zones: int
    total_energy_kwh: float
    active_alerts: int
    timestamp: datetime