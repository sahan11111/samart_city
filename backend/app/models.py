"""
SQLAlchemy ORM models for Smart City Dashboard.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    citizen = "citizen"


class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class User(Base):
    """User account model with role-based access."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.citizen, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TrafficData(Base):
    """Real-time and historical traffic sensor data."""
    __tablename__ = "traffic_data"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(100), nullable=False, index=True)
    vehicle_count = Column(Integer, nullable=False)
    congestion_level = Column(Float, nullable=False)  # 0-100 percentage
    speed_avg = Column(Float, default=0.0)            # Average speed km/h
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class WasteData(Base):
    """Waste management sensor data per zone."""
    __tablename__ = "waste_data"

    id = Column(Integer, primary_key=True, index=True)
    zone = Column(String(50), nullable=False, index=True)
    fill_percentage = Column(Float, nullable=False)   # 0-100 percentage
    collection_status = Column(String(30), default="pending")  # pending/collected/overdue
    weight_kg = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class EnergyData(Base):
    """Energy consumption data per sector."""
    __tablename__ = "energy_data"

    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String(50), nullable=False, index=True)
    consumption_kwh = Column(Float, nullable=False)
    peak_load = Column(Float, nullable=False)         # kW
    renewable_percentage = Column(Float, default=0.0) # % of renewable energy
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class Alert(Base):
    """System alerts generated from sensor thresholds."""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)         # traffic/waste/energy
    message = Column(Text, nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.medium)
    is_resolved = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)