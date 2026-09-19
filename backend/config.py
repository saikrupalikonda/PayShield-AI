import os
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseModel):
    APP_NAME: str = "PayShield AI"
    APP_VERSION: str = "1.0.0"
    TAGLINE: str = "Pause. Verify. Pay Safely."
    
    # Environment configs
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/payshield")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "payshield-hackathon-2026-secret-key-production-ready")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))
    
    NEWS_API_KEY: Optional[str] = os.getenv("NEWS_API_KEY", None)
    AI_API_KEY: Optional[str] = os.getenv("AI_API_KEY", None)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Risk thresholds
    LOW_THRESHOLD: float = 29.0
    MODERATE_THRESHOLD: float = 59.0
    HIGH_THRESHOLD: float = 79.0


settings = Settings()
