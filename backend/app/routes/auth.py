from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.services.auth_services import auth_service
from app.models.schemas import UserRegister, UserOut, TokenResponse

router = APIRouter(tags=["Auth"])

@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister):
    """Register a new user account."""
    return auth_service.register(data)

@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends()):
    """Authenticate and receive a JWT access token."""
    return auth_service.login(email=form.username, password=form.password)