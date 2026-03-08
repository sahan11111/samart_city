"""
Prediction router: Energy consumption forecasting endpoint.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User
from app.schemas import PredictionResponse
from app.services.prediction import predict_energy_24h
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/predict", tags=["Prediction"])


@router.get("/energy", response_model=PredictionResponse)
async def get_energy_prediction(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Get 24-hour energy consumption prediction using Linear Regression.
    Requires at least 24 historical data points.
    """
    result = predict_energy_24h(db)
    if not result:
        raise HTTPException(
            status_code=422,
            detail="Not enough historical data for prediction. Need at least 24 records."
        )
    return result