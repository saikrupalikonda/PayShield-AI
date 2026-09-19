import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Header
from jose import jwt, JWTError

from backend.schemas import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    MessageAnalysisRequest,
    MessageAnalysisResponse,
    SimulatedPaymentRequest,
    SimulatedPaymentResponse
)
from backend.services.risk_engine import risk_engine
from backend.services.message_analyzer import message_analyzer
from backend.config import settings
from backend.database import db

router = APIRouter(prefix="/api/risk", tags=["Risk Analysis"])


def get_optional_user_id(authorization: Optional[str] = Header(None)) -> str:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            return payload.get("sub", "demo_guest_user")
        except JWTError:
            pass
    return "demo_guest_user"


@router.post("/analyze", response_model=RiskAnalysisResponse)
def analyze_risk(
    req: RiskAnalysisRequest,
    user_id: str = Depends(get_optional_user_id)
):
    analysis = risk_engine.analyze(req)
    
    # Save detection in history
    detection_record = {
        "id": analysis.analysis_id,
        "user_id": user_id,
        "timestamp": analysis.created_at,
        "detection_type": req.identifier_type.upper(),
        "identifier": req.identifier,
        "amount": req.amount,
        "risk_score": analysis.risk_score,
        "risk_level": analysis.risk_level,
        "action_taken": "analyzed",
        "analysis_result": analysis.model_dump()
    }
    db.save_detection(detection_record)

    return analysis


@router.post("/message", response_model=MessageAnalysisResponse)
def analyze_message(req: MessageAnalysisRequest):
    return message_analyzer.analyze(req.message)


@router.post("/simulate-payment", response_model=SimulatedPaymentResponse)
def simulate_payment(
    req: SimulatedPaymentRequest,
    user_id: str = Depends(get_optional_user_id)
):
    txn_id = f"sim_txn_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow()

    # Update detection record action_taken
    db.update_detection_action(req.analysis_id, req.action_taken)

    if req.action_taken == "confirmed":
        msg = f"Simulated demo payment of ₹{req.amount:,.2f} to {req.recipient} recorded. DEMO ONLY – No real banking transaction was executed."
        status = "COMPLETED_DEMO"
    else:
        msg = f"Simulated payment to {req.recipient} was successfully cancelled by user."
        status = "CANCELLED_BY_USER"

    return SimulatedPaymentResponse(
        transaction_id=txn_id,
        status=status,
        message=msg,
        recorded_at=now,
        is_demo=True
    )
