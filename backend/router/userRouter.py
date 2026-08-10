from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schema.userSchema import UserSignupRequest, UserLoginRequest, UserResponse, LoginResponse
from controller.userController import register_citizen, login_user
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/user", tags=["User"])

@router.post("/signup", response_model=UserResponse)
def signup(request: UserSignupRequest, db: Session = Depends(get_db)):
    return register_citizen(db, request)

@router.post("/login", response_model=LoginResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    return login_user(db, request)

@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user
