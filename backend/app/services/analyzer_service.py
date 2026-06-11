import json
from tracemalloc import start
import uuid
from datetime import datetime
import time
from google import genai

from app.core.config import settings
from app.models.schemas import (
    CodeAnalysisRequest,
    CodeAnalysisResponse,
    CodeIssue,
)

class AnalyzerService:

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

    def analyze(self, request: CodeAnalysisRequest):

        prompt = f"""
Analyze the following code.

Language: {request.language}

Code:
{request.code}

Return ONLY valid JSON.

{{
  "summary": "string",
  "score": 0,
  "issues": [
    {{
      "line": 1,
      "severity": "low",
      "category": "security",
      "message": "string",
      "suggestion": "string"
    }}
  ],
  "suggestions": [
    "string"
  ],
  "optimized_code": "FULL CORRECTED CODE HERE"
}}
"""
        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
        )

        text = response.text.strip()
        print(response.text)

        if text.startswith("```"):
            text = (
                text.replace("```json", "")
                .replace("```", "")
                .strip()
            )

        try:
            data = json.loads(text)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Gemini returned invalid JSON:\n{text}"
            ) from e

        return CodeAnalysisResponse(
            analysis_id=str(uuid.uuid4()),
            language_detected=request.language,
            summary=data.get("summary", ""),
            score=int(data.get("score", 0)),
            issues=[
                CodeIssue(**issue)
                for issue in data.get("issues", [])
            ],
            suggestions=data.get("suggestions", []),
            optimized_code=data.get("optimized_code", ""),
            analyzed_at=datetime.utcnow(),
        )

analyzer_service = AnalyzerService()