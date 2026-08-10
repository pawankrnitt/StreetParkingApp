from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from schema.userSchema import UserSignupRequest, UserLoginRequest
from repo.userRepo import get_user_by_email, get_user_by_phone, create_user
from middleware.auth import verify_password, create_access_token

def register_citizen(db: Session, request: UserSignupRequest):
    if get_user_by_email(db, request.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_phone(db, request.phone):
        raise HTTPException(status_code=400, detail="Phone already registered")
    
    user = create_user(db, request, role="CITIZEN")
    return user

def login_user(db: Session, request: UserLoginRequest):
    user = get_user_by_email(db, request.email)
    if not user or not verify_password(request.password, user.passwordHash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "accessToken": access_token,
        "tokenType": "bearer",
        "user": user
    }
