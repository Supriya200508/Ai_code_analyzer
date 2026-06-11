import json
import re

import httpx

from app.core.config import settings
from app.core.exceptions import AnalysisError
from app.models.analyze import AnalyzeCodeRequest, AnalyzeCodeResponse
from app.services.prompts import SYSTEM_PROMPT, build_user_message

_ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
_MODEL         = "claude-sonnet-4-20250514"
_MAX_TOKENS    = 2048
_TIMEOUT       = 60.0


def _extract_json(raw: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise AnalysisError(
            "Model returned malformed JSON.",
            detail={"raw_response": raw[:500], "error": str(exc)},
        ) from exc


class CodeAnalysisService:

    def __init__(self):
        if not settings.ANTHROPIC_API_KEY:
            raise AnalysisError("ANTHROPIC_API_KEY is not configured.")
        self._headers = {
            "x-api-key":         settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type":      "application/json",
        }

    def analyze(self, request: AnalyzeCodeRequest) -> AnalyzeCodeResponse:
        payload = {
            "model":      _MODEL,
            "max_tokens": _MAX_TOKENS,
            "system":     SYSTEM_PROMPT,
            "messages":   [{"role": "user", "content": build_user_message(request.code, request.language)}],
        }

        try:
            with httpx.Client(timeout=_TIMEOUT) as client:
                resp = client.post(_ANTHROPIC_URL, headers=self._headers, json=payload)
                resp.raise_for_status()
        except httpx.TimeoutException as exc:
            raise AnalysisError("Analysis request timed out.") from exc
        except httpx.HTTPStatusError as exc:
            raise AnalysisError(
                "Upstream API error.",
                detail={"status": exc.response.status_code, "body": exc.response.text[:300]},
            ) from exc
        except httpx.RequestError as exc:
            raise AnalysisError(f"Network error: {exc}") from exc

        raw_text = resp.json()["content"][0]["text"]
        data     = _extract_json(raw_text)

        try:
            return AnalyzeCodeResponse(**data)
        except Exception as exc:
            raise AnalysisError(
                "Model response did not match expected schema.",
                detail=str(exc),
            ) from exc