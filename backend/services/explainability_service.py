def explain_risk(risk_score: float):
    """Convert a numeric risk score into human-readable warning text."""
    if risk_score >= 80:
        return "High risk: stop, verify the payee, and confirm the request through official channels."
    if risk_score >= 60:
        return "Elevated risk: this payment may be suspicious. Review the transaction before continuing."
    if risk_score >= 30:
        return "Moderate risk: monitor the activity and verify the request if anything feels unusual."
    return "Low risk: no strong signs of fraud were detected in the current signals."
