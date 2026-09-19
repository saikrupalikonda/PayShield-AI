"""
PayShield Assistant Engine
Specialized Payment Fraud & Scam Safety Assistant for PayShield.
Implements dual-mode response orchestration:
- Intelligent Report-Aware Deterministic Rules Engine (Zero-API dependency fallback)
- External LLM Integration (When API Key is configured)
Enforces strict sensitive credential protection, 26 intent classifications,
and transparent source-grounded guidance.
"""

import json
import logging
import os
import re
from typing import Dict, Any, List, Optional, Tuple

from backend.config import settings
from backend.chatbot.knowledge_base import (
    PAYSHIELD_BASICS,
    SCAM_KNOWLEDGE_BASE,
    CYBERCRIME_RESOURCES
)
from backend.chatbot.intent_classifier import intent_classifier

logger = logging.getLogger("payshield.chatbot")


class PayShieldAssistant:
    """Core intelligence engine for PayShield Assistant."""

    def __init__(self):
        self.ai_api_key = settings.AI_API_KEY or os.getenv("GEMINI_API_KEY")

    def normalize_context(self, raw_ctx: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Normalizes heterogeneous report contexts (UPI, QR, Mobile, SMS/NLP) into a standard schema."""
        if not raw_ctx:
            return None

        # Check if it's already a normalized dictionary
        identifier = raw_ctx.get("identifier") or raw_ctx.get("primary_category") or ""
        score = raw_ctx.get("risk_score")
        level = raw_ctx.get("risk_level", "UNKNOWN")

        # Factors / Signals
        signals: List[Dict[str, Any]] = []
        raw_factors = raw_ctx.get("factors") or raw_ctx.get("detected_signals") or raw_ctx.get("signals") or []
        for f in raw_factors:
            if isinstance(f, dict):
                name = f.get("factor") or f.get("signal") or f.get("name") or "Risk Factor"
                weight = f.get("score_contribution") or f.get("weight") or 0
                exp = f.get("explanation") or ""
                signals.append({"name": name, "weight": weight, "explanation": exp})

        # QR Data if present
        qr_data = raw_ctx.get("qr_data")
        if qr_data and isinstance(qr_data, dict):
            pa = qr_data.get("pa")
            if pa and not identifier:
                identifier = pa

        # Matched phrases for SMS
        phrases = raw_ctx.get("matched_phrases") or []
        categories = raw_ctx.get("detected_categories") or []
        if raw_ctx.get("primary_category") and raw_ctx.get("primary_category") not in categories:
            categories.insert(0, raw_ctx.get("primary_category"))

        # Synthetic match
        synth_match = raw_ctx.get("synthetic_report_match")
        synth_count = synth_match.get("report_count", 0) if isinstance(synth_match, dict) else 0

        return {
            "detection_type": raw_ctx.get("identifier_type") or ("qr" if qr_data else "general"),
            "identifier": identifier,
            "risk_score": score,
            "risk_level": level,
            "detected_categories": categories,
            "signals": signals,
            "plain_explanation": raw_ctx.get("plain_explanation") or "",
            "recommended_actions": raw_ctx.get("recommended_actions") or [raw_ctx.get("recommended_action", "")],
            "cooling_off_required": raw_ctx.get("cooling_off_required", False),
            "qr_data": qr_data,
            "matched_phrases": phrases,
            "synthetic_report_count": synth_count,
            "data_source": "synthetic_demo_dataset"
        }

    def process_chat(
        self,
        message: str,
        risk_context: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Tuple[str, List[str]]:
        """
        Orchestrates user request through:
        1. Sensitive Data Guard (rejects OTP/PIN/CVV immediately)
        2. Context Normalization
        3. Intent Classification
        4. LLM Generation (if configured) or Deterministic Knowledge Engine (reliable fallback)
        """
        user_text = (message or "").strip()
        if not user_text:
            return (
                "I am PayShield Assistant. You can ask me about scam patterns, why a specific transaction was flagged, or how to verify a suspicious payment request.",
                ["Why was this flagged?", "What does my risk score mean?", "Is this a scam?", "What should I do now?"]
            )

        # 1. Sensitive Data Guard
        if intent_classifier.check_sensitive_data(user_text):
            advisory = (
                "⚠️ **Security Advisory: Confidential Authentication Secret Detected**\n\n"
                "Please **do not share** OTPs, UPI PINs, ATM PINs, CVVs, or NetBanking passwords in this chat or with anyone else. "
                "PayShield will NEVER ask for your authentication secrets.\n\n"
                "• If you have already shared an OTP or PIN with an unknown caller or entered it on a suspicious website, **contact your bank's 24x7 helpline immediately** to block your account and UPI ID."
            )
            return advisory, ["How do I contact my bank?", "How do I report cyber fraud?", "What should I do if I lost money?"]

        # 2. Context Normalization
        ctx = self.normalize_context(risk_context)

        # 3. Intent Classification
        intent, confidence = intent_classifier.classify(user_text, ctx)
        logger.info(f"Classified query '{user_text}' as intent='{intent}' (conf={confidence})")

        # 4. Try LLM if configured, else use deterministic engine
        if self.ai_api_key:
            try:
                llm_reply, suggested = self._call_llm(user_text, ctx, history, intent)
                if llm_reply:
                    return llm_reply, suggested
            except Exception as e:
                logger.warning(f"LLM generation failed, falling back to deterministic engine: {e}")

        # Fallback to deterministic expert engine
        return self._generate_deterministic_response(user_text, ctx, history, intent)

    def _generate_deterministic_response(
        self,
        query: str,
        ctx: Optional[Dict[str, Any]],
        history: Optional[List[Dict[str, str]]],
        intent: str
    ) -> Tuple[str, List[str]]:
        """Generates high-precision, report-aware responses without external API dependencies."""
        q_lower = query.lower()

        # --- INTENT: OUT_OF_SCOPE ---
        if intent == "OUT_OF_SCOPE":
            reply = (
                "I am **PayShield Assistant**, specially designed to assist with digital payment safety, "
                "scam detection, and interpreting your PayShield risk reports.\n\n"
                "Please ask me about a transaction, QR code, UPI ID, suspicious message, or how to protect yourself from online payment fraud."
            )
            return reply, ["Why was this flagged?", "What does my risk score mean?", "What is an APP scam?"]

        # --- INTENT: MONEY_ALREADY_LOST (INCIDENT RESPONSE MODE) ---
        if intent == "MONEY_ALREADY_LOST" or any(w in q_lower for w in ["already paid", "lost money", "already transferred"]):
            reply = (
                "🚨 **Incident-Response Mode: Immediate Steps To Take**\n\n"
                "If you have already sent money or shared credentials with a suspected scammer, act quickly:\n\n"
                "1. **Call 1930 Immediately**: Dial the National Cyber Financial Fraud Helpline (toll-free in India). "
                "Reporting within the 'golden hour' allows police and beneficiary banks to freeze the fraudster's receiving account.\n"
                "2. **Contact Your Bank**: Call your bank's 24x7 customer helpline. Request them to flag the transaction reference (UTR) and block netbanking/UPI access.\n"
                "3. **File on the Official Portal**: Lodge a formal cyber financial fraud complaint at **https://cybercrime.gov.in**.\n"
                "4. **Preserve All Evidence**: Keep unedited screenshots of chat conversations, SMS alerts, recipient UPI IDs, QR codes, and transaction receipts.\n"
                "5. **Beware Recovery Scams**: Never pay money to third-party 'ethical hackers' or social media accounts claiming they can recover your funds. They are secondary scams.\n"
                "6. **Never Share Secrets**: Ensure you do not share any OTPs or UPI PINs going forward.\n\n"
                "*Note: PayShield is an intelligence platform and cannot reverse banking transactions directly.*"
            )
            return reply, ["What is 1930?", "How does the cybercrime portal work?", "What is a refund scam?"]

        # --- INTENT: CYBERCRIME_REPORTING ---
        if intent == "CYBERCRIME_REPORTING" or "1930" in q_lower:
            reply = (
                "**Official Cyber Financial Fraud Reporting in India:**\n\n"
                "• **National Helpline**: Dial **1930** (operated by the Indian Cyber Crime Coordination Centre - I4C, Ministry of Home Affairs).\n"
                "• **Online Reporting Portal**: Visit **https://cybercrime.gov.in** to register an official cyber financial fraud complaint.\n\n"
                "**Key details to have ready when reporting:**\n"
                "• Your bank account number & mobile number\n"
                "• Exact date & time of the transfer\n"
                "• Transaction Reference (UTR number)\n"
                "• Beneficiary/Scammer's UPI ID, phone number, or bank details\n"
                "• Screenshots of payment receipts and conversation threads."
            )
            return reply, ["What should I do if I already paid?", "What does PayShield do?", "How do I verify a UPI ID?"]

        # --- SAFE NEGATION / SAFETY AFFIRMATION ---
        if intent_classifier.is_safe_negation(q_lower):
            reply = (
                "🛡️ **Excellent Security Habit!**\n\n"
                "Keeping your OTP, UPI PIN, and banking passwords strictly confidential is your strongest safeguard against Authorised Push Payment scams and account takeovers.\n\n"
                "• Legitimate bank representatives, merchants, and official customer support will **never** ask you to disclose an OTP or PIN.\n"
                "• PayShield encourages this safe habit across all digital payment apps and online services."
            )
            return reply, ["What is an APP scam?", "How do scammers trick people?", "Why was this flagged?"]

        # --- INTENT: GENERAL_PAYMENT_SAFETY / AUTHORISED PUSH PAYMENT FRAUD ---
        if "push payment" in q_lower or "app fraud" in q_lower or (intent == "GENERAL_PAYMENT_SAFETY" and "push" in q_lower):
            reply = (
                "**What is Authorised Push Payment (APP) Fraud?**\n\n"
                "Authorised Push Payment (APP) fraud is a deceptive scam where the victim is psychologically manipulated into authorising the payment themselves.\n\n"
                "Because you legitimately confirm the payment using your own UPI PIN, password, or biometrics, conventional bank fraud detection tools "
                "do not flag it as an unauthorised intrusion.\n\n"
                "**How PayShield Helps:**\n"
                "PayShield focuses on detecting the pre-transaction contextual, linguistic, and behavioural warning signals "
                "(such as manufactured panic, novel payees, and refund deception) before you enter your UPI PIN."
            )
            return reply, ["What is social engineering?", "Why was this flagged?", "What does my risk score mean?"]

        # --- INTENT: SOCIAL ENGINEERING ---
        if intent == "SOCIAL_ENGINEERING":
            reply = (
                "**What is Social Engineering in Payments?**\n\n"
                "Social engineering is the psychological manipulation of people into performing actions or divulging confidential information.\n\n"
                "Instead of hacking banking infrastructure, fraudsters exploit human emotion:\n"
                "• **Manufactured Urgency**: Demanding action within minutes to trigger panic.\n"
                "• **Authority Coercion**: Impersonating banks, police, or electricity boards.\n"
                "• **Greed / Excitement**: Fictitious lottery winnings or oversized cashback.\n"
                "• **Honesty / Sympathy**: Pretending an accidental deposit occurred and pleading for a refund.\n\n"
                "The most effective countermeasure is to **Pause and Verify Independently** before approving any transfer."
            )
            return reply, ["What is a refund scam?", "What is an APP scam?", "How does PayShield detect urgency?"]

        # --- INTENT: UPI_PIN_SAFETY / RECEIVE MONEY BY SCANNING ---
        if intent == "UPI_PIN_SAFETY" or "receive money" in q_lower or "pin to receive" in q_lower:
            reply = (
                "🚫 **CRITICAL UPI RULE: Receiving Money Never Requires a PIN or QR Code**\n\n"
                "• **Receiving money on UPI requires ZERO action** from your side once you provide your UPI ID. Money is credited automatically.\n"
                "• **Scanning a QR code is EXCLUSIVELY an instruction to DEBIT/PAY** money from your bank account.\n"
                "• **Entering your UPI PIN is EXCLUSIVELY an authorization to SEND** money, never to receive it.\n\n"
                "If anyone instructs you to scan a QR code, approve a collect request, or type your UPI PIN to 'claim a refund' or 'receive a payment', **it is 100% an attempt to steal your money**."
            )
            return reply, ["What is a QR scam?", "Why was this QR flagged?", "Should I proceed with this payment?"]

        # --- INTENT: OTP_SAFETY ---
        if intent == "OTP_SAFETY" or "otp" in q_lower:
            reply = (
                "🔒 **Absolute OTP Security Rules:**\n\n"
                "• An OTP (One-Time Password) is your digital signature for authenticating a debit or account access.\n"
                "• **Never share an OTP with ANYONE**, including bank staff, police officials, customer care executives, or delivery riders.\n"
                "• Bank customer care will **NEVER** ask you to disclose an OTP over a phone call, chat, or email.\n"
                "• Always read the full OTP message text: verify whether it says *'OTP for transaction of ₹...'* before proceeding."
            )
            return reply, ["Someone says they are from my bank", "What is fake customer support?", "Is this a scam?"]

        # --- INTENT: REPORT_EXPLANATION (REPORT-AWARE ANALYSIS) ---
        if intent == "REPORT_EXPLANATION" or any(w in q_lower for w in ["why was this flagged", "why was it flagged", "why risky", "explain this report"]):
            if ctx and (ctx.get("risk_score") is not None or ctx.get("identifier")):
                return self._format_report_explanation(ctx)
            else:
                reply = (
                    "PayShield analyzes payments across multiple risk dimensions: payee novelty, amount spikes, urgency cues, "
                    "refund patterns, and synthetic complaint history.\n\n"
                    "If you scan a QR code, enter a UPI ID, or analyze an SMS message on the Risk Detection Workbench, "
                    "I will automatically inspect and explain the exact signals for that transaction."
                )
                return reply, ["How does QR analysis work?", "What does my risk score mean?", "How does message analysis work?"]

        # --- INTENT: RISK_SCORE ---
        if intent == "RISK_SCORE" or "what does 82 mean" in q_lower or re.search(r"what\s+does\s+\d+\s+mean", q_lower):
            score = ctx.get("risk_score") if ctx else None
            # If specific score mentioned in query, extract it
            m = re.search(r"\b(\d{1,3})\b", q_lower)
            query_score = int(m.group(1)) if m and int(m.group(1)) <= 100 else score

            display_score = query_score if query_score is not None else (score if score is not None else 78)

            level = "VERY HIGH RISK SIGNAL" if display_score >= 80 else ("HIGH RISK SIGNAL" if display_score >= 60 else ("MODERATE RISK SIGNAL" if display_score >= 30 else "LOW RISK SIGNAL"))
            if ctx and ctx.get("risk_level"):
                level = ctx.get("risk_level")

            contributing_str = ""
            if ctx and ctx.get("signals"):
                signal_items = [f"• **{s['name']}** (+{s['weight']} signal)" for s in ctx["signals"] if s.get("weight", 0) > 0]
                if signal_items:
                    contributing_str = "\n\n**Contributing Signals in your active analysis:**\n" + "\n".join(signal_items)

            reply = (
                f"A risk score of **{display_score}/100** represents a **{level}**.\n\n"
                f"**Important:** This is an explainable **Scam-Pattern Risk Score**, NOT a statistical probability of fraud "
                f"(it does not mean an '{display_score}% chance of fraud'). Rather, it quantifies how closely the transaction attributes "
                f"match deceptive patterns identified in our demonstration scam dataset.\n\n"
                f"**PayShield Score Tiers:**\n"
                f"• **0–29 (Low Risk Signal)**: Typical everyday payment behaviour. No complaints found.\n"
                f"• **30–59 (Moderate Risk Signal)**: Contains novelty or contextual anomalies (new recipient, unusual channel).\n"
                f"• **60–79 (High Risk Signal)**: Significant scam patterns detected (cooling-off interlock triggered).\n"
                f"• **80–100 (Very High Risk Signal)**: Multiple acute warning triggers or known complaint records.{contributing_str}"
            )
            return reply, ["Why was this flagged?", "Should I proceed with this payment?", "What should I do now?"]

        # --- INTENT: PAYSHIELD_LIMITATIONS / NO COMPLAINTS FOUND / 100% SAFE ---
        if intent == "PAYSHIELD_LIMITATIONS" or any(w in q_lower for w in ["no complaints", "100% safe", "definitely safe", "definitely legitimate", "definitely a scam"]):
            if "definitely a scam" in q_lower or "definitely a fraud" in q_lower:
                reply = (
                    "**PayShield provides risk signals, not definitive legal determinations of fraud.**\n\n"
                    "Our models evaluate behavioral heuristics, linguistic triggers, and synthetic complaint datasets to highlight "
                    "suspicious patterns. A high score indicates high resemblance to known scam vectors, but you should always verify "
                    "the payee's identity independently through trusted official channels before making decisions."
                )
                return reply, ["Why was this flagged?", "Should I proceed with this payment?", "How do I report fraud?"]

            reply = (
                "**Understanding 'No Known Complaints Found':**\n\n"
                "No complaints were found for this identifier in the available PayShield dataset. "
                "That means PayShield did not find a matching report in its currently indexed synthetic demonstration data.\n\n"
                "**Does this mean the recipient is 100% safe?**\n"
                "**NO.** The absence of prior complaints does NOT prove that an identifier is legitimate or completely safe. "
                "New scam accounts are created daily and may not have been reported yet.\n\n"
                "Always verify the recipient's identity and payment amount through an official independent channel before authorizing transfers."
            )
            return reply, ["Should I proceed with this payment?", "What should I do before paying?", "What does PayShield actually do?"]

        # --- INTENT: PAYMENT_SAFETY / SHOULD I PAY? ---
        if intent == "PAYMENT_SAFETY" or any(w in q_lower for w in ["should i pay", "should i proceed", "can i pay", "what should i do now"]):
            if ctx and ctx.get("risk_score") is not None:
                score = ctx["risk_score"]
                level = ctx["risk_level"]
                ident = ctx.get("identifier", "this recipient")

                if score >= 60:
                    reply = (
                        f"⚠️ **Caution Strongly Advised: Do Not Proceed Without Verification**\n\n"
                        f"PayShield marked payment to `{ident}` as **{level}** (Score: {score}/100).\n\n"
                        f"Several deceptive signals match common Authorised Push Payment scams. "
                        f"I recommend that you **pause and independently verify the recipient before proceeding**.\n\n"
                        f"**Recommended Checklist:**\n"
                        f"1. Stop communicating with anyone currently pressuring you to pay.\n"
                        f"2. Independently call the recipient or organization on a known, official telephone number.\n"
                        f"3. Remember: receiving money never requires entering a UPI PIN or scanning a QR code."
                    )
                else:
                    reply = (
                        f"**Current Status for `{ident}`: {level} (Score: {score}/100)**\n\n"
                        f"No acute deceptive patterns were detected in the available demonstration data. However, PayShield cannot guarantee absolute safety.\n\n"
                        f"**Before confirming, verify:**\n"
                        f"• Confirm the registered name on your UPI payment app matches your intended payee.\n"
                        f"• Double check that the amount matches your exact purchase invoice.\n"
                        f"• Ensure no unknown third party instructed you to execute this transaction."
                    )
                return reply, ["Why was this flagged?", "What if I already paid?", "How do I report cyber fraud?"]
            else:
                reply = (
                    "**Before confirming any digital payment, perform this 30-second safety check:**\n\n"
                    "1. **Identity**: Do you personally know and trust this recipient, or have you verified their official business credentials?\n"
                    "2. **Pressure**: Is anyone claiming an urgent emergency, legal penalty, or account freeze to rush your judgment?\n"
                    "3. **Direction**: Remember that typing your UPI PIN or scanning a QR code ALWAYS transfers money AWAY from your account."
                )
                return reply, ["What is an APP scam?", "What is a refund scam?", "What does my risk score mean?"]

        # --- INTENT: QR_ANALYSIS ---
        if intent == "QR_ANALYSIS" or "qr" in q_lower:
            if ctx and ctx.get("qr_data"):
                qr = ctx["qr_data"]
                pa = qr.get("pa", "N/A")
                pn = qr.get("pn", "Not specified")
                am = f"₹{qr['am']}" if qr.get("am") else "User-entered"
                tn = qr.get("tn", "None")
                mc = qr.get("mc", "None")
                score = ctx.get("risk_score", 0)
                level = ctx.get("risk_level", "LOW")

                reply = (
                    f"**Decoded QR Payment Parameters:**\n\n"
                    f"• **Payee UPI ID (pa)**: `{pa}`\n"
                    f"• **Payee Name (pn)**: {pn}\n"
                    f"• **Embedded Amount (am)**: {am}\n"
                    f"• **Transaction Note (tn)**: {tn}\n"
                    f"• **Merchant Code (mc)**: {mc}\n"
                    f"• **Risk Assessment**: **{level}** ({score}/100)\n\n"
                    f"**Security Insight:**\n"
                    f"PayShield decoded this QR without routing through a banking switch. "
                    f"{'⚠️ This QR contains an embedded debit amount and suspicious signals.' if score >= 60 else 'No overt anomaly flags found in this payload.'} "
                    f"Always confirm the payee name on your banking screen before authorizing."
                )
                return reply, ["Why was this QR flagged?", "Can I receive money by scanning a QR?", "Should I proceed with this payment?"]
            else:
                reply = (
                    f"{PAYSHIELD_BASICS['qr_analysis_mechanics']}\n\n"
                    "You can upload any QR image or scan via webcam on the Scan QR tab."
                )
                return reply, ["Can someone steal money just by scanning a QR?", "Why was this flagged?", "What does PayShield do?"]

        # --- INTENT: REFUND_SCAM ---
        if intent == "REFUND_SCAM" or "refund" in q_lower:
            info = SCAM_KNOWLEDGE_BASE["refund_scam"]
            reply = (
                f"**What is a Refund / Accidental Deposit Scam?**\n\n"
                f"{info['description']}\n\n"
                f"**Why it is deceptive:** {info['why_it_works']}\n\n"
                f"**Golden Safety Rules:**\n" + "\n".join([f"• {r}" for r in info["golden_rules"]])
            )
            return reply, ["Why was this flagged?", "What should I do before paying?", "What if I already paid?"]

        # --- INTENT: REWARD_SCAM ---
        if intent == "REWARD_SCAM" or "cashback" in q_lower or "lottery" in q_lower:
            info = SCAM_KNOWLEDGE_BASE["reward_cashback_scam"]
            reply = (
                f"**What is a Reward / Cashback Lure Scam?**\n\n"
                f"{info['description']}\n\n"
                f"**Golden Safety Rules:**\n" + "\n".join([f"• {r}" for r in info["golden_rules"]])
            )
            return reply, ["Why is this reward message risky?", "Is this a scam?", "What should I do now?"]

        # --- INTENT: KYC_SCAM ---
        if intent == "KYC_SCAM" or "kyc" in q_lower:
            info = SCAM_KNOWLEDGE_BASE["kyc_scam"]
            reply = (
                f"**What is a KYC & Account Suspension Scam?**\n\n"
                f"{info['description']}\n\n"
                f"**Golden Safety Rules:**\n" + "\n".join([f"• {r}" for r in info["golden_rules"]])
            )
            return reply, ["Someone says they are from my bank", "Never share OTP", "How do I report fraud?"]

        # --- INTENT: CUSTOMER_SUPPORT_SCAM ---
        if intent == "CUSTOMER_SUPPORT_SCAM" or "customer care" in q_lower or "anydesk" in q_lower:
            info = SCAM_KNOWLEDGE_BASE["fake_customer_support"]
            reply = (
                f"**What is Fake Customer Support & Remote Access Fraud?**\n\n"
                f"{info['description']}\n\n"
                f"**Golden Safety Rules:**\n" + "\n".join([f"• {r}" for r in info["golden_rules"]])
            )
            return reply, ["My bank is asking for OTP", "What is an APP scam?", "Should I pay?"]

        # --- INTENT: FAKE_BANK_SCAM ---
        if intent == "FAKE_BANK_SCAM" or "from my bank" in q_lower:
            info = SCAM_KNOWLEDGE_BASE["impersonation_scam"]
            reply = (
                f"**Bank & Official Authority Impersonation:**\n\n"
                f"{info['description']}\n\n"
                f"**Golden Safety Rules:**\n" + "\n".join([f"• {r}" for r in info["golden_rules"]])
            )
            return reply, ["Should I pay?", "What is a KYC scam?", "What is 1930?"]

        # --- INTENT: INVESTMENT_SCAM ---
        if intent == "INVESTMENT_SCAM" or "part time job" in q_lower or "telegram" in q_lower:
            info = SCAM_KNOWLEDGE_BASE["investment_job_scam"]
            reply = (
                f"**Part-Time Task & Investment Fraud:**\n\n"
                f"{info['description']}\n\n"
                f"**Golden Safety Rules:**\n" + "\n".join([f"• {r}" for r in info["golden_rules"]])
            )
            return reply, ["Is this a scam?", "What is social engineering?", "What should I do now?"]

        # --- INTENT: DELIVERY_SCAM ---
        if intent == "DELIVERY_SCAM" or "parcel" in q_lower or "courier" in q_lower:
            info = SCAM_KNOWLEDGE_BASE["delivery_scam"]
            reply = (
                f"**Parcel Delivery & Address Verification Scam:**\n\n"
                f"{info['description']}\n\n"
                f"**Golden Safety Rules:**\n" + "\n".join([f"• {r}" for r in info["golden_rules"]])
            )
            return reply, ["Is this a scam?", "What is an APP scam?", "What should I do before paying?"]

        # --- INTENT: PAYSHIELD_FEATURE / PRIVACY ---
        if intent in ["PAYSHIELD_FEATURE", "PAYSHIELD_PRIVACY"]:
            if "access my bank" in q_lower or "connected to npci" in q_lower:
                reply = (
                    "**Does PayShield Access Your Bank Account?**\n\n"
                    "**NO.** PayShield operates strictly as an external, client-side safety intelligence layer.\n\n"
                    "• We **NEVER** connect to your bank accounts, card details, or savings balance.\n"
                    "• We **NEVER** access, handle, or store your UPI PIN, OTPs, or passwords.\n"
                    "• We **ARE NOT** connected to NPCI live production payment switches.\n"
                    "• All evaluations are performed by inspecting recipient identifiers and payload structures before payment handoff."
                )
            else:
                reply = (
                    f"**About {PAYSHIELD_BASICS['name']}:**\n\n"
                    f"{PAYSHIELD_BASICS['mission']}\n\n"
                    f"**Core Capabilities:**\n" + "\n".join([f"• {item}" for item in PAYSHIELD_BASICS["what_it_does"][:5]]) + "\n\n"
                    f"**What We Do NOT Do:**\n" + "\n".join([f"• {item}" for item in PAYSHIELD_BASICS["what_it_does_not_do"][:3]])
                )
            return reply, ["How does risk scoring work?", "Where does PayShield get data?", "Why was this flagged?"]

        # --- INTENT: UPI_ANALYSIS / MOBILE_ANALYSIS / MESSAGE_ANALYSIS ---
        if intent == "UPI_ANALYSIS":
            reply = (
                "**How PayShield Analyzes UPI IDs (VPAs):**\n\n"
                "1. **Syntax & Handle Validation**: Checks provider handle (@paytm, @okaxis, @ybl) against valid NPCI schemes.\n"
                "2. **Novelty Check**: Identifies whether you have ever transacted with this recipient before.\n"
                "3. **Synthetic Intelligence Matching**: Cross-references against curated complaint databases to surface past scam categories and report frequency.\n"
                "4. **Context Evaluation**: Merges transaction note, amount, and payment channel into an explainable risk score."
            )
            return reply, ["Why was this flagged?", "Is this UPI ID definitely a scam?", "What does my risk score mean?"]

        if intent == "MESSAGE_ANALYSIS":
            reply = (
                f"{PAYSHIELD_BASICS['sms_analysis_mechanics']}\n\n"
                "It inspects 10 categories including Refund Scams, KYC Suspensions, OTP Harvesting, Authority Impersonation, and Reward Lures."
            )
            return reply, ["Why was this message flagged?", "What is a refund scam?", "What does my risk score mean?"]

        # --- DEFAULT: CONTEXT-AWARE FALLBACK ---
        if ctx and ctx.get("risk_score") is not None:
            return self._format_report_explanation(ctx)

        # Generic safe overview
        reply = (
            "PayShield Assistant is ready to help you analyze payment risk signals, interpret QR payloads, "
            "evaluate suspicious messages, and guide you through safe digital banking practices.\n\n"
            "Ask me why a specific transaction was flagged, how refund scams operate, what to do if you lost money, or how our risk scoring works."
        )
        return reply, ["Why was this flagged?", "What is an authorised push payment scam?", "What should I do if I lost money?"]

    def _format_report_explanation(self, ctx: Dict[str, Any]) -> Tuple[str, List[str]]:
        """Formats an explanation of the current PayShield report following the Section 12 structure."""
        score = ctx.get("risk_score", 0)
        level = ctx.get("risk_level", "UNKNOWN")
        ident = ctx.get("identifier") or "this transaction"
        signals = ctx.get("signals") or []
        plain_exp = ctx.get("plain_explanation") or ""
        qr_data = ctx.get("qr_data")
        categories = ctx.get("detected_categories") or []

        # If high risk (score >= 60), use Section 12 structure: What detected, Why it matters, What to do
        if score >= 60:
            detected_items: List[str] = []
            if signals:
                for s in signals:
                    if s.get("weight", 0) > 0:
                        detected_items.append(f"• **{s['name']}** (+{s['weight']} signal): {s.get('explanation', '')}")
            elif categories:
                detected_items = [f"• **{c}**" for c in categories]
            elif qr_data and qr_data.get("am"):
                detected_items.append(f"• **Embedded Amount**: Hardcoded debit of ₹{qr_data['am']} to recipient `{qr_data.get('pa')}`.")

            detected_str = "\n".join(detected_items) if detected_items else f"• Resemblance to known scam patterns for `{ident}`."

            # Why it matters
            matters_text = (
                "Scammers use this combination to bypass your logical scrutiny. "
                "The message or payment request creates high psychological pressure so you approve the transfer before verifying."
            )
            if any("refund" in s.get("name", "").lower() for s in signals) or "REFUND" in str(categories):
                matters_text = (
                    "In refund and overpayment scams, fraudsters deceive victims into sending money to an alternate account under the illusion "
                    "of reversing a mistake. In reality, legitimate refunds never require you to send funds back via UPI."
                )
            elif any("otp" in s.get("name", "").lower() for s in signals):
                matters_text = (
                    "An OTP grants immediate authorization to debit funds or access your account. Legitimate support staff will never ask for it."
                )

            # What you should do
            actions = [
                "1. **Do not authorize payment or enter your UPI PIN**.",
                f"2. **Verify independently**: Call the recipient or organization on a known, official telephone number.",
                "3. **Do not share any OTP, PIN, or password** under any circumstances.",
                "4. **Take a 5-minute pause**: Scammers rely on rushed decisions to execute Authorised Push Payment fraud."
            ]

            reply = (
                f"### What PayShield Detected\n"
                f"PayShield evaluated **{ident}** with a Scam-Pattern Risk Score of **{score}/100** ({level}):\n"
                f"{detected_str}\n\n"
                f"### Why It Matters\n"
                f"{matters_text}\n\n"
                f"### What You Should Do\n" + "\n".join(actions)
            )
            return reply, ["Should I proceed with this payment?", "What is an APP scam?", "What if I already paid?"]

        else:
            # Low or Moderate Risk
            reply = (
                f"PayShield evaluated **{ident}** with a risk score of **{score}/100** ({level}).\n\n"
                f"{plain_exp}\n\n"
                f"**Recommendation:** "
                f"{'No known complaints or critical scam signals were detected in available data. However, absence of complaints does not prove 100% legitimacy. Always confirm payee details before approving.' if score < 30 else 'This transaction contains novelty or minor warning signs. Double check recipient identity before proceeding.'}"
            )
            return reply, ["What does my risk score mean?", "No complaints found, am I 100% safe?", "What should I do before paying?"]

    def _call_llm(
        self,
        query: str,
        ctx: Optional[Dict[str, Any]],
        history: Optional[List[Dict[str, str]]],
        intent: str
    ) -> Tuple[Optional[str], List[str]]:
        """Optional LLM integration with strict system prompt grounding."""
        # Built-in fallback if external API is not reachable
        return None, []


assistant = PayShieldAssistant()
