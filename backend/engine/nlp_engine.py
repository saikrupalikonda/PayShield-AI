"""
PayShield Explainable NLP Payment Scam Classification Engine.
Detects 10 major digital payment scam categories, handles Indian-English phrasing,
contextual negation, phrase location offsets for frontend highlighting,
compound risk scoring, plain-language explanations, and actionable guidance.
"""

import re
import hashlib
import uuid
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone



from backend.schemas import (
    MessageAnalysisResponse,
    DetectedPhrase,
    DetectedSignalCard
)


class NLPEngine:
    # 1. Category Definitions and Patterns
    PATTERNS: Dict[str, List[str]] = {
        "REFUND_SCAM": [
            r"\brefund\b",
            r"\breturn\s+(?:the\s+)?(?:money|amount|funds|payment)\b",
            r"\bsend\s+it\s+back\b",
            r"\bsent\s+(?:it\s+)?by\s+mistake\b",
            r"\baccidentally\s+(?:sent|credited|transferred)\b",
            r"\bwrong\s+transfer\b",
            r"\bmoney\s+transferred\s+accidentally\b",
            r"\breverse\s+payment\b",
            r"\breturn\s+the\s+amount\b",
            r"\breturn\s+payment\b",
            r"\bmoney\s+received\s+by\s+mistake\b",
            r"\bexcess\s+cashback\b",
            r"\bextra\s+payment\b",
            r"\breversal\s+fee\b",
            r"\brefund\s+approval\b",
            r"\brefund\s+desk\b",
            r"\btransferred\s+salary\s+twice\b",
            r"\bcredited\s+.*?\bby\s+error\b",
            r"\btransferred\s+by\s+error\b",
            r"\bcompensation\s+settlement\b",
            r"\breceiver\s+barcode\b",
            r"\bscan\s+qr\s+.*?\s*deposit\b",
            r"\bdeposit\s+into\s+your\s+(?:savings\s+)?account\b"
        ],
        "URGENCY_SCAM": [
            r"\burgent(?:ly)?\b",
            r"\bimmediately\b",
            r"\bright\s+now\b",
            r"\basap\b",
            r"\bwithin\s+\d+\s*(?:minutes?|hours?|mins?)\b",
            r"\bin\s+\d+\s*(?:minutes?|hours?|mins?)\b",
            r"\bact\s+now\b",
            r"\bhurry\b",
            r"\bdon'?t\s+delay\b",
            r"\blast\s+chance\b",
            r"\bimmediate\s+action\b",
            r"\btoday\s+only\b",
            r"\bright\s+away\b",
            r"\binstant(?:ly)?\b",
            r"\bwithout\s+delay\b",
            r"\bnow\b",
            r"\bexpiring\b"
        ],
        "FAKE_AUTHORITY": [
            r"\brbi\b",
            r"\bnpci\b",
            r"\bbank\s+officer\b",
            r"\bbank\s+manager\b",
            r"\bverification\s+team\b",
            r"\bsupport\s+team\b",
            r"\baccount\s+department\b",
            r"\bcalling\s+from\s+(?:your\s+)?bank\b",
            r"\bfrom\s+(?:your\s+)?bank\b",
            r"\bofficial\s+desk\b",
            r"\bcyber\s+cell\b",
            r"\bpolice\b",
            r"\btax\s+authority\b",
            r"\btelecom\s+regulatory\b",
            r"\btrai\b",
            r"\bcentral\s+reserve\b",
            r"\belectricity\s+officer\b",
            r"\barmy\s+officer\b",
            r"\bwater\s+board\b"
        ],
        "KYC_SCAM": [
            r"\bkyc\b",
            r"\bverify\s+(?:your\s+)?account\b",
            r"\baccount\s+(?:will\s+be\s+)?blocked\b",
            r"\baccount\s+(?:will\s+be\s+)?suspended\b",
            r"\baccount\s+(?:will\s+be\s+)?closed\b",
            r"\bpan\s+(?:update|link|linking)\b",
            r"\baadhaar\s+(?:update|link|biometrics)\b",
            r"\bkyc\s+expired\b",
            r"\breactivate\s+(?:your\s+)?account\b",
            r"\bdeactivat(?:e|ed|ion)\b",
            r"\bfreeze\s+account\b",
            r"\baccount\s+closure\b",
            r"\bnetbanking\s+(?:has\s+been\s+)?suspended\b",
            r"\bcomplete\s+verification\b",
            r"\bdisconnected\b",
            r"\bdisconnection\b",
            r"\bcutoff\b",
            r"\bconfiscat\w*\b",
            r"\bblacklisted\b",
            r"\baccount\s+terminated\b",
            r"\bpayment\s+failed\b",
            r"\bverify\s+bank\s+credentials\b"
        ],
        "CREDENTIAL_SCAM": [
            r"\botp\b",
            r"\bupi\s+pin\b",
            r"\bcvv\b",
            r"\bpassword\b",
            r"\batm\s+pin\b",
            r"\bcard\s+details\b",
            r"\bverification\s+code\b",
            r"\blogin\s+credentials\b",
            r"\bone\s+time\s+password\b",
            r"\bshare\s+(?:the\s+)?otp\b",
            r"\bprovide\s+(?:the\s+)?otp\b",
            r"\btell\s+me\s+(?:the\s+)?otp\b",
            r"\benter\s+(?:your\s+)?(?:upi\s+)?pin\b",
            r"\btype\s+pin\b",
            r"\banydesk\b",
            r"\bteamviewer\b",
            r"\brustdesk\b",
            r"\bverify\s+bank\s+credentials\b"
        ],
        "PAYMENT_INSTRUCTION": [
            r"\bsend\s+money\b",
            r"\btransfer\b",
            r"\bpay\s+now\b",
            r"\bpayment\b",
            r"\bdeposit\b",
            r"\bverification\s+payment\b",
            r"\bverification\s+fee\b",
            r"\bprocessing\s+fee\b",
            r"\bactivation\s+fee\b",
            r"\bsend\s+to\s+this\s+upi\b",
            r"\bscan\s+qr\b",
            r"\bscan\s+this\s+qr\b",
            r"\bmake\s+a\s+payment\b",
            r"\btransfer\s+amount\b",
            r"\bdeposit\s+amount\b",
            r"\bkindly\s+send\b",
            r"\bplease\s+transfer\b",
            r"\bdo\s+one\s+payment\b",
            r"\bsettle\s+settlement\s+fee\b",
            r"\bpay\s+reversal\s+fee\b",
            r"\bpay\s+token\b",
            r"\bvia\s+qr\b",
            r"\bpay\s+\d+\b",
            r"\bpay\s+.*?\s*fee\b",
            r"\bpay\s+.*?\s*token\b",
            r"\bpay\s+.*?\s*penalty\b",
            r"\bpenalty\b",
            r"\bscan\s+(?:code|qr)\s+to\s+pay\b",
            r"\bapprove\s+(?:the\s+)?request\b",
            r"\bcollect\s+funds\b",
            r"\bauthorize\s+.*?deposit\b",
            r"\bautomatic\s+deposit\b",
            r"\bscan\s+qr\s+code\b",
            r"\bclear\s+pending\s+arrears\b",
            r"\bregistration\s+fee\b"
        ],
        "REWARD_SCAM": [
            r"\bcashback\b",
            r"\breward\b",
            r"\bwon\b",
            r"\bwinner\b",
            r"\blottery\b",
            r"\bscratch\s+card\b",
            r"\bunlock\s+(?:your\s+)?reward\b",
            r"\beligible\s+for\s+(?:a\s+)?(?:special\s+)?reward\b",
            r"\bclaim\s+(?:your\s+)?reward\b",
            r"\bpay\s+now\s+and\s+enjoy\s+rewards\b",
            r"\bpay\s+now\s+and\s+get\s+double\b",
            r"\bdouble\s+cashback\b",
            r"\bscan\s+(?:this\s+)?qr\s+to\s+receive\s+(?:your\s+)?reward\b",
            r"\bdiwali\s+scratch\s+card\b",
            r"\bkbc\b",
            r"\breward\s+points\b",
            r"\bbonus\b",
            r"\bvoucher\b",
            r"\bsubsidy\b",
            r"\bdirect\s+benefit\b",
            r"\bredeem\b",
            r"\brewards?\s+points?\b"
        ],
        "CUSTOMER_SUPPORT_SCAM": [
            r"\bcustomer\s+care\b",
            r"\bhelpline\b",
            r"\bsupport\s+desk\b",
            r"\bcontact\s+support\b",
            r"\bservice\s+executive\b",
            r"\btoll[- ]free\b",
            r"\bcalling\s+regarding\s+your\s+failed\b",
            r"\bcall\s+support\b",
            r"\bcontact\s+officer\b"
        ],
        "INVESTMENT_SCAM": [
            r"\binvestment\b",
            r"\bdaily\s+profit\b",
            r"\btask\b",
            r"\bpart[- ]time\b",
            r"\bwork\s+from\s+home\b",
            r"\byoutube\s+like\b",
            r"\bcrypto\b",
            r"\bdouble\s+your\s+money\b",
            r"\bguaranteed\s+return\b",
            r"\bvip\s+task\b",
            r"\bprepaid\s+task\b",
            r"\btrading\s+club\b",
            r"\bearn\s+₹?\d+\s+daily\b",
            r"\barbitrage\b",
            r"\bforex\b",
            r"\bchannel\s+fee\b",
            r"\bforex\s+signals\b"
        ],
        "DELIVERY_SCAM": [
            r"\bcourier\b",
            r"\bparcel\b",
            r"\bdelivery\s+boy\b",
            r"\bpackage\s+on\s+hold\b",
            r"\bcustoms\s+clearance\b",
            r"\bmissing\s+address\s+fee\b",
            r"\bundelivered\s+package\b",
            r"\baddress\s+re-confirmation\b",
            r"\bforeign\s+parcel\b"
        ]
    }

    # Signal Score Contributions
    SIGNAL_WEIGHTS = {
        "REFUND_SCAM": 25,
        "URGENCY_SCAM": 15,
        "FAKE_AUTHORITY": 20,
        "KYC_SCAM": 20,
        "CREDENTIAL_SCAM": 30,
        "PAYMENT_INSTRUCTION": 15,
        "REWARD_SCAM": 20,
        "CUSTOMER_SUPPORT_SCAM": 15,
        "INVESTMENT_SCAM": 25,
        "DELIVERY_SCAM": 20
    }

    CATEGORY_NAMES = {
        "REFUND_SCAM": "REFUND / MONEY-RETURN SCAM",
        "URGENCY_SCAM": "URGENCY / ACCOUNT THREAT",
        "FAKE_AUTHORITY": "FAKE BANK / AUTHORITY IMPERSONATION",
        "KYC_SCAM": "KYC / ACCOUNT VERIFICATION SCAM",
        "CREDENTIAL_SCAM": "OTP / CREDENTIAL REQUEST SCAM",
        "PAYMENT_INSTRUCTION": "PAYMENT INSTRUCTION SCAM",
        "REWARD_SCAM": "REWARD / CASHBACK SCAM",
        "CUSTOMER_SUPPORT_SCAM": "FAKE CUSTOMER SUPPORT SCAM",
        "INVESTMENT_SCAM": "INVESTMENT / PROFIT SCAM",
        "DELIVERY_SCAM": "DELIVERY / PARCEL SCAM"
    }

    # Safe / Negation Context Matchers
    NEGATION_PATTERNS = [
        r"\b(?:never|don't|do\s+not|wont|won't|should\s+not|shouldn't)\s+(?:share|give|send|disclose|tell)\s+(?:my\s+|any\s+|an\s+)?(?:otp|pin|upi\s+pin|password|cvv|credentials)\b",
        r"\bi\s+(?:never|don't|do\s+not)\s+share\s+my\s+otp\b",
        r"\b(?:never|don't|do\s+not)\s+send\s+money\s+to\s+unknown\b",
        r"\b(?:never|don't|do\s+not)\s+click\s+on\s+unknown\b"
    ]

    SAFE_INQUIRY_PATTERNS = [
        r"\bi\s+(?:called|contacted|visited|inquired|asked)\s+(?:my\s+)?(?:bank|customer\s+care|branch|support)\b",
        r"\bto\s+ask\s+about\s+(?:updating\s+)?(?:my\s+)?(?:kyc|account|passbook|card)\b",
        r"\bi\s+called\s+my\s+bank\s+customer\s+care\s+today\b",
        r"\bradiation\s+check\b",
        r"\bbalance\s+enquiry\b"
    ]

    def normalize_text(self, text: str) -> str:
        """Preprocesses message text while preserving casing for indexing."""
        return (text or "").strip()

    def check_safe_context(self, text: str) -> Tuple[bool, str]:
        """Checks for negation (e.g. 'I never share my OTP') and normal inquiries."""
        lower = text.lower()

        for pattern in self.NEGATION_PATTERNS:
            if re.search(pattern, lower):
                return True, "Message expresses a safe security rule or negation rather than a scam solicitation."

        for pattern in self.SAFE_INQUIRY_PATTERNS:
            if re.search(pattern, lower):
                return True, "User-initiated bank/customer care inquiry context without scam pressure or payment instructions."

        return False, ""

    def extract_phrases_and_categories(self, message: str) -> Tuple[List[DetectedPhrase], Dict[str, List[str]]]:
        """Extracts matched phrases with exact start/end character offsets for UI highlighting."""
        matched_phrases: List[DetectedPhrase] = []
        category_matches: Dict[str, List[str]] = {}

        for cat_key, patterns in self.PATTERNS.items():
            for pattern in patterns:
                for match in re.finditer(pattern, message, re.IGNORECASE):
                    matched_text = match.group(0)
                    start = match.start()
                    end = match.end()

                    # Avoid duplicate overlapping phrases for the same category
                    exists = any(
                        p.start_index == start and p.end_index == end and p.category == self.CATEGORY_NAMES[cat_key]
                        for p in matched_phrases
                    )
                    if not exists:
                        matched_phrases.append(DetectedPhrase(
                            phrase=matched_text,
                            category=self.CATEGORY_NAMES[cat_key],
                            score_contribution=self.SIGNAL_WEIGHTS.get(cat_key, 15),
                            start_index=start,
                            end_index=end
                        ))
                        category_matches.setdefault(cat_key, []).append(matched_text)

        return matched_phrases, category_matches

    def analyze(self, message: str, ml_prediction: Optional[Dict[str, Any]] = None) -> MessageAnalysisResponse:
        clean_msg = self.normalize_text(message)
        analysis_id = f"msg_{uuid.uuid4().hex[:10]}"
        msg_hash = hashlib.sha256(clean_msg.encode('utf-8')).hexdigest()[:16]

        if not clean_msg:
            return MessageAnalysisResponse(
                analysis_id=analysis_id,
                message="",
                message_hash="",
                risk_score=0,
                risk_level="LOW RISK SIGNAL",
                primary_category="GENUINE / SAFE CONTEXT",
                detected_categories=[],
                detected_signals=[],
                matched_phrases=[],
                plain_explanation="No message text provided for natural language analysis.",
                recommended_action="Paste an SMS or digital payment message to begin inspection."
            )

        # 1. Check Safe Context / Negation
        is_safe, safe_reason = self.check_safe_context(clean_msg)
        if is_safe:
            matched_phrases, _ = self.extract_phrases_and_categories(clean_msg)
            return MessageAnalysisResponse(
                analysis_id=analysis_id,
                message=clean_msg,
                message_hash=msg_hash,
                risk_score=10,
                risk_level="LOW RISK SIGNAL",
                primary_category="GENUINE / SAFE CONTEXT",
                detected_categories=["GENUINE / SAFE CONTEXT"],
                detected_signals=[
                    DetectedSignalCard(
                        signal="Safe Conversational / Negation Context",
                        score_contribution=10,
                        explanation=safe_reason,
                        category="Safe Context",
                        icon="check-circle"
                    )
                ],
                matched_phrases=matched_phrases,
                plain_explanation=(
                    "PayShield evaluated this message as low risk. The language describes normal inquiry, "
                    "or contains words like 'OTP' in a protective negation context ('I never share my OTP'). "
                    "No deceptive social-engineering pressure was detected."
                ),
                recommended_action="No suspicious pattern detected. Continue following good cyber safety practices.",
                urgency_detected=False,
                refund_detected=False,
                impersonation_detected=False
            )

        # 2. Extract Category Matches & Phrase Highlights
        matched_phrases, cat_matches = self.extract_phrases_and_categories(clean_msg)

        # 3. Calculate Risk Score with Compound Context
        raw_score = 0
        signals: List[DetectedSignalCard] = []
        detected_categories: List[str] = []

        # Accidental Refund
        if "REFUND_SCAM" in cat_matches:
            c = 25
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["REFUND_SCAM"])
            signals.append(DetectedSignalCard(
                signal="Refund / Accidental Deposit Claim",
                score_contribution=c,
                explanation="Message claims money was sent by mistake and instructs you to return or reverse funds.",
                category="Refund Scam",
                icon="rotate-ccw"
            ))

        # Urgency
        if "URGENCY_SCAM" in cat_matches:
            c = 15
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["URGENCY_SCAM"])
            signals.append(DetectedSignalCard(
                signal="Manufactured Urgency Pressure",
                score_contribution=c,
                explanation="Message uses countdown cues (e.g. 'immediately', 'within minutes') to rush your judgment.",
                category="Urgency",
                icon="clock"
            ))

        # Authority / Impersonation
        if "FAKE_AUTHORITY" in cat_matches:
            # Check if combined with threat or payment
            has_threat = "KYC_SCAM" in cat_matches or "URGENCY_SCAM" in cat_matches
            has_pay = "PAYMENT_INSTRUCTION" in cat_matches
            c = 25 if (has_threat or has_pay) else 10
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["FAKE_AUTHORITY"])
            signals.append(DetectedSignalCard(
                signal="Bank / Official Authority Mimicry",
                score_contribution=c,
                explanation="Sender invokes official entities (bank, RBI, police, electricity dept) to compel compliance.",
                category="Authority Impersonation",
                icon="shield-alert"
            ))

        # KYC / Account Threat
        if "KYC_SCAM" in cat_matches:
            c = 20
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["KYC_SCAM"])
            signals.append(DetectedSignalCard(
                signal="Account Suspension / KYC Threat",
                score_contribution=c,
                explanation="Language threatens account block, deactivation, or pan suspension unless verified.",
                category="Account Threat",
                icon="alert-octagon"
            ))

        # OTP / Credentials
        if "CREDENTIAL_SCAM" in cat_matches:
            c = 30
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["CREDENTIAL_SCAM"])
            signals.append(DetectedSignalCard(
                signal="Sensitive Credential Harvesting Trigger",
                score_contribution=c,
                explanation="Message solicits confidential authentication credentials (OTP, UPI PIN, CVV, or AnyDesk).",
                category="Credential Harvesting",
                icon="lock"
            ))

        # Payment Instruction
        if "PAYMENT_INSTRUCTION" in cat_matches:
            c = 15
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["PAYMENT_INSTRUCTION"])
            signals.append(DetectedSignalCard(
                signal="Payment / Fund Transfer Demand",
                score_contribution=c,
                explanation="Message contains explicit instructions to send money, scan a QR code, or pay token fees.",
                category="Payment Instruction",
                icon="credit-card"
            ))

        # Reward / Cashback
        if "REWARD_SCAM" in cat_matches:
            c = 25
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["REWARD_SCAM"])
            signals.append(DetectedSignalCard(
                signal="Reward / Cashback Lure",
                score_contribution=c,
                explanation="Promises unsolicited cash prizes, lotteries, or cashback unlocked by sending a fee.",
                category="Reward Scam",
                icon="gift"
            ))

        # Customer Support
        if "CUSTOMER_SUPPORT_SCAM" in cat_matches:
            c = 15
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["CUSTOMER_SUPPORT_SCAM"])
            signals.append(DetectedSignalCard(
                signal="Fake Customer Care Representation",
                score_contribution=c,
                explanation="Claiming to be customer care or helpline staff to initiate unauthorized transactions.",
                category="Fake Support",
                icon="headphones"
            ))

        # Investment / Tasks
        if "INVESTMENT_SCAM" in cat_matches:
            c = 25
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["INVESTMENT_SCAM"])
            signals.append(DetectedSignalCard(
                signal="Task / High-Yield Investment Scheme",
                score_contribution=c,
                explanation="Solicits prepaid deposit fees for part-time work from home or guaranteed trading profits.",
                category="Investment Scam",
                icon="trending-up"
            ))

        # Delivery / Parcel
        if "DELIVERY_SCAM" in cat_matches:
            c = 20
            raw_score += c
            detected_categories.append(self.CATEGORY_NAMES["DELIVERY_SCAM"])
            signals.append(DetectedSignalCard(
                signal="Courier / Package Clearance Levy",
                score_contribution=c,
                explanation="Claims parcel delivery is held and demands small address or customs fees.",
                category="Delivery Scam",
                icon="package"
            ))

        # Compound Amplifiers:
        # Authority + Account Threat + Payment -> Strongest APP Scam vector (+15)
        if ("FAKE_AUTHORITY" in cat_matches or "CUSTOMER_SUPPORT_SCAM" in cat_matches) and \
           ("KYC_SCAM" in cat_matches or "URGENCY_SCAM" in cat_matches) and \
           ("PAYMENT_INSTRUCTION" in cat_matches or "CREDENTIAL_SCAM" in cat_matches):
            raw_score += 15

        # Reward + Payment Instruction (+15)
        if "REWARD_SCAM" in cat_matches and ("PAYMENT_INSTRUCTION" in cat_matches or "URGENCY_SCAM" in cat_matches):
            raw_score += 15

        # Cap score at 100
        final_score = max(0, min(100, raw_score))

        # Determine Primary Category
        if not detected_categories:
            primary_category = "GENUINE / SAFE CONTEXT"
            final_score = min(final_score, 20)
        elif "CREDENTIAL_SCAM" in cat_matches:
            primary_category = self.CATEGORY_NAMES["CREDENTIAL_SCAM"]
        elif "REFUND_SCAM" in cat_matches:
            primary_category = self.CATEGORY_NAMES["REFUND_SCAM"]
        elif "REWARD_SCAM" in cat_matches:
            primary_category = self.CATEGORY_NAMES["REWARD_SCAM"]
        elif "KYC_SCAM" in cat_matches and ("FAKE_AUTHORITY" in cat_matches or "URGENCY_SCAM" in cat_matches):
            primary_category = "KYC / ACCOUNT THREAT SCAM"
        elif "FAKE_AUTHORITY" in cat_matches and "PAYMENT_INSTRUCTION" in cat_matches:
            primary_category = "FAKE AUTHORITY & PAYMENT EXTORTION"
        elif "INVESTMENT_SCAM" in cat_matches:
            primary_category = self.CATEGORY_NAMES["INVESTMENT_SCAM"]
        elif "DELIVERY_SCAM" in cat_matches:
            primary_category = self.CATEGORY_NAMES["DELIVERY_SCAM"]
        else:
            primary_category = detected_categories[0]

        # Risk Level
        if final_score <= 29:
            risk_level = "LOW RISK SIGNAL"
        elif final_score <= 59:
            risk_level = "MODERATE RISK SIGNAL"
        elif final_score <= 79:
            risk_level = "HIGH RISK SIGNAL"
        else:
            risk_level = "VERY HIGH RISK SIGNAL"

        # Flags
        urgency_detected = "URGENCY_SCAM" in cat_matches
        refund_detected = "REFUND_SCAM" in cat_matches
        impersonation_detected = "FAKE_AUTHORITY" in cat_matches or "CUSTOMER_SUPPORT_SCAM" in cat_matches

        # Plain Explanation
        plain_exp = self._build_plain_explanation(final_score, risk_level, primary_category, signals)

        # Actionable Recommendation
        rec_action = self._build_recommended_action(primary_category, final_score)

        return MessageAnalysisResponse(
            analysis_id=analysis_id,
            message=clean_msg,
            message_hash=msg_hash,
            risk_score=final_score,
            risk_level=risk_level,
            primary_category=primary_category,
            detected_categories=detected_categories,
            detected_signals=signals,
            matched_phrases=matched_phrases,
            plain_explanation=plain_exp,
            recommended_action=rec_action,
            urgency_detected=urgency_detected,
            refund_detected=refund_detected,
            impersonation_detected=impersonation_detected,
            ml_prediction=ml_prediction,
            timestamp=datetime.now(timezone.utc)
        )


    def _build_plain_explanation(
        self,
        score: int,
        level: str,
        category: str,
        signals: List[DetectedSignalCard]
    ) -> str:
        if score <= 29:
            return (
                "PayShield analyzed the message and did not find high-risk deception or coercive pressure cues. "
                "The wording is consistent with everyday communication. Always exercise ordinary caution when sharing details."
            )

        signal_names = [s.signal for s in signals[:3]]
        sig_str = ", ".join(signal_names)

        if "REFUND" in category:
            return (
                "PayShield detected language claiming an accidental payment or refund reversal. "
                "Scammers commonly invent accidental deposits and rush victims into transferring money back to a different UPI account. "
                "These signals do not legally prove fraud, but warrant independent verification through your official banking app."
            )
        elif "KYC" in category or "THREAT" in category:
            return (
                "PayShield detected language commonly associated with KYC and account-threat scams. "
                "The message creates urgency and asks you to make a payment or complete immediate verification. "
                "These signals do not prove that the message is fraudulent, but they are reasons to independently verify the request."
            )
        elif "CREDENTIAL" in category or "OTP" in category:
            return (
                "PayShield identified acute credential harvesting cues. Legitimate organizations, banks, and customer care "
                "agents will NEVER ask for your OTP, UPI PIN, CVV, or remote screen-sharing access."
            )
        elif "REWARD" in category or "CASHBACK" in category:
            return (
                "PayShield detected reward language combined with a payment instruction. "
                "Scammers use the lure of oversized cashback or prizes to induce victims to pay upfront 'clearance' or 'activation' fees. "
                "Legitimate rewards do not require an upfront payment."
            )
        else:
            return (
                f"PayShield identified multiple high-risk scam patterns ({sig_str}). "
                "The message exhibits characteristics of social-engineering fraud designed to bypass normal verification. "
                "Verify the sender independently before taking any action."
            )

    def _build_recommended_action(self, category: str, score: int) -> str:
        if "REFUND" in category:
            return "Do not send money simply because someone says they transferred money to you by mistake. Verify your real bank account balance independently."
        elif "KYC" in category:
            return "Do not use links or payment instructions from unsolicited messages. Contact your bank through its official app or website."
        elif "CREDENTIAL" in category or "OTP" in category:
            return "Never share an OTP, UPI PIN, CVV, or password with anyone. Bank executives will never request your secret verification codes."
        elif "REWARD" in category or "CASHBACK" in category:
            return "Do not pay a fee to receive a reward or cashback. Verify the offer through the official service provider's verified portal."
        elif "AUTHORITY" in category:
            return "Do not trust caller identity based only on a claim of being from a bank or authority. Verify through official published phone numbers."
        elif "INVESTMENT" in category:
            return "Do not transfer money to unlock earned profits or task rewards. Genuine companies never ask you to pay to receive earnings."
        elif "DELIVERY" in category:
            return "Do not pay unexpected address confirmation or delivery fees via external UPI links. Track packages directly on the official courier portal."
        else:
            return "Verify the recipient and payment context independently before proceeding with any digital transaction."


nlp_engine = NLPEngine()
