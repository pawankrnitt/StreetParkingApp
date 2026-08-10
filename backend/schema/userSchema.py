from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    role: str

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserResponse
