from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# ── Auth models ────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=100)

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

# ── Analysis models ────────────────────────────────────────────────────────────

class CodeAnalysisRequest(BaseModel):
    code: str = Field(min_length=1, max_length=50_000, description="Source code to analyze")
    language: Optional[str] = Field(None, description="Programming language hint (e.g. python)")
    focus: Optional[str] = Field(
        None,
        description="Analysis focus: security | performance | style | bugs | all",
        pattern=r"^(security|performance|style|bugs|all)$",
    )

class IssueSeverity(str):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class CodeIssue(BaseModel):
    line: Optional[int] = None
    severity: str
    category: str
    message: str
    suggestion: Optional[str] = None

class CodeAnalysisResponse(BaseModel):
    analysis_id: str
    language_detected: Optional[str]
    summary: str
    score: int = Field(ge=0, le=100, description="Overall code quality score")
    issues: list[CodeIssue]
    suggestions: list[str]
    optimized_code:str = ""
    analyzed_at: datetime

# ── Generic responses ──────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime

class ErrorResponse(BaseModel):
    error: str
    detail: str
    path: str