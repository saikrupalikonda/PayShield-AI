"""
PayShield Intent Classifier
Accurately categorizes user queries across 26 distinct operational intents,
handles sensitive credential detection, and detects safe negations.
"""

import re
from typing import Tuple, Dict, Any, Optional

# Intents list
INTENTS = [
    "REPORT_EXPLANATION",
    "RISK_SCORE",
    "QR_ANALYSIS",
    "UPI_ANALYSIS",
    "MOBILE_ANALYSIS",
    "MESSAGE_ANALYSIS",
    "SCAM_IDENTIFICATION",
    "SCAM_PREVENTION",
    "PAYMENT_SAFETY",
    "OTP_SAFETY",
    "UPI_PIN_SAFETY",
    "REFUND_SCAM",
    "KYC_SCAM",
    "REWARD_SCAM",
    "CUSTOMER_SUPPORT_SCAM",
    "FAKE_BANK_SCAM",
    "INVESTMENT_SCAM",
    "DELIVERY_SCAM",
    "SOCIAL_ENGINEERING",
    "CYBERCRIME_REPORTING",
    "MONEY_ALREADY_LOST",
    "PAYSHIELD_FEATURE",
    "PAYSHIELD_PRIVACY",
    "PAYSHIELD_LIMITATIONS",
    "GENERAL_PAYMENT_SAFETY",
    "OUT_OF_SCOPE"
]


