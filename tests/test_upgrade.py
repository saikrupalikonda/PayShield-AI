"""
PayShield Upgrade Automated Acceptance Test Suite.
Tests all acceptance criteria and edge cases specified in the project upgrade specification.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_acceptance_criteria():
    print("\n=======================================================")
    print("=== RUNNING PAYSHIELD UPGRADE ACCEPTANCE TEST SUITE ===")
    print("=======================================================\n")

    # TEST 1: Upload / parse valid synthetic UPI QR
    res1 = client.post("/api/detect/qr", json={
        "raw_data": "upi://pay?pa=scammer123@demo&pn=Demo%20Merchant&am=5000&cu=INR&tn=Refund",
        "upi_id": "scammer123@demo",
        "payee_name": "Demo Merchant",
        "amount": 5000,
        "transaction_note": "Refund"
    })
    assert res1.status_code == 200, f"Test 1 failed: {res1.text}"
    data1 = res1.json()
    assert data1["qr_data"]["pa"] == "scammer123@demo"
    assert data1["qr_data"]["pn"] == "Demo Merchant"
    assert data1["risk_score"] > 0
    print("[PASS] TEST 1: Valid synthetic UPI QR decoded & analyzed successfully (pa: scammer123@demo, am: 5000)")

    # TEST 2: Upload invalid payload
    res2 = client.post("/api/detect/qr", json={
        "raw_data": "not_a_valid_qr_code_string"
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["qr_data"]["is_valid_upi"] is False
    assert len(data2["qr_data"]["anomaly_flags"]) > 0
    print("[PASS] TEST 2: Invalid QR string handled gracefully without crashing")

    # TEST 3: Upload QR containing synthetic reported UPI (scammer123@demo)
    res3 = client.post("/api/detect/qr", json={
        "raw_data": "upi://pay?pa=scammer123@demo&pn=Demo%20Merchant&am=5000&cu=INR&tn=Refund"
    })
    assert res3.status_code == 200
    data3 = res3.json()
    assert data3["is_known_complaint"] is True
    assert data3["synthetic_report"] is not None
    assert data3["synthetic_report"]["report_count"] == 5
    assert "HIGH RISK" in data3["risk_level"]
    print(f"[PASS] TEST 3: QR with reported identifier detected ({data3['risk_level']}, Score: {data3['risk_score']}/100, Reports: {data3['synthetic_report']['report_count']})")

    # TEST 4: Upload QR containing identifier with NO reports (verifiedmerchant@demo)
    res4 = client.post("/api/detect/qr", json={
        "raw_data": "upi://pay?pa=verifiedmerchant@demo&pn=Metro%20Retail%20Mart&am=500&cu=INR&tn=Store%20Purchase"
    })
    assert res4.status_code == 200
    data4 = res4.json()
    assert data4["risk_level"] == "LOW RISK SIGNAL"
    assert "No Known Complaints Found" in data4["plain_explanation"]
    assert "Absence of reports does not guarantee" in data4["plain_explanation"]
    print(f"[PASS] TEST 4: Clean identifier returned 'No Known Complaints Found' with LOW RISK SIGNAL ({data4['risk_score']}/100)")

    # TEST 5: Analyze "Pay now and enjoy ₹5,000 cashback later."
    res5 = client.post("/api/detect/message", json={
        "message": "Pay now and enjoy ₹5,000 cashback later."
    })
    assert res5.status_code == 200
    data5 = res5.json()
    assert data5["primary_category"] == "REWARD / CASHBACK SCAM"
    assert data5["risk_score"] >= 50
    assert any("Reward" in s["signal"] for s in data5["detected_signals"])
    print(f"[PASS] TEST 5: Reward scam recognized ({data5['primary_category']}, Score: {data5['risk_score']}/100, Signals: {len(data5['detected_signals'])})")

    # TEST 6: Analyze Fake Bank Authority + Account Threat + Payment + Urgency
    res6 = client.post("/api/detect/message", json={
        "message": "I am from your bank. Your account will be blocked unless you make a verification payment immediately."
    })
    assert res6.status_code == 200
    data6 = res6.json()
    assert data6["urgency_detected"] is True
    assert data6["impersonation_detected"] is True
    assert data6["risk_score"] >= 70
    assert "HIGH RISK" in data6["risk_level"]
    print(f"[PASS] TEST 6: Complex compound scam recognized ({data6['risk_level']}, Score: {data6['risk_score']}/100, Primary: {data6['primary_category']})")

    # TEST 7: Analyze "I called customer care to ask about my account."
    res7 = client.post("/api/detect/message", json={
        "message": "I called customer care to ask about my account."
    })
    assert res7.status_code == 200
    data7 = res7.json()
    assert data7["risk_level"] == "LOW RISK SIGNAL"
    assert data7["risk_score"] <= 20
    print(f"[PASS] TEST 7: Safe inquiry context recognized as LOW RISK (Score: {data7['risk_score']}/100)")

    # TEST 8: Analyze "I never share my OTP with anyone."
    res8 = client.post("/api/detect/message", json={
        "message": "I never share my OTP with anyone."
    })
    assert res8.status_code == 200
    data8 = res8.json()
    assert data8["risk_level"] == "LOW RISK SIGNAL"
    assert data8["risk_score"] <= 20
    print(f"[PASS] TEST 8: Safe OTP negation recognized as LOW RISK (Score: {data8['risk_score']}/100)")

    # TEST 9: Chatbot understands message analysis results (Reward scam query)
    res9 = client.post("/api/chat", json={
        "message": "Why is this reward message risky?",
        "risk_context": data5
    })
    assert res9.status_code == 200
    data9 = res9.json()
    assert "reward" in data9["reply"].lower()
    assert "payment" in data9["reply"].lower()
    print(f"[PASS] TEST 9: Chatbot answered contextually regarding reward message risk: {data9['reply'][:75]}...")

    # TEST 10: Message feedback & Message detections history
    res10_fb = client.post("/api/message-detections/feedback", json={
        "detection_id": data5["analysis_id"],
        "was_helpful": "Yes",
        "received_message": "Yes",
        "reported": "Not yet"
    })
    assert res10_fb.status_code == 200
    assert res10_fb.json()["success"] is True

    res10_hist = client.get("/api/message-detections")
    assert res10_hist.status_code == 200
    hist_items = res10_hist.json()
    assert len(hist_items) >= 1
    print(f"[PASS] TEST 10: Message feedback submitted & message detections history retrieved ({len(hist_items)} items)")

    # TEST 11: Demo message library endpoint
    res11 = client.get("/api/detect/demo/messages")
    assert res11.status_code == 200
    demo_msgs = res11.json()
    assert len(demo_msgs) >= 6
    print(f"[PASS] TEST 11: Demo messages library retrieved ({len(demo_msgs)} demo scenarios)")

    # TEST 12: Admin NLP ML Metrics endpoint
    res12 = client.get("/api/admin/nlp-metrics")
    assert res12.status_code == 200
    metrics = res12.json()
    assert metrics["accuracy"] >= 90.0
    print(f"[PASS] TEST 12: Admin ML evaluation metrics verified (Accuracy: {metrics['accuracy']}%, F1: {metrics['f1_score']}%)")

    print("\n=======================================================")
    print(">>> ALL 12 UPGRADE ACCEPTANCE TESTS PASSED (100%)! <<<")
    print("=======================================================\n")

if __name__ == "__main__":
    test_acceptance_criteria()
