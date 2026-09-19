from fastapi import APIRouter, Depends, HTTPException
from backend.schemas import UserResponse, UserProfileUpdate
from backend.routes.auth import get_current_user
from backend.database import db

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.put("/onboarding", response_model=UserResponse)
def complete_onboarding(update: UserProfileUpdate, current_user: UserResponse = Depends(get_current_user)):
    updates = update.model_dump(exclude_unset=True)
    updates["is_onboarded"] = True
    
    updated_user = db.update_user(current_user.id, updates)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**updated_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(update: UserProfileUpdate, current_user: UserResponse = Depends(get_current_user)):
    updates = update.model_dump(exclude_unset=True)
    updated_user = db.update_user(current_user.id, updates)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**updated_user)
