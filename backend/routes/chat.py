import logging
from typing import Dict, Any, List
from fastapi import APIRouter
from backend.schemas import ChatMessageRequest, ChatMessageResponse
from backend.chatbot import assistant

logger = logging.getLogger("payshield.chat")
router = APIRouter(prefix="/api/chat", tags=["Chatbot"])


@router.post("", response_model=ChatMessageResponse)
def handle_chat(req: ChatMessageRequest):
    """
    Handles conversational interactions for PayShield Assistant.
    Enforces report context priority, sensitive data protection, and 26-intent routing.
    """
    reply, suggested = assistant.process_chat(
        message=req.message,
        risk_context=req.risk_context,
        history=req.history
    )

    return ChatMessageResponse(
        reply=reply,
        suggested_questions=suggested
    )
