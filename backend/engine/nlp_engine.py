def score_sms_intent(message: str):
    """Basic scam-intent scoring based on common SMS fraud phrases."""
    text = (message or "").lower()
    score = 0

    if "refund" in text:
        score += 25
    if "urgent" in text or "immediately" in text or "blocked" in text:
        score += 25
    if "verify" in text or "support" in text or "bank" in text:
        score += 20

    return min(score, 100)
