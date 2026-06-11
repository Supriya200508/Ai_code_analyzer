from enum import Enum
from typing import List
from pydantic import BaseModel, Field


class Language(str, Enum):
    python     = "python"
    javascript = "javascript"
    typescript = "typescript"
    java       = "java"
    cpp        = "cpp"
    go         = "go"
    rust       = "rust"
    other      = "other"


class Severity(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"


# ── Request ───────────────────────────────────────────────────────────────────

class AnalyzeCodeRequest(BaseModel):
    code: str     = Field(..., min_length=1, max_length=50_000, description="Source code to analyze")
    language: str = Field(..., min_length=1, max_length=50,     description="Programming language")


# ── Response ──────────────────────────────────────────────────────────────────

class Issue(BaseModel):
    type:        str      = Field(..., description="Category: bug, security, style, performance, etc.")
    description: str      = Field(..., description="What the issue is")
    severity:    Severity = Field(..., description="low | medium | high")


class Fix(BaseModel):
    issue:      str = Field(..., description="Reference to the issue being fixed")
    suggestion: str = Field(..., description="Concrete fix or improvement")


class AnalyzeCodeResponse(BaseModel):
    issues:         List[Issue] = Field(default_factory=list)
    fixes:          List[Fix]   = Field(default_factory=list)
    optimized_code: str         = Field(..., description="Rewritten / improved version of the code")
    explanation:    str         = Field(..., description="Plain-English summary of findings")