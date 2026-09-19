"""
PayShield Message Analyzer Service.
Coordinates the explainable 10-category NLP engine and supervised ML classifier.
"""

from typing import Optional, Dict, Any
from backend.schemas import MessageAnalysisResponse
from backend.engine.nlp_engine import nlp_engine
from backend.engine.ml_classifier import ml_classifier


class MessageAnalyzer:
    def analyze(self, text: str) -> MessageAnalysisResponse:
        message = (text or "").strip()
        if not message:
            return nlp_engine.analyze("")

        # 1. Run Supervised ML Classifier
        ml_res = ml_classifier.predict(message)

        # 2. Run Multi-Stage Explainable NLP Pattern & Context Engine
        response = nlp_engine.analyze(message, ml_prediction=ml_res)
        return response


message_analyzer = MessageAnalyzer()
