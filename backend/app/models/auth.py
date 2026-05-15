from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    organization_name: str

class LoginData(UserBase):
    password: str

class User(UserBase):
    id: int
    organization_name: str
    is_active: bool = True

    class Config:
        from_attributes = True
        json_encoders = {
            int: str  # Convert int to string for JSON response
        }
