import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_all():
    print("=== Testing PayShield Backend Services ===")
    
    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Health Check OK:", res.json()["service"])

    # 2. Auth: Send OTP
    res = client.post("/api/auth/send-otp", json={"mobile": "9876543210"})
    assert res.status_code == 200
    demo_otp = res.json()["demo_otp"]
    assert demo_otp == "123456"
    print("[PASS] 2. Send OTP OK: demo_otp =", demo_otp)

    # 3. Auth: Verify OTP
    res = client.post("/api/auth/verify-otp", json={"mobile": "9876543210", "otp": "123456"})
    assert res.status_code == 200
    token_data = res.json()
    token = token_data["access_token"]
    assert token is not None
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] 3. Verify OTP OK: JWT token generated, User ID =", token_data["user"]["id"])

    # 4. User: Onboarding
    res = client.put("/api/users/onboarding", json={
        "full_name": "Antigravity Test User",
        "age_group": "26–40",
        "profession": "Employee",
        "digital_banking_exp": "Frequent",
        "preferred_payment_method": "UPI",
        "typical_txn_range": "₹1,000–₹5,000"
    }, headers=headers)
    assert res.status_code == 200
    assert res.json()["is_onboarded"] is True
    print("[PASS] 4. User Onboarding OK:", res.json()["full_name"])

    # 5. Detection: UPI lookup
    res = client.get("/api/detect/upi/quick.refund99@paytm")
    assert res.status_code == 200
    upi_data = res.json()
    assert upi_data["intelligence_found"] is True
    assert upi_data["report_data"]["report_count"] > 0
    print(f"[PASS] 5. UPI Lookup OK: Found {upi_data['report_data']['report_count']} synthetic reports")

    # 6. Detection: QR decode
    res = client.post("/api/detect/qr", json={
        "raw_payload": "upi://pay?pa=quick.refund99@paytm&pn=Quick%20Refund%20Desk&am=5000.00&cu=INR&tn=Refund"
    })
    assert res.status_code == 200
    qr_data = res.json()["qr_data"]
    assert qr_data["is_valid_upi"] is True
    assert qr_data["pa"] == "quick.refund99@paytm"
    print("[PASS] 6. QR Decode OK: pa =", qr_data["pa"], "amount =", qr_data["am"])

    # 7. Risk Engine - Scenario 1: Safe Merchant
    res = client.post("/api/risk/analyze", json={
        "identifier": "verifiedmerchant@demo",
        "identifier_type": "upi",
        "amount": 500,
        "is_new_recipient": False,
        "payment_channel": "Merchant"
    }, headers=headers)
    assert res.status_code == 200
    s1 = res.json()
    assert s1["risk_score"] < 30, f"Expected low risk, got {s1['risk_score']}"
    assert s1["risk_level"] == "LOW RISK SIGNAL"
    assert s1["cooling_off_required"] is False
    print(f"[PASS] 7. Safe Merchant OK: Score = {s1['risk_score']}/100 ({s1['risk_level']})")

    # 8. Risk Engine - Scenario 2: Refund Scam (Primary Demo Scenario)
    res = client.post("/api/risk/analyze", json={
        "identifier": "quick.refund99@paytm",
        "identifier_type": "upi",
        "amount": 5000,
        "message": "You were accidentally sent ₹5,000. Return it immediately to this different UPI ID.",
        "is_new_recipient": True,
        "payment_channel": "SMS",
        "immediate_action_demanded": True,
        "demo_scenario": "Scenario 2 – Accidental Deposit Refund Scam"
    }, headers=headers)
    assert res.status_code == 200
    s2 = res.json()
    assert s2["risk_score"] >= 60, f"Expected high risk, got {s2['risk_score']}"
    assert s2["cooling_off_required"] is True
    analysis_id = s2["analysis_id"]
    print(f"[PASS] 8. Primary Demo Scenario (Refund Scam) OK: Score = {s2['risk_score']}/100, Cooling-off = {s2['cooling_off_required']}")

    # 9. Simulated Payment Execution & Outcome Recording
    res = client.post("/api/risk/simulate-payment", json={
        "analysis_id": analysis_id,
        "recipient": "quick.refund99@paytm",
        "amount": 5000,
        "purpose": "Accidental Refund",
        "action_taken": "cancelled"
    }, headers=headers)
    assert res.status_code == 200
    pay_res = res.json()
    assert pay_res["is_demo"] is True
    assert pay_res["status"] == "CANCELLED_BY_USER"
    print(f"[PASS] 9. Simulated Payment Outcome OK: {pay_res['message']}")

    # 10. Post-Payment Survey
    res = client.post("/api/survey", json={
        "analysis_id": analysis_id,
        "was_legitimate": "No",
        "warning_helped": "Yes",
        "felt_pressured": "Yes",
        "request_type": "Refund",
        "feedback": "PayShield's cooling-off friction successfully stopped this payment."
    }, headers=headers)
    assert res.status_code == 200
    print("[PASS] 10. Post-Payment Survey OK:", res.json()["message"])

    # 11. History Retrieval & Stats
    res = client.get("/api/history", headers=headers)
    assert res.status_code == 200
    hist = res.json()
    assert len(hist) >= 1
    res_stats = client.get("/api/history/stats", headers=headers)
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert stats["total_analyzed"] >= 1
    print(f"[PASS] 11. History & Stats OK: Analyzed = {stats['total_analyzed']}, Stopped = {stats['cancelled_count']}")

    # 12. Chatbot Context-Aware Query
    res = client.post("/api/chat", json={
        "message": "Why was this transaction risky?",
        "risk_context": s2
    })
    assert res.status_code == 200
    chat_res = res.json()
    assert "score" in chat_res["reply"].lower() or "payshield" in chat_res["reply"].lower()
    print("[PASS] 12. Chatbot Query OK:", chat_res["reply"][:90], "...")

    # 13. Awareness Guides & News
    res = client.get("/api/awareness/articles")
    assert res.status_code == 200
    assert len(res.json()) >= 5
    res_news = client.get("/api/awareness/news?refresh=true")
    assert res_news.status_code == 200
    print(f"[PASS] 13. Awareness Articles OK: {len(res.json())} guides, {len(res_news.json())} news items")

    # 14. Admin Evaluation Benchmark (110 Scenarios)
    res = client.get("/api/admin/evaluation")
    assert res.status_code == 200
    eval_data = res.json()
    assert eval_data["total_scenarios"] >= 100
    assert eval_data["accuracy"] >= 90.0, f"Expected accuracy >= 90%, got {eval_data['accuracy']}%"
    assert eval_data["false_positive_rate"] <= 15.0
    print(f"[PASS] 14. 110 Synthetic Scenarios Benchmark OK: Accuracy = {eval_data['accuracy']}%, F1 = {eval_data['f1_score']}%, Latency = {eval_data['avg_latency_ms']}ms")

    print("\n>>> ALL 14 AUTOMATED BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_all()
