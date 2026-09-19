import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from backend.schemas import SurveyCreateRequest, SurveyResponse
from backend.routes.risk import get_optional_user_id
from backend.database import db

router = APIRouter(prefix="/api/survey", tags=["Survey"])


@router.post("", response_model=SurveyResponse)
def submit_survey(req: SurveyCreateRequest, user_id: str = Depends(get_optional_user_id)):
    survey_id = f"srv_{uuid.uuid4().hex[:10]}"
    now = datetime.utcnow()
    record = {
        "id": survey_id,
        "user_id": user_id,
        "analysis_id": req.analysis_id,
        "was_legitimate": req.was_legitimate,
        "warning_helped": req.warning_helped,
        "felt_pressured": req.felt_pressured,
        "request_type": req.request_type,
        "feedback": req.feedback,
        "submitted_at": now
    }
    db.save_survey(record)
    return SurveyResponse(
        id=survey_id,
        user_id=user_id,
        analysis_id=req.analysis_id,
        submitted_at=now,
        message="Thank you! Your feedback helps refine PayShield's scam-pattern detection models."
    )
