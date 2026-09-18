from pydantic import BaseModel


class RiskThresholds(BaseModel):
    low: float = 30.0
    medium: float = 60.0
    high: float = 80.0


settings = {
    "app_name": "PayShield AI",
    "risk_thresholds": RiskThresholds(),
    "default_model_path": "data/models/anomaly_detector.pkl",
    "intent_model_path": "data/models/intent_classifier.bin",
}
