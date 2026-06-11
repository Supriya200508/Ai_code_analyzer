from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.services.analyzer_service import analyzer_service
from app.models.schemas import CodeAnalysisRequest, CodeAnalysisResponse

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/", response_model=CodeAnalysisResponse)
def analyze_code(
    request: CodeAnalysisRequest,
    current_user: str = Depends(get_current_user),
):
    """
    Analyze a code snippet and return quality score, issues, and suggestions.
    Requires a valid JWT Bearer token.
    """
    return analyzer_service.analyze(request)