import re
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional, List

from backend.schemas import (
    QRParseRequest,
    StructuredUPIQR,
    SyntheticReportInfo,
    QRDetectResponse,
    RiskAnalysisRequest,
    MessageAnalysisRequest,
    MessageAnalysisResponse,
    DemoMessageItem
)
from backend.services.qr_service import qr_service
from backend.services.risk_engine import risk_engine
from backend.services.message_analyzer import message_analyzer
from backend.seed.seed_data import DEMO_MESSAGES
from backend.database import db
from backend.routes.risk import get_optional_user_id

router = APIRouter(prefix="/api/detect", tags=["Detection"])


@router.get("/upi/{upi_id}")
def detect_upi(upi_id: str) -> Dict[str, Any]:
    clean_id = upi_id.strip()
    is_syntactically_valid = bool(re.match(r"^[\w\.\-]+@[\w\-]+$", clean_id))
    report = db.get_synthetic_report(clean_id)

    if report:
        return {
            "identifier": clean_id,
            "identifier_type": "upi",
            "is_syntactically_valid": is_syntactically_valid,
            "intelligence_found": True,
            "report_data": SyntheticReportInfo(**report).model_dump(),
            "notice": f"PayShield found {report.get('report_count', 0)} synthetic reports associated with this identifier in available dataset."
        }

    return {
        "identifier": clean_id,
        "identifier_type": "upi",
        "is_syntactically_valid": is_syntactically_valid,
        "intelligence_found": False,
        "report_data": {
            "identifier": clean_id,
            "identifier_type": "upi",
            "name": clean_id.split("@")[0] if "@" in clean_id else "Unverified Entity",
            "report_count": 0,
            "risk_level": "LOW RISK SIGNAL",
            "categories": [],
            "first_reported": None,
            "last_reported": None,
            "details": "No known complaints or scam reports were found for this identifier in the available PayShield dataset.",
            "is_synthetic": True
        },
        "notice": "No known complaints found in the available dataset. Verify the recipient before proceeding."
    }


@router.get("/mobile/{mobile}")
def detect_mobile(mobile: str) -> Dict[str, Any]:
    clean_mobile = mobile.strip().replace(" ", "").replace("-", "")
    is_valid_format = bool(re.match(r"^(\+91)?[6-9]\d{9}$", clean_mobile))

    report = db.get_synthetic_report(clean_mobile)
    if not report and not clean_mobile.startswith("+91"):
        report = db.get_synthetic_report(f"+91{clean_mobile}")

    if report:
        return {
            "identifier": clean_mobile,
            "identifier_type": "mobile",
            "is_valid_format": is_valid_format,
            "intelligence_found": True,
            "report_data": SyntheticReportInfo(**report).model_dump(),
            "notice": f"PayShield found {report.get('report_count', 0)} synthetic reports associated with this identifier."
        }

    return {
        "identifier": clean_mobile,
        "identifier_type": "mobile",
        "is_valid_format": is_valid_format,
        "intelligence_found": False,
        "report_data": {
            "identifier": clean_mobile,
            "identifier_type": "mobile",
            "name": "Unregistered Demo Contact",
            "report_count": 0,
            "risk_level": "LOW RISK SIGNAL",
            "categories": [],
            "first_reported": None,
            "last_reported": None,
            "details": "No synthetic complaint records found for this mobile number in the demo database.",
            "is_synthetic": True
        },
        "notice": "No known complaints found for this mobile number in available dataset. Verify independently."
    }


