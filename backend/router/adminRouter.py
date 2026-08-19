from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from config.database import get_db
from schema.userSchema import UserLoginRequest, LoginResponse
from schema.bookingSchema import BookingResponse
from controller.userController import login_user
from repo.userRepo import get_user_by_email
from repo.bookingRepo import get_all_active_bookings
from middleware.auth import require_admin
from model.userModel import User

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

class PromoteRequest(BaseModel):
    email: str

@router.post("/login", response_model=LoginResponse)
def admin_login(request: UserLoginRequest, db: Session = Depends(get_db)):
    # First check if user exists and is admin
    user = get_user_by_email(db, request.email)
    if not user or user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return login_user(db, request)

@router.get("/active-bookings", response_model=List[BookingResponse])
def get_active_bookings(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return get_all_active_bookings(db)

@router.post("/promote")
def promote_user(request: PromoteRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = "ADMIN"
    db.commit()
    return {"message": f"Successfully promoted {request.email} to ADMIN"}
