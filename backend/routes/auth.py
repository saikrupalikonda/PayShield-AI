import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from jose import jwt, JWTError

from backend.config import settings
from backend.database import db
from backend.schemas import (
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    TokenResponse,
    UserResponse
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

DEMO_OTP = "123456"


def mask_phone(mobile: str) -> str:
    clean = mobile.replace("+91", "").replace(" ", "")
    if len(clean) >= 10:
        return f"+91 {clean[:2]}*** ***{clean[-2:]}"
    return mobile


def create_access_token(user_id: str, mobile: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    payload = {
        "sub": user_id,
        "mobile": mobile,
        "exp": expire
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(authorization: Optional[str] = Header(None)) -> UserResponse:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token payload invalid")
        user = db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return UserResponse(**user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Authentication token expired or malformed")


@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest):
    clean = req.mobile.strip()
    if len(clean.replace("+91", "").replace(" ", "")) < 10:
        raise HTTPException(status_code=400, detail="Please provide a valid 10-digit mobile number")

    return SendOTPResponse(
        success=True,
        message="Simulated OTP generated successfully for demonstration. Use the demo OTP provided below.",
        demo_otp=DEMO_OTP,
        mobile=clean
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOTPRequest):
    clean_mobile = req.mobile.strip().replace(" ", "").replace("-", "")
    
    # In demo mode, accept DEMO_OTP
    if req.otp.strip() != DEMO_OTP:
        raise HTTPException(status_code=400, detail=f"Invalid OTP. For demo evaluation, please use code: {DEMO_OTP}")

    user = db.get_user_by_mobile(clean_mobile)
    now = datetime.utcnow()
    
    if not user:
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        user = {
            "id": user_id,
            "mobile": clean_mobile,
            "masked_mobile": mask_phone(clean_mobile),
            "full_name": None,
            "age_group": None,
            "profession": None,
            "digital_banking_exp": None,
            "preferred_payment_method": "UPI",
            "typical_txn_range": "₹500 – ₹5,000",
            "is_onboarded": False,
            "created_at": now
        }
        db.save_user(user)

    token = create_access_token(user["id"], user["mobile"])
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user)
    )
