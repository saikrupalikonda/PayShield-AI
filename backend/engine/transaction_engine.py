def score_transaction(payee: str, amount: float, history_count: int = 0, usual_amount: float = 0.0):
    """Evaluate payee familiarity and transfer anomalies."""
    score = 0

    if history_count == 0:
        score += 35
    elif history_count < 3:
        score += 15

    if usual_amount and amount > usual_amount * 3:
        score += 25

    if "random" in payee.lower() or "unknown" in payee.lower():
        score += 20

    return min(score, 100)
