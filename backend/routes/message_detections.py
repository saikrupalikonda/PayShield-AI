from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional

from backend.schemas import (
    MessageFeedbackRequest,
    MessageFeedbackResponse,
    MessageDetectionRecord
)
from backend.database import db
from backend.routes.risk import get_optional_user_id

router = APIRouter(prefix="/api/message-detections", tags=["Message Detections"])


@router.get("", response_model=List[Dict[str, Any]])
def get_user_message_detections(user_id: str = Depends(get_optional_user_id)):
    return db.get_message_detections_by_user(user_id)


@router.post("/feedback", response_model=MessageFeedbackResponse)
def submit_message_feedback(
    req: MessageFeedbackRequest,
    user_id: str = Depends(get_optional_user_id)
):
    feedback_payload = {
        "was_helpful": req.was_helpful,
        "received_message": req.received_message,
        "reported": req.reported
    }

    success = db.update_message_feedback(req.detection_id, feedback_payload)
    if not success:
        # If not found yet (e.g. freshly analyzed in guest mode), record still succeeds gracefully
        pass

    return MessageFeedbackResponse(
        success=True,
        message="Thank you! Your feedback helps strengthen PayShield's scam pattern detection models."
    )


@router.delete("/{detection_id}")
def delete_message_detection(
    detection_id: str,
    user_id: str = Depends(get_optional_user_id)
):
    deleted = db.delete_message_detection(detection_id, user_id)
    return {"success": deleted, "message": "Message detection record removed."}
