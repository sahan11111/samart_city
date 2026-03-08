"""
IoT Sensor Simulator - Background task that generates realistic
sensor data every 5 seconds and creates alerts when thresholds are exceeded.
"""
import asyncio
import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import TrafficData, WasteData, EnergyData, Alert, AlertSeverity

# ─── Configuration ─────────────────────────────────────────────────────────────

TRAFFIC_LOCATIONS = [
    "Downtown Junction", "Airport Road", "City Center",
    "Industrial Zone", "University Ave", "Harbor Bridge",
    "North Highway", "South Boulevard"
]

WASTE_ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F"]

ENERGY_SECTORS = [
    "Residential", "Commercial", "Industrial",
    "Government", "Healthcare", "Transportation"
]

# Alert thresholds
TRAFFIC_CONGESTION_THRESHOLD = 80.0   # %
WASTE_FILL_THRESHOLD = 90.0            # %
ENERGY_PEAK_THRESHOLD = 500.0          # kW


def generate_traffic_data(db: Session):
    """Generate realistic traffic sensor reading."""
    location = random.choice(TRAFFIC_LOCATIONS)
    # Simulate rush hour patterns
    hour = datetime.now().hour
    base_vehicles = 200 if 7 <= hour <= 9 or 17 <= hour <= 19 else 80
    vehicle_count = max(0, int(random.gauss(base_vehicles, 40)))
    congestion_level = min(100.0, max(0.0, vehicle_count / 3.5 + random.uniform(-5, 5)))
    speed_avg = max(5.0, 80.0 - congestion_level * 0.7 + random.uniform(-5, 5))

    entry = TrafficData(
        location=location,
        vehicle_count=vehicle_count,
        congestion_level=round(congestion_level, 2),
        speed_avg=round(speed_avg, 2)
    )
    db.add(entry)

    # Auto-alert on high congestion
    if congestion_level > TRAFFIC_CONGESTION_THRESHOLD:
        severity = AlertSeverity.critical if congestion_level > 90 else AlertSeverity.high
        alert = Alert(
            type="traffic",
            message=f"High congestion ({congestion_level:.1f}%) detected at {location}",
            severity=severity
        )
        db.add(alert)

    return entry


def generate_waste_data(db: Session):
    """Generate realistic waste bin sensor reading."""
    zone = random.choice(WASTE_ZONES)
    fill_percentage = min(100.0, max(0.0, random.uniform(10, 100)))
    
    if fill_percentage > 90:
        collection_status = "overdue"
    elif fill_percentage > 70:
        collection_status = "pending"
    else:
        collection_status = "collected"
    
    weight_kg = round(fill_percentage * 2.5 + random.uniform(-10, 10), 2)

    entry = WasteData(
        zone=zone,
        fill_percentage=round(fill_percentage, 2),
        collection_status=collection_status,
        weight_kg=max(0.0, weight_kg)
    )
    db.add(entry)

    # Auto-alert on high fill
    if fill_percentage > WASTE_FILL_THRESHOLD:
        severity = AlertSeverity.critical if fill_percentage > 95 else AlertSeverity.high
        alert = Alert(
            type="waste",
            message=f"Waste bin in {zone} is {fill_percentage:.1f}% full — immediate collection required",
            severity=severity
        )
        db.add(alert)

    return entry


def generate_energy_data(db: Session):
    """Generate realistic energy consumption reading."""
    sector = random.choice(ENERGY_SECTORS)
    hour = datetime.now().hour
    # Simulate day/night patterns
    base_consumption = 300 if 8 <= hour <= 20 else 150
    consumption_kwh = max(10.0, random.gauss(base_consumption, 60))
    peak_load = consumption_kwh * random.uniform(1.1, 1.5)
    renewable_pct = random.uniform(5.0, 40.0)

    entry = EnergyData(
        sector=sector,
        consumption_kwh=round(consumption_kwh, 2),
        peak_load=round(peak_load, 2),
        renewable_percentage=round(renewable_pct, 2)
    )
    db.add(entry)

    # Auto-alert on high peak load
    if peak_load > ENERGY_PEAK_THRESHOLD:
        severity = AlertSeverity.critical if peak_load > 700 else AlertSeverity.high
        alert = Alert(
            type="energy",
            message=f"Peak energy load {peak_load:.1f} kW in {sector} sector exceeds threshold",
            severity=severity
        )
        db.add(alert)

    return entry


async def run_iot_simulator():
    """
    Background task: Generate sensor data every 5 seconds.
    Runs indefinitely as a background service.
    """
    print("🚀 IoT Simulator started — generating data every 5 seconds")
    while True:
        try:
            db = SessionLocal()
            generate_traffic_data(db)
            generate_waste_data(db)
            generate_energy_data(db)
            db.commit()
            db.close()
        except Exception as e:
            print(f"❌ IoT Simulator error: {e}")
        await asyncio.sleep(5)