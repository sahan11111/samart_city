"""
WebSocket manager for real-time dashboard updates.
Broadcasts sensor data to all connected clients every 5 seconds.
"""
import asyncio
import json
import random
from datetime import datetime, timezone
from typing import List
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import SessionLocal
from app.models import TrafficData, WasteData, EnergyData, Alert


class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove a disconnected WebSocket."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"❌ WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast a JSON message to all active connections."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        # Clean up broken connections
        for conn in disconnected:
            self.disconnect(conn)


# Global singleton manager
manager = ConnectionManager()


def get_latest_dashboard_data() -> dict:
    """
    Fetch latest sensor data from DB for broadcasting.
    Returns a structured JSON payload.
    """
    db = SessionLocal()
    try:
        # Latest traffic entries
        traffic = db.query(TrafficData).order_by(desc(TrafficData.timestamp)).limit(5).all()
        waste = db.query(WasteData).order_by(desc(WasteData.timestamp)).limit(5).all()
        energy = db.query(EnergyData).order_by(desc(EnergyData.timestamp)).limit(5).all()
        alerts = db.query(Alert).filter(Alert.is_resolved == False).order_by(desc(Alert.timestamp)).limit(5).all()

        # KPI Aggregates
        avg_congestion = db.query(func.avg(TrafficData.congestion_level)).scalar() or 0
        total_vehicles = db.query(func.sum(TrafficData.vehicle_count)).scalar() or 0
        total_energy = db.query(func.sum(EnergyData.consumption_kwh)).scalar() or 0
        active_alerts = db.query(Alert).filter(Alert.is_resolved == False).count()

        return {
            "type": "dashboard_update",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "kpis": {
                "avg_congestion": round(float(avg_congestion), 2),
                "total_vehicles": int(total_vehicles),
                "total_energy_kwh": round(float(total_energy), 2),
                "active_alerts": active_alerts
            },
            "traffic": [
                {
                    "id": t.id, "location": t.location,
                    "vehicle_count": t.vehicle_count,
                    "congestion_level": t.congestion_level,
                    "timestamp": t.timestamp.isoformat()
                } for t in traffic
            ],
            "waste": [
                {
                    "id": w.id, "zone": w.zone,
                    "fill_percentage": w.fill_percentage,
                    "collection_status": w.collection_status,
                    "timestamp": w.timestamp.isoformat()
                } for w in waste
            ],
            "energy": [
                {
                    "id": e.id, "sector": e.sector,
                    "consumption_kwh": e.consumption_kwh,
                    "peak_load": e.peak_load,
                    "timestamp": e.timestamp.isoformat()
                } for e in energy
            ],
            "alerts": [
                {
                    "id": a.id, "type": a.type,
                    "message": a.message, "severity": a.severity,
                    "timestamp": a.timestamp.isoformat()
                } for a in alerts
            ]
        }
    finally:
        db.close()


async def websocket_broadcaster():
    """
    Continuous task: broadcast dashboard data to all connected WebSocket clients.
    Runs every 5 seconds.
    """
    while True:
        if manager.active_connections:
            try:
                data = get_latest_dashboard_data()
                await manager.broadcast(data)
            except Exception as e:
                print(f"❌ Broadcast error: {e}")
        await asyncio.sleep(5)