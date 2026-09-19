"""
PayShield Hybrid Multi-Layer Risk Engine.
Evaluates synthetic intelligence reports, 10-category NLP message analysis,
QR specification anomalies, behavioural spending baselines, and transaction context.
Enforces Responsible AI standards across all risk outputs.
"""

import uuid
from typing import List, Optional
from datetime import datetime, timezone



from backend.schemas import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    RiskFactor,
    SyntheticReportInfo,
    StructuredUPIQR
)
from backend.services.message_analyzer import message_analyzer
from backend.services.qr_service import qr_service
from backend.database import db


class RiskEngine:
    def analyze(self, req: RiskAnalysisRequest) -> RiskAnalysisResponse:
        factors: List[RiskFactor] = []
        raw_score = 0
        analysis_id = f"anl_{uuid.uuid4().hex[:10]}"

        # Resolve clean identifier
        identifier_clean = (req.identifier or "").strip()

        # Check if identifier is a QR URI or contains upi://pay
        qr_data: Optional[StructuredUPIQR] = None
        if req.identifier_type.lower() == "qr" or "upi://pay" in identifier_clean:
            qr_data = qr_service.parse_upi_payload(identifier_clean)
            lookup_target = qr_data.pa or identifier_clean
        else:
            lookup_target = identifier_clean

        # 1. Look up Synthetic Intelligence Database
        synthetic_match = db.get_synthetic_report(lookup_target)
        report_info: Optional[SyntheticReportInfo] = None

        if synthetic_match:
            report_info = SyntheticReportInfo(**synthetic_match)
            count = report_info.report_count
            if count > 0:
                contrib = 35 if count > 20 else 25
                raw_score += contrib
                cat_str = ", ".join(report_info.categories) if report_info.categories else "Scam Activity"
                factors.append(RiskFactor(
                    factor="Synthetic Complaint History",
                    score_contribution=contrib,
                    explanation=f"PayShield found {count} synthetic reports associated with this identifier ({cat_str}).",
                    icon="alert-triangle"
                ))
            elif "verified" in lookup_target.lower() or "demo" in lookup_target.lower():
                factors.append(RiskFactor(
                    factor="No Known Complaints Found",
                    score_contribution=-10,
                    explanation="No complaints or scam reports were found for this identifier in the available PayShield dataset.",
                    icon="check-circle"
                ))
                raw_score -= 10
        else:
            # Responsible AI: Absence of reports != total safety
            factors.append(RiskFactor(
                factor="No Known Complaints in Available Dataset",
                score_contribution=0,
                explanation="No scam reports found in the available demonstration dataset. Absence of reports does not guarantee legitimacy.",
                icon="info"
            ))

        # 2. NLP Message Analysis (if message text provided)
        if req.message and req.message.strip():
            msg_res = message_analyzer.analyze(req.message)
            for sig in msg_res.detected_signals:
                if sig.score_contribution > 0:
                    raw_score += sig.score_contribution
                    factors.append(RiskFactor(
                        factor=sig.signal,
                        score_contribution=sig.score_contribution,
                        explanation=sig.explanation,
                        icon=sig.icon
                    ))

        # 3. QR Code Payload & Context Factors
        if qr_data:
            if not qr_data.is_valid_upi:
                raw_score += 20
                factors.append(RiskFactor(
                    factor="Malformed QR Specification",
                    score_contribution=20,
                    explanation="QR code payload does not adhere to standard NPCI/UPI URI schema.",
                    icon="x-circle"
                ))
            if qr_data.anomaly_flags:
                raw_score += 15
                factors.append(RiskFactor(
                    factor="Suspicious Payment Instruction in QR",
                    score_contribution=15,
                    explanation="; ".join(qr_data.anomaly_flags),
                    icon="alert-octagon"
                ))

            # Refund note in QR
            note = (qr_data.tn or "").lower()
            if any(w in note for w in ["refund", "reversal", "return", "mistake", "excess"]):
                raw_score += 20
                factors.append(RiskFactor(
                    factor="Refund Transaction Note in QR",
                    score_contribution=20,
                    explanation=f"QR payload specifies refund transaction note ('{qr_data.tn}'). Legitimate refunds never require scanning a QR to authorize a payment.",
                    icon="rotate-ccw"
                ))

        # 4. Behavioural & Transaction Factors
        # New Recipient
        if req.is_new_recipient:
            raw_score += 10
            factors.append(RiskFactor(
                factor="Unknown / New Recipient",
                score_contribution=10,
                explanation="You have not previously sent money to this recipient identifier.",
                icon="user-x"
            ))
        else:
            raw_score -= 5
            factors.append(RiskFactor(
                factor="Established Payee History",
                score_contribution=-5,
                explanation="Recipient is an established contact with regular transaction history.",
                icon="user-check"
            ))

        # Urgent Context
        if req.claims_emergency or req.immediate_action_demanded:
            raw_score += 10
            factors.append(RiskFactor(
                factor="Urgent Transaction Context",
                score_contribution=10,
                explanation="Transaction involves time pressure, emergency claims, or immediate action demands.",
                icon="clock"
            ))

        # Amount Anomaly
        amt = req.amount or (float(qr_data.am) if qr_data and qr_data.am else 0.0)
        if amt >= 10000:
            raw_score += 15
            factors.append(RiskFactor(
                factor="Unusual High Transfer Amount",
                score_contribution=15,
                explanation=f"Transfer amount (₹{amt:,.2f}) is an unusual spike for digital peer transfers.",
                icon="alert-circle"
            ))
        elif amt >= 3000 and req.is_new_recipient:
            raw_score += 10
            factors.append(RiskFactor(
                factor="Moderate Amount to New Recipient",
                score_contribution=10,
                explanation=f"Transfer of ₹{amt:,.2f} to an unverified recipient.",
                icon="info"
            ))

        # Communication Channel Vector
        channel = (req.payment_channel or "Unknown").strip()
        if channel in ["SMS", "WhatsApp", "Phone call", "Social media"]:
            raw_score += 15
            factors.append(RiskFactor(
                factor="Unverified Communication Channel",
                score_contribution=15,
                explanation=f"Payment request originated via {channel}, a common vector for Authorised Push Payment scams.",
                icon="message-square"
            ))

        # Ensure that if synthetic reports exist, score is at least 65 (HIGH RISK SIGNAL)
        if report_info and report_info.report_count > 0:
            raw_score = max(raw_score, 65)

        # Cap score at 100
        final_score = max(0, min(100, raw_score))

        # Map to Risk Level
        if final_score <= 29:
            risk_level = "LOW RISK SIGNAL"
        elif final_score <= 59:
            risk_level = "MODERATE RISK SIGNAL"
        elif final_score <= 79:
            risk_level = "HIGH RISK SIGNAL"
        else:
            risk_level = "VERY HIGH RISK SIGNAL"

        cooling_off = final_score >= 60

        # Construct Plain Language Explanation
        plain_exp = self._build_plain_explanation(final_score, risk_level, factors, report_info, qr_data)

        # Build Actions
        actions = self._build_recommended_actions(final_score, factors)

        return RiskAnalysisResponse(
            analysis_id=analysis_id,
            identifier=lookup_target,
            identifier_type=req.identifier_type,
            risk_score=final_score,
            risk_level=risk_level,
            factors=factors,
            plain_explanation=plain_exp,
            recommended_actions=actions,
            cooling_off_required=cooling_off,
            cooling_off_seconds=5 if cooling_off else 0,
            synthetic_report_match=report_info,
            qr_data=qr_data,
            demo_scenario_name=req.demo_scenario,
            created_at=datetime.now(timezone.utc)
        )


    def _build_plain_explanation(
        self,
        score: int,
        level: str,
        factors: List[RiskFactor],
        report_info: Optional[SyntheticReportInfo],
        qr_data: Optional[StructuredUPIQR]
    ) -> str:
        if report_info and report_info.report_count > 0:
            cat_str = ", ".join(report_info.categories) if report_info.categories else "scam activity"
            return (
                f"⚠ HIGH RISK SIGNAL: PayShield found {report_info.report_count} synthetic demonstration reports "
                f"associated with this identifier ({cat_str}). Multiple risk factors indicate high potential for "
                f"an Authorised Push Payment scam. Verify the recipient independently through official channels."
            )

        if score <= 29:
            return (
                "No Known Complaints Found: No complaints or scam reports were found for this identifier in the available "
                "PayShield dataset. No known risk signals were found in our available data. "
                "Verify the recipient and payment details before proceeding. Absence of reports does not guarantee that a recipient is legitimate."
            )

        factor_names = [f.factor for f in factors if f.score_contribution > 0]
        reasons = ", ".join(factor_names[:3])

        if qr_data and any("Refund" in f.factor for f in factors):
            return (
                "PayShield detected a payment request disguised as a refund. Scanning a UPI QR code always authorizes "
                "a DEBIT from your account, never a credit. If someone claims they are returning your money, do not scan this code."
            )

        return (
            f"PayShield identified active scam-pattern risk signals ({reasons}). "
            "The request exhibits characteristics commonly seen in social-engineering payment fraud. "
            "Pause and verify the recipient independently before authorizing any transfer."
        )

    def _build_recommended_actions(self, score: int, factors: List[RiskFactor]) -> List[str]:
        actions = [
            "Verify the recipient independently through an official telephone number or trusted app.",
            "Remember: Receiving money NEVER requires scanning a QR code or typing your UPI PIN.",
            "Never share an OTP, UPI PIN, bank password, or CVV with anyone.",
            "Do not transfer money because someone is pressuring you with an urgent deadline or account threat."
        ]
        if score >= 60:
            actions.append("If money has already been lost, immediately call the 1930 National Cyber Helpline or file an official report at cybercrime.gov.in.")
        return actions


risk_engine = RiskEngine()