@router.post("/qr", response_model=Dict[str, Any])
def detect_qr(
    req: QRParseRequest,
    user_id: str = Depends(get_optional_user_id)
) -> Dict[str, Any]:
    # Determine raw payload
    raw = req.raw_data or req.raw_payload

    if not raw:
        # Construct raw if upi_id was supplied directly
        if req.upi_id:
            raw = f"upi://pay?pa={req.upi_id}"
            if req.payee_name:
                raw += f"&pn={req.payee_name}"
            if req.amount:
                raw += f"&am={req.amount}"
            if req.transaction_note:
                raw += f"&tn={req.transaction_note}"
        else:
            raw = ""

    # Parse QR payload
    qr_data = qr_service.parse_upi_payload(raw)

    # Override parsed values if explicitly provided
    if req.upi_id and not qr_data.pa:
        qr_data.pa = req.upi_id
    if req.payee_name and not qr_data.pn:
        qr_data.pn = req.payee_name
    if req.amount and (not qr_data.am or qr_data.am == "0"):
        qr_data.am = str(req.amount)
    if req.transaction_note and not qr_data.tn:
        qr_data.tn = req.transaction_note

    # Lookup synthetic intelligence
    target_identifier = qr_data.pa or req.upi_id or raw
    synthetic_report = db.get_synthetic_report(target_identifier)
    report_info = SyntheticReportInfo(**synthetic_report) if synthetic_report else None

    # Run multi-factor risk engine
    amt_val = float(qr_data.am) if qr_data.am else (req.amount or 0.0)
    raw_ident = raw if (raw and "upi://pay" in raw.lower()) else target_identifier
    risk_res = risk_engine.analyze(RiskAnalysisRequest(
        identifier=raw_ident,
        identifier_type="qr",
        amount=amt_val,
        recipient_name=qr_data.pn,
        is_new_recipient=True,
        payment_channel="QR Scan",
        claims_emergency=False,
        immediate_action_demanded=False
    ))

    # Persist in detection history
    detection_record = {
        "id": risk_res.analysis_id,
        "user_id": user_id,
        "timestamp": risk_res.created_at,
        "detection_type": "QR",
        "identifier": target_identifier,
        "amount": amt_val,
        "risk_score": risk_res.risk_score,
        "risk_level": risk_res.risk_level,
        "action_taken": "analyzed",
        "analysis_result": risk_res.model_dump()
    }
    db.save_detection(detection_record)

    is_known_complaint = bool(report_info and report_info.report_count > 0)
    recommendation = (
        "High risk signals detected. Do not authorize payment or enter UPI PIN."
        if is_known_complaint or risk_res.risk_score >= 60
        else "No known risk signals found in our available data. Verify recipient and payment details before proceeding."
    )

    response_payload = {
        "qr_data": qr_data.model_dump(),
        "synthetic_report": report_info.model_dump() if report_info else None,
        "risk_score": risk_res.risk_score,
        "risk_level": risk_res.risk_level,
        "signals": [f.model_dump() for f in risk_res.factors],
        "recommendation": recommendation,
        "plain_explanation": risk_res.plain_explanation,
        "cooling_off_required": risk_res.cooling_off_required,
        "is_known_complaint": is_known_complaint,
        "notice": "UPI QR decoded successfully. No PIN or bank authentication credentials are ever handled by PayShield.",
        "analysis_result": risk_res.model_dump()
    }

    return response_payload


@router.post("/message", response_model=MessageAnalysisResponse)
def detect_message(
    req: MessageAnalysisRequest,
    user_id: str = Depends(get_optional_user_id)
) -> MessageAnalysisResponse:
    analysis = message_analyzer.analyze(req.message)

    # Save to message_detections
    record = {
        "id": analysis.analysis_id,
        "user_id": user_id,
        "message_hash": analysis.message_hash,
        "message_preview": req.message[:120] + ("..." if len(req.message) > 120 else ""),
        "message_category": analysis.primary_category,
        "risk_score": analysis.risk_score,
        "risk_level": analysis.risk_level,
        "detected_signals": [s.signal for s in analysis.detected_signals],
        "timestamp": analysis.timestamp,
        "user_feedback": None,
        "analysis_result": analysis.model_dump()
    }
    db.save_message_detection(record)

    return analysis


@router.get("/demo/messages", response_model=List[DemoMessageItem])
def get_demo_messages() -> List[DemoMessageItem]:
    return [DemoMessageItem(**item) for item in DEMO_MESSAGES]
