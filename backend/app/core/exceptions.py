from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, status_code: int, detail: str, error_code: str = None):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or f"ERR_{status_code}"


class NotFoundException(AppException):
    def __init__(self, resource: str):
        super().__init__(404, f"{resource} not found", "NOT_FOUND")


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(401, detail, "UNAUTHORIZED")


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Access forbidden"):
        super().__init__(403, detail, "FORBIDDEN")


class BadRequestException(AppException):
    def __init__(self, detail: str):
        super().__init__(400, detail, "BAD_REQUEST")


class AnalysisException(AppException):
    def __init__(self, detail: str):
        super().__init__(422, detail, "ANALYSIS_FAILED")


class AnalysisError(Exception):
    def __init__(self, message: str, detail: any = None):
        super().__init__(message)
        self.message = message
        self.detail = detail


# ── Handlers ──────────────────────────────────────────────────────────────────

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "detail": exc.detail,
            "path": str(request.url.path),
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "detail": "An unexpected error occurred.",
            "path": str(request.url.path),
        },
    )