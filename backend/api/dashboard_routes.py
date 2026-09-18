from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/metrics")
def get_metrics():
    return {
        "total_transactions": 12482,
        "risk_alerts": 318,
        "model_accuracy": 0.96,
        "false_positive_rate": 0.04,
        "top_typology": "Refund scam",
        "risk_trend": "upward",
    }
