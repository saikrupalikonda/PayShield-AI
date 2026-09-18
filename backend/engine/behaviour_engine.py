def score_behaviour(z_score: float = 0.0, usual_amount: float = 0.0, amount: float = 0.0):
    """Measure deviation from the user's spending baseline."""
    score = 0

    if z_score > 2.5:
        score += 40
    elif z_score > 1.5:
        score += 20

    if usual_amount and amount > usual_amount * 2:
        score += 25

    return min(score, 100)
