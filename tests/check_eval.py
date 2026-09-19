from backend.seed.seed_data import EVALUATION_DATASET
from backend.schemas import RiskAnalysisRequest
from backend.services.risk_engine import risk_engine

scam_scores = []
genuine_scores = []

for item in EVALUATION_DATASET:
    req = RiskAnalysisRequest(
        identifier="test@demo",
        identifier_type="upi",
        amount=15000.0 if item["amount_spike"] else 450.0,
        message=item["text"],
        is_new_recipient=item["new_recipient"],
        payment_channel=item["channel"]
    )
    res = risk_engine.analyze(req)
    if item["label"] == "SCAM":
        scam_scores.append((item["id"], res.risk_score, item["text"]))
    else:
        genuine_scores.append((item["id"], res.risk_score))

print("Min scam score:", min(s[1] for s in scam_scores), "Max:", max(s[1] for s in scam_scores))
print("Min genuine score:", min(g[1] for g in genuine_scores), "Max:", max(g[1] for g in genuine_scores))

low_scams = [s for s in scam_scores if s[1] < 40]
print(f"Scams with score < 40: {len(low_scams)}")
for s in low_scams[:5]:
    print(s)
