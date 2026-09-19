"""
PayShield Chatbot Acceptance Test Suite
Tests all 10 conversation test cases from Section 29, out-of-scope redirection,
sensitive data leakage guarding, and the full multi-turn interaction from Section 32.
"""

import sys
import os
from fastapi.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app

client = TestClient(app)


def test_chatbot_test_1_qr_context():
    """TEST 1: User asks 'Why was this QR flagged?' -> Uses current QR report."""
    qr_context = {
        "detection_type": "qr",
        "identifier": "merchant123@demo",
        "risk_score": 78,
        "risk_level": "HIGH RISK SIGNAL",
        "detected_categories": ["REFUND_SCAM", "URGENCY"],
        "signals": [
            {"name": "Refund language", "weight": 25, "explanation": "The message asks the user to return money."},
            {"name": "Urgency", "weight": 15, "explanation": "The user is being pressured to act immediately."}
        ],
        "qr_data": {
            "pa": "merchant123@demo",
            "pn": "Demo Merchant",
            "am": "5000.00",
            "tn": "Accidental Deposit Refund"
        },
        "recommendation": "Verify recipient independently."
    }

    res = client.post("/api/chat", json={
        "message": "Why was this QR flagged?",
        "risk_context": qr_context
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"]

    # Must explain specific signals from current report
    assert "merchant123@demo" in reply
    assert "Refund language" in reply or "refund" in reply.lower()
    assert "Urgency" in reply or "urgency" in reply.lower()
    assert "78" in reply
    print("[PASS] TEST 1: QR report context correctly referenced.")


def test_chatbot_test_2_risk_score_not_probability():
    """TEST 2: User asks 'What does 82 mean?' -> Explains risk score, NOT 82% probability."""
    res = client.post("/api/chat", json={
        "message": "What does 82 mean?",
        "risk_context": {"risk_score": 82, "risk_level": "VERY HIGH RISK SIGNAL"}
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "82/100" in reply or "82" in reply
    assert "NOT a statistical probability" in reply or "NOT" in reply or "not mean an '82% chance of fraud'" in reply
    assert "Scam-Pattern" in reply or "scam patterns" in reply.lower()
    print("[PASS] TEST 2: Risk score explained as scam-pattern score, not probability.")


def test_chatbot_test_3_risk_signals_vs_definitive_fraud():
    """TEST 3: User asks 'Is this UPI ID definitely a scam?' -> Explains risk signals vs definitive fraud."""
    res = client.post("/api/chat", json={
        "message": "Is this UPI ID definitely a scam?",
        "risk_context": {"identifier": "test.payee@upi", "risk_score": 75}
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "risk signals" in reply.lower()
    assert "not definitive" in reply.lower() or "not legally prove" in reply.lower() or "verify" in reply.lower()
    print("[PASS] TEST 3: Explained risk signals vs definitive fraud determinations.")


def test_chatbot_test_4_reward_cashback_scam():
    """TEST 4: User asks about paying ₹500 to receive ₹5,000 cashback -> Explains reward scam."""
    res = client.post("/api/chat", json={
        "message": "I got a message saying pay ₹500 to receive ₹5,000 cashback."
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "reward" in reply.lower() or "cashback" in reply.lower()
    assert "never have to pay money to receive" in reply.lower() or "unsolicited" in reply.lower()
    print("[PASS] TEST 4: Reward/cashback scam explained correctly.")


def test_chatbot_test_5_otp_protection():
    """TEST 5: User says 'My bank is asking for my OTP.' -> Never share OTP; contact bank officially."""
    res = client.post("/api/chat", json={
        "message": "My bank is asking for my OTP."
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "never share" in reply.lower()
    assert "otp" in reply.lower()
    print("[PASS] TEST 5: Never share OTP guidance delivered.")


def test_chatbot_test_6_money_already_lost():
    """TEST 6: User says 'I already transferred the money.' -> Incident response + 1930 + cybercrime portal."""
    res = client.post("/api/chat", json={
        "message": "I already transferred the money."
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "1930" in reply
    assert "cybercrime.gov.in" in reply
    assert "bank" in reply.lower()
    assert "freeze" in reply.lower() or "golden hour" in reply.lower() or "helpline" in reply.lower()
    print("[PASS] TEST 6: Emergency incident response guidance verified.")


def test_chatbot_test_7_app_fraud_explanation():
    """TEST 7: User asks 'What is authorised push payment fraud?' -> Clear APP fraud explanation."""
    res = client.post("/api/chat", json={
        "message": "What is authorised push payment fraud?"
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "manipulated" in reply.lower() or "authorising the payment themselves" in reply.lower() or "authorizing" in reply.lower()
    assert "payshield" in reply.lower()
    print("[PASS] TEST 7: Authorised Push Payment (APP) fraud defined clearly.")


def test_chatbot_test_8_message_report_context():
    """TEST 8: User asks 'Why does this message have a high score?' -> Lists exact signals from message report."""
    msg_context = {
        "identifier": "Accidental Refund Error",
        "identifier_type": "sms_text",
        "risk_score": 85,
        "risk_level": "VERY HIGH RISK SIGNAL",
        "primary_category": "Accidental Refund Scam",
        "detected_categories": ["Refund Scam", "Urgency"],
        "signals": [
            {"name": "Accidental Deposit Claim", "weight": 25, "explanation": "Claims money was transferred by mistake."},
            {"name": "Urgent Pressure", "weight": 15, "explanation": "Demands payment within 15 minutes."}
        ]
    }

    res = client.post("/api/chat", json={
        "message": "Why does this message have a high score?",
        "risk_context": msg_context
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "Accidental Deposit Claim" in reply or "refund" in reply.lower()
    assert "Urgent Pressure" in reply or "urgency" in reply.lower()
    assert "85/100" in reply or "85" in reply
    print("[PASS] TEST 8: Message report exact signals listed.")


def test_chatbot_test_9_no_complaints_not_100_percent_safe():
    """TEST 9: User asks 'No complaints were found. Am I 100% safe?' -> Absence != guaranteed legitimate."""
    res = client.post("/api/chat", json={
        "message": "No complaints were found. Am I 100% safe?",
        "risk_context": {"risk_score": 15, "risk_level": "LOW RISK SIGNAL"}
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "no" in reply.lower()
    assert "does not prove" in reply.lower() or "not prove" in reply.lower() or "available dataset" in reply.lower()
    print("[PASS] TEST 9: 'No complaints found' nuanced explanation verified.")


def test_chatbot_test_10_safe_negation_otp():
    """TEST 10: User says 'I never share my OTP with anyone.' -> Negation recognized as safe affirmation."""
    res = client.post("/api/chat", json={
        "message": "I never share my OTP with anyone."
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    # Must NOT warn that the user is being attacked, but affirm safety
    assert "emergency" not in reply.lower()
    assert "payshield" in reply.lower() or "safe" in reply.lower() or "protect" in reply.lower()
    print("[PASS] TEST 10: Safe negation handling verified.")


def test_chatbot_test_11_sensitive_data_guard():
    """TEST 11: User inputs sensitive OTP -> Immediate security warning."""
    res = client.post("/api/chat", json={
        "message": "My OTP is 482910 for the refund"
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "do not share" in reply.lower() or "advisory" in reply.lower()
    assert "confidential" in reply.lower() or "secret" in reply.lower()
    print("[PASS] TEST 11: Sensitive data leak guard verified.")


def test_chatbot_test_12_out_of_scope():
    """TEST 12: User asks out-of-scope query -> Polite redirection."""
    res = client.post("/api/chat", json={
        "message": "Write a python program to calculate factorial"
    })
    assert res.status_code == 200
    reply = res.json()["reply"]

    assert "payshield assistant" in reply.lower()
    assert "payment safety" in reply.lower() or "scam" in reply.lower()
    print("[PASS] TEST 12: Out of scope redirection verified.")


def test_chatbot_test_13_multi_turn_demo_scenario():
    """
    TEST 13: Full 17-Step Scenario from Section 32:
    1. Active QR Report: scammer123@demo (Score: 82/100, Refund pattern, New recipient, Urgency)
    2. 'Why is this risky?' -> Explains the 3 exact signals.
    3. 'Should I pay?' -> Recommends pausing & independent verification.
    4. 'What if I already paid?' -> Switches to incident response.
    5. 'How do I report this?' -> Provides official cybercrime reporting guidance (1930 / portal).
    6. 'What is authorised push payment fraud?' -> Explains APP fraud concept in simple language.
    """
    active_report = {
        "detection_type": "qr",
        "identifier": "scammer123@demo",
        "risk_score": 82,
        "risk_level": "VERY HIGH RISK SIGNAL",
        "detected_categories": ["Refund Scam", "Urgency"],
        "signals": [
            {"name": "Refund pattern", "weight": 25, "explanation": "Payee note indicates accidental refund."},
            {"name": "New recipient", "weight": 10, "explanation": "You have never transacted with this VPA."},
            {"name": "Urgency", "weight": 15, "explanation": "Urgent transfer pressure detected."}
        ],
        "qr_data": {
            "pa": "scammer123@demo",
            "pn": "Emergency Help Desk",
            "am": "2000.00",
            "tn": "Emergency Fee"
        }
    }

    # Step 2: User: "Why is this risky?"
    r1 = client.post("/api/chat", json={
        "message": "Why is this risky?",
        "risk_context": active_report
    }).json()["reply"]
    assert "Refund pattern" in r1 or "refund" in r1.lower()
    assert "New recipient" in r1 or "recipient" in r1.lower()
    assert "Urgency" in r1 or "urgency" in r1.lower()
    assert "82" in r1

    # Step 3: User: "Should I pay?"
    r2 = client.post("/api/chat", json={
        "message": "Should I pay?",
        "risk_context": active_report
    }).json()["reply"]
    assert "do not proceed" in r2.lower() or "caution strongly advised" in r2.lower() or "pause" in r2.lower()
    assert "verify" in r2.lower()

    # Step 4: User: "What if I already paid?"
    r3 = client.post("/api/chat", json={
        "message": "What if I already paid?",
        "risk_context": active_report
    }).json()["reply"]
    assert "1930" in r3
    assert "cybercrime.gov.in" in r3
    assert "bank" in r3.lower()

    # Step 5: User: "How do I report this?"
    r4 = client.post("/api/chat", json={
        "message": "How do I report this?",
        "risk_context": active_report
    }).json()["reply"]
    assert "1930" in r4
    assert "https://cybercrime.gov.in" in r4

    # Step 6: User: "What is authorised push payment fraud?"
    r5 = client.post("/api/chat", json={
        "message": "What is authorised push payment fraud?",
        "risk_context": active_report
    }).json()["reply"]
    assert "manipulated" in r5.lower() or "authorising the payment themselves" in r5.lower() or "authorizing" in r5.lower()

    print("[PASS] TEST 13: Full multi-turn interaction sequence verified successfully!")


if __name__ == "__main__":
    print("\n=======================================================")
    print("=== RUNNING PAYSHIELD ASSISTANT ACCEPTANCE TESTS ===")
    print("=======================================================\n")
    test_chatbot_test_1_qr_context()
    test_chatbot_test_2_risk_score_not_probability()
    test_chatbot_test_3_risk_signals_vs_definitive_fraud()
    test_chatbot_test_4_reward_cashback_scam()
    test_chatbot_test_5_otp_protection()
    test_chatbot_test_6_money_already_lost()
    test_chatbot_test_7_app_fraud_explanation()
    test_chatbot_test_8_message_report_context()
    test_chatbot_test_9_no_complaints_not_100_percent_safe()
    test_chatbot_test_10_safe_negation_otp()
    test_chatbot_test_11_sensitive_data_guard()
    test_chatbot_test_12_out_of_scope()
    test_chatbot_test_13_multi_turn_demo_scenario()
    print("\n=======================================================")
    print(">>> ALL 13 CHATBOT ACCEPTANCE TESTS PASSED (100%)! <<<")
    print("=======================================================\n")
