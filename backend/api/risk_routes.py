from fastapi import APIRouter

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/eval")
def evaluate_risk(payload: dict):
    amount = float(payload.get("amount", 0))
    recipient = payload.get("payee", "")
    sms_context = payload.get("sms_context", "")

    risk_score = 12
    if amount > 5000:
        risk_score += 25
    if "random" in recipient.lower() or "unknown" in recipient.lower():
        risk_score += 28
    if any(keyword in (sms_context or "").lower() for keyword in ["urgent", "refund", "verify", "blocked"]):
        risk_score += 30

    risk_score = min(risk_score, 100)

    recommendation = "Proceed with caution" if risk_score < 60 else "Block and verify"

    return {
        "risk_score": risk_score,
        "decision": recommendation,
        "reasons": [
            "High transfer amount" if amount > 5000 else "Transfer size within normal range",
            "Unfamiliar payee" if "random" in recipient.lower() or "unknown" in recipient.lower() else "Payee is familiar",
            "Scam indicators detected in SMS" if any(keyword in (sms_context or "").lower() for keyword in ["urgent", "refund", "verify", "blocked"]) else "No scam phrases found in message",
        ],
    }
