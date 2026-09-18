from backend.engine.behaviour_engine import score_behaviour
from backend.engine.nlp_engine import score_sms_intent
from backend.engine.transaction_engine import score_transaction


def aggregate_risk(payee: str, amount: float, history_count: int = 0, usual_amount: float = 0.0,
                  z_score: float = 0.0, sms_message: str = ""):
    """Aggregate signal scores into a single risk score from 0-100."""
    tx_score = score_transaction(payee, amount, history_count, usual_amount)
    behaviour_score = score_behaviour(z_score, usual_amount, amount)
    nlp_score = score_sms_intent(sms_message)

    total = round((tx_score * 0.4) + (behaviour_score * 0.35) + (nlp_score * 0.25), 2)
    return {
        "transaction_score": tx_score,
        "behaviour_score": behaviour_score,
        "nlp_score": nlp_score,
        "risk_score": min(total, 100),
    }
