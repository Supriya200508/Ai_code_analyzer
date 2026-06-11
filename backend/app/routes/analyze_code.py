import logging

from fastapi import APIRouter, Depends, Query

from app.core.config import settings
from app.core.exceptions import AnalysisException
from app.models.analyze import AnalyzeCodeRequest, AnalyzeCodeResponse

from app.services.gemini_analysis_service import GeminiAnalysisService

log = logging.getLogger(__name__)
router = APIRouter()


# ── Provider factory ──────────────────────────────────────────────────────────

def get_analysis_service():
    """
    FastAPI dependency.  Returns the configured AI backend.
    Raises AnalysisException (→ 500 JSON) if the provider is misconfigured.
    """
    provider = getattr(settings, "AI_PROVIDER", "openai").lower()

    if provider == "anthropic":
        from app.services.code_analysis_service import CodeAnalysisService
        return CodeAnalysisService()

    # default: gemini
    from app.services.gemini_analysis_service import GeminiAnalysisService
    return GeminiAnalysisService()


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post(
    "/analyze-code",
    response_model=AnalyzeCodeResponse,
    summary="Analyze source code with AI",
    responses={
        200: {"description": "Successful analysis"},
        422: {"description": "Invalid request payload"},
        500: {"description": "AI provider error"},
    },
)
def analyze_code(
    body: AnalyzeCodeRequest,
    safe: bool = Query(
        default=False,
        description="If true, return a structured fallback on AI failure instead of a 500.",
    ),
    service=Depends(get_analysis_service),
) -> AnalyzeCodeResponse:
    """
    Submit source code for AI-powered review.

    Returns detected issues, suggested fixes, an optimized version,
    and a plain-English explanation.

    Set **safe=true** to receive a structured fallback response on AI
    failure rather than an HTTP 500 — useful for non-critical flows.
    """
    if safe and hasattr(service, "analyze_safe"):
        return service.analyze_safe(body)
    return service.analyze(body)