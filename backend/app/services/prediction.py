"""
Predictive analytics service using scikit-learn Linear Regression.
Forecasts energy consumption for the next 24 hours.
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
import numpy as np
from datetime import datetime, timezone
from typing import Optional
from app.models import EnergyData
from app.schemas import PredictionResponse, PredictionPoint


def predict_energy_24h(db: Session) -> Optional[dict]:
    """
    Predict next 24 hours of energy consumption.
    
    Uses the last 168 records (7 days of hourly data) to train
    a linear regression model, then forecasts 24 hours ahead.
    
    Returns:
        PredictionResponse dict or None if insufficient data
    """
    # Fetch recent energy data (ordered oldest first for training)
    records = (
        db.query(EnergyData)
        .order_by(desc(EnergyData.timestamp))
        .limit(168)
        .all()
    )
    records = list(reversed(records))  # Oldest first

    if len(records) < 24:
        return None

    # Feature: sequential hour index; Target: consumption_kwh
    X = np.array(range(len(records))).reshape(-1, 1)
    y = np.array([r.consumption_kwh for r in records])

    # Train linear regression
    model = LinearRegression()
    model.fit(X, y)

    # Evaluate model on training data
    y_pred_train = model.predict(X)
    accuracy = max(0.0, round(r2_score(y, y_pred_train) * 100, 2))

    # Predict next 24 hours
    next_indices = np.array(
        range(len(records), len(records) + 24)
    ).reshape(-1, 1)
    predictions_raw = model.predict(next_indices)

    predictions = [
        PredictionPoint(
            hour=i + 1,
            predicted_kwh=max(0.0, round(float(val), 2))
        )
        for i, val in enumerate(predictions_raw)
    ]

    return PredictionResponse(
        predictions=predictions,
        model_accuracy=accuracy,
        generated_at=datetime.now(timezone.utc)
    )