class IntentClassifier:
    """Classifies user queries for PayShield Assistant."""

    def __init__(self):
        # Sensitive data regex: OTPs (4-6 digits with context), UPI PINs, CVVs, card numbers
        self.sensitive_patterns = [
            r"\b(?:otp|code|pin)\s+(?:is|was|=)?\s*[:\-]?\s*(\d{4,6})\b",
            r"\bmy\s+otp\s+is\s+(\d{4,6})\b",
            r"\b(?:upi\s*pin|atm\s*pin)\s*(?:is|was|=)?\s*[:\-]?\s*(\d{4,6})\b",
            r"\bcvv\s*[:\-]?\s*(\d{3,4})\b",
            r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b"  # 16 digit card number
        ]

        # Safe negation patterns (e.g., "I never share my OTP", "I don't click links")
        self.negation_patterns = [
            r"\bi\s+(?:never|don'?t|do\s+not|would\s+never)\s+(?:share|give|disclose)\s+my\s+(?:otp|pin|password)\b",
            r"\bi\s+(?:never|don'?t|didn'?t)\s+(?:pay|transfer|send|authorize)\b",
            r"\bi\s+(?:did\s+not|didn'?t)\s+(?:click|open|fall)\b",
            r"\bi\s+know\s+not\s+to\s+share\b"
        ]

    def check_sensitive_data(self, text: str) -> bool:
        """Returns True if user inadvertently pasted an OTP, PIN, CVV, or card number."""
        lower = text.lower()
        for pat in self.sensitive_patterns:
            if re.search(pat, lower):
                return True
        return False

    def is_safe_negation(self, text: str) -> bool:
        """Returns True if the text is a safety affirmation rather than an active scam request."""
        lower = text.lower()
        for pat in self.negation_patterns:
            if re.search(pat, lower):
                return True
        return False

    def classify(self, text: str, context: Optional[Dict[str, Any]] = None) -> Tuple[str, float]:
        """
        Classifies query text into one of 26 intents.
        Returns (intent_name, confidence).
        """
        q = text.strip().lower()

        # 0. Check safe negation first (e.g. "I never share my OTP with anyone")
        if self.is_safe_negation(q):
            return "GENERAL_PAYMENT_SAFETY", 0.95

        # 1. Money already lost / emergency incident response
        if any(w in q for w in [
            "already paid", "already transferred", "transferred the money", "sent the money",
            "lost money", "scammed", "money was deducted", "i was cheated", "fraud happened",
            "money got deducted", "debited from my account"
        ]):
            # Confirm not negative (e.g. "what if I already paid" is still money already lost)
            return "MONEY_ALREADY_LOST", 0.95

        # 2. Cybercrime reporting & Helpline 1930
        if any(w in q for w in [
            "1930", "how do i report", "where to report", "report cyber", "cyber crime",
            "cybercrime", "national cyber", "cyber fraud portal", "report this", "file complaint"
        ]):
            return "CYBERCRIME_REPORTING", 0.92

        # 3. Specific questions about current PayShield report
        if any(w in q for w in [
            "why was this flagged", "why was it flagged", "why is this risky", "why flagged",
            "why was this transaction", "explain this report", "why this report",
            "why did payshield flag", "what is suspicious about this", "why is this message risky"
        ]):
            return "REPORT_EXPLANATION", 0.95

        # 4. Questions about risk score
        if any(w in q for w in [
            "what does my risk score mean", "what does the score mean", "what does 82 mean",
            "why is my score", "why is the risk score", "score mean", "risk score work",
            "how does the risk score work", "what does high risk mean", "what does moderate risk mean",
            "what does low risk mean"
        ]) or re.search(r"what\s+does\s+\d+\s+mean", q):
            return "RISK_SCORE", 0.94

        # 5. Questions about no complaints / 100% safe
        if any(w in q for w in [
            "no complaints found", "no complaint found", "no complaints mean", "am i 100% safe",
            "am i completely safe", "is it 100% safe", "is it definitely safe", "definitely safe",
            "definitely legitimate", "definitely a scam"
        ]):
            return "PAYSHIELD_LIMITATIONS", 0.93

        # 6. Should I pay / payment safety decisions
        if any(w in q for w in [
            "should i pay", "should i proceed", "can i pay", "can i transfer", "is it safe to pay",
            "what should i do before paying", "what should i do now", "shall i proceed"
        ]):
            return "PAYMENT_SAFETY", 0.93

        # 7. Authorised Push Payment (APP) Fraud / Social Engineering
        if "push payment" in q or "app fraud" in q or "authorised push" in q or "authorized push" in q:
            return "GENERAL_PAYMENT_SAFETY", 0.96

        if "social engineering" in q:
            return "SOCIAL_ENGINEERING", 0.95

        # 8. QR Analysis questions
        if any(w in q for w in [
            "qr code contain", "qr contain", "why is this qr", "what does this qr",
            "qr scanner work", "how does qr", "qr analysis", "decoded qr"
        ]):
            return "QR_ANALYSIS", 0.92

        # 9. Can I receive money by scanning QR / UPI PIN to receive
        if any(w in q for w in [
            "receive money by scanning", "receive money scanning qr", "scan qr to receive",
            "pin to receive", "upi pin to receive", "can someone steal money just by scanning"
        ]):
            return "UPI_PIN_SAFETY", 0.95

        # 10. OTP Safety
        if any(w in q for w in ["share my otp", "asking for my otp", "share otp", "give otp", "otp scam"]):
            return "OTP_SAFETY", 0.94

        # 11. UPI PIN Safety
        if any(w in q for w in ["share my upi pin", "share pin", "enter upi pin", "enter pin to receive"]):
            return "UPI_PIN_SAFETY", 0.94

        # 12. Refund Scams
        if any(w in q for w in [
            "accidentally sent me money", "sent me money by mistake", "refund message",
            "refund scam", "accidental transfer", "overpayment", "return the money", "refund desk"
        ]):
            return "REFUND_SCAM", 0.93

        # 13. Reward & Cashback Scams
        if any(w in q for w in [
            "cashback", "reward scam", "won a reward", "won a prize", "lottery",
            "lucky draw", "scratch card", "claim reward", "reward message"
        ]):
            return "REWARD_SCAM", 0.93

        # 14. KYC & Account Suspension
        if any(w in q for w in ["kyc", "pan expired", "account will be blocked", "account suspended", "kyc message"]):
            return "KYC_SCAM", 0.93

        # 15. Fake Customer Support & Remote Access
        if any(w in q for w in [
            "customer care", "customer support", "helpline", "anydesk", "teamviewer",
            "rustdesk", "support executive", "fake support"
        ]):
            return "CUSTOMER_SUPPORT_SCAM", 0.92

        # 16. Fake Bank / Authority Impersonation
        if any(w in q for w in [
            "from my bank", "calling from bank", "rbi officer", "police officer",
            "digital arrest", "electricity department", "cbi", "customs officer"
        ]):
            return "FAKE_BANK_SCAM", 0.92

        # 17. Investment & Part-time Job Scams
        if any(w in q for w in [
            "part time job", "work from home", "telegram task", "crypto investment",
            "rate hotels", "like youtube videos", "daily profit"
        ]):
            return "INVESTMENT_SCAM", 0.92

        # 18. Delivery & Customs Scams
        if any(w in q for w in ["parcel", "india post", "courier", "delivery fee", "address update", "customs fee"]):
            return "DELIVERY_SCAM", 0.92

        # 19. Questions about PayShield platform
        if any(w in q for w in ["what does payshield actually do", "what is payshield", "how does payshield work"]):
            return "PAYSHIELD_FEATURE", 0.94

        if any(w in q for w in ["access my bank", "connected to npci", "access my account", "see my balance"]):
            return "PAYSHIELD_PRIVACY", 0.94

        if any(w in q for w in [
            "synthetic data", "where does payshield get its data", "synthetic data mean",
            "actually know whether someone is a scammer"
        ]):
            return "PAYSHIELD_LIMITATIONS", 0.94

        # 20. General Scam Identification / Classification
        if any(w in q for w in ["is this a scam", "what type of scam", "is this scam", "what scam is this"]):
            return "SCAM_IDENTIFICATION", 0.90

        if any(w in q for w in ["how does message analysis work", "message analysis work", "sms analysis"]):
            return "MESSAGE_ANALYSIS", 0.91

        if any(w in q for w in ["how does upi analysis work", "is this upi id safe", "upi id safe"]):
            return "UPI_ANALYSIS", 0.91

        if any(w in q for w in ["how does mobile analysis work", "mobile number safe", "phone number safe"]):
            return "MOBILE_ANALYSIS", 0.91

        if any(w in q for w in ["how to stay safe", "prevent scam", "prevention", "protect myself"]):
            return "SCAM_PREVENTION", 0.90

        # 21. Context-dependent pronoun questions
        if context and any(w in q for w in ["why", "what should i do", "tell me more", "is it dangerous", "is this dangerous"]):
            if context.get("risk_score") is not None or context.get("identifier"):
                return "REPORT_EXPLANATION", 0.85

        # 22. Out-of-scope check (programming, math, weather, news, entertainment, general world knowledge)
        out_of_scope_cues = [
            "java", "python", "javascript", "c++", "write code", "program", "code for",
            "weather", "election", "president", "prime minister", "movie", "joke", "song",
            "poem", "translate to french", "who is", "what is the capital", "calculate 2+",
            "how to cook", "solve this equation"
        ]
        if any(cue in q for cue in out_of_scope_cues):
            return "OUT_OF_SCOPE", 0.98

        return "GENERAL_PAYMENT_SAFETY", 0.70


intent_classifier = IntentClassifier()
