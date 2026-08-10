from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from schema.userSchema import UserLoginRequest, LoginResponse
from controller.userController import login_user
from repo.userRepo import get_user_by_email

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

@router.post("/login", response_model=LoginResponse)
def admin_login(request: UserLoginRequest, db: Session = Depends(get_db)):
    # First check if user exists and is admin
    user = get_user_by_email(db, request.email)
    if not user or user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return login_user(db, request)
