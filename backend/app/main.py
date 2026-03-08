"""
Smart City Dashboard - FastAPI Application Entry Point
Initializes the app, registers routers, WebSocket, and background tasks.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import engine, SessionLocal
from app.models import Base
from app.routers import auth, traffic, waste, energy, alerts, predict
from app.websocket import manager, websocket_broadcaster
from app.services.iot_simulator import run_iot_simulator
from app.utils.helpers import seed_sample_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler:
    - Creates database tables on startup
    - Seeds sample data if DB is empty
    - Starts IoT simulator and WebSocket broadcaster as background tasks
    """
    # Create all database tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    # Seed sample data for development
    db = SessionLocal()
    from app.models import TrafficData
    if db.query(TrafficData).count() == 0:
        seed_sample_data(db, records=100)
    db.close()

    # Start background tasks
    iot_task = asyncio.create_task(run_iot_simulator())
    broadcaster_task = asyncio.create_task(websocket_broadcaster())
    print("🚀 Background tasks started")

    yield  # Application runs here

    # Cleanup on shutdown
    iot_task.cancel()
    broadcaster_task.cancel()
    print("🛑 Background tasks stopped")


# ─── Application Setup ────────────────────────────────────────────────────────

app = FastAPI(
    title="Smart City Dashboard API",
    description="Real-time smart city monitoring with traffic, waste, and energy analytics",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ─────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(traffic.router)
app.include_router(waste.router)
app.include_router(energy.router)
app.include_router(alerts.router)
app.include_router(predict.router)


# ─── WebSocket Endpoint ───────────────────────────────────────────────────────

@app.websocket("/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time dashboard updates.
    Clients connect here to receive live sensor data every 5 seconds.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; data is pushed via broadcaster
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    """API health check endpoint."""
    return JSONResponse({"status": "healthy", "service": "Smart City Dashboard API"})


@app.get("/", tags=["System"])
async def root():
    return {"message": "Smart City Dashboard API v1.0.0 — Visit /docs for API reference"}