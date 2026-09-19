"""
PayShield Chatbot Module
Provides report-aware conversational intelligence, scam safety knowledge, and incident response.
"""

from backend.chatbot.assistant import assistant, PayShieldAssistant
from backend.chatbot.intent_classifier import intent_classifier, IntentClassifier
from backend.chatbot.knowledge_base import (
    PAYSHIELD_BASICS,
    SCAM_KNOWLEDGE_BASE,
    CYBERCRIME_RESOURCES
)

__all__ = [
    "assistant",
    "PayShieldAssistant",
    "intent_classifier",
    "IntentClassifier",
    "PAYSHIELD_BASICS",
    "SCAM_KNOWLEDGE_BASE",
    "CYBERCRIME_RESOURCES"
]
