"""
Utility functions for the Smart City Dashboard backend.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import TrafficData, WasteData, EnergyData, Alert
from app.services.iot_simulator import (
    generate_traffic_data, generate_waste_data, generate_energy_data
)


def seed_sample_data(db: Session, records: int = 0):
    """
    Seed the database with sample historical data.
    Useful for development and testing.
    
    Args:
        db: Active database session
        records: Number of records to generate per data type
    """
    print(f"🌱 Seeding {records} sample records per sensor type...")

    for _ in range(records):
        generate_traffic_data(db)
        generate_waste_data(db)
        generate_energy_data(db)

    db.commit()
    print("✅ Sample data seeded successfully")