from datetime import timedelta
import email
from uuid import uuid4
from typing import Optional

from app.models import user
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import BadRequestException, UnauthorizedException
from app.models.schemas import UserRegister, TokenResponse

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User

class AuthService:

    def register(self, data: UserRegister) -> dict:    
            db: Session = SessionLocal()

    # check if user already exists
            existing_user = db.query(User).filter(User.email == data.email).first()
            if existing_user:
                 db.close()
                 raise BadRequestException("Email already registered")

            user = User(
                email=data.email,
                hashed_password=hash_password(data.password),
                full_name=data.full_name
            )

            db.add(user)
            db.commit()
            db.refresh(user)
            db.close()

            return {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "created_at": user.created_at
            }

    def login(self, email: str, password: str) -> TokenResponse:
         db: Session = SessionLocal()

         user = db.query(User).filter(User.email == email).first()

         if not user or not verify_password(password, user.hashed_password):
             db.close()
             raise UnauthorizedException("Invalid email or password")

         token = create_access_token(
             subject=str(user.id),
             expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
         )

         db.close()

         return TokenResponse(
             access_token=token,
             expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
         )

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        db: Session = SessionLocal()
        user = db.query(User).filter(User.id == int(user_id)).first()
        db.close()
        if not user:
            return None
        
        return {
            "id": user.id,
            "email": user.email
        }
        
auth_service = AuthService()