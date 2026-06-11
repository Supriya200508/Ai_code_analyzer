from google import genai
from app.core.config import settings

class GeminiAnalysisService:

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

    def analyze(self, body):

        prompt = f"""
Analyze this {body.language} code.

Code:
{body.code}

Return:
1. Issues
2. Fixes
3. Optimized code
4. Explanation
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return {
            "issues": [],
            "fixes": [],
            "optimized_code": body.code,
            "explanation": response.text
        }