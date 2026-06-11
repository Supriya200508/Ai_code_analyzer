"""
Tests for POST /api/v1/analyze-code
Run with: pytest tests/test_analyze_code.py -v
"""

import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

# ── Fixtures ──────────────────────────────────────────────────────────────────

MOCK_RESPONSE = {
    "issues": [
        {"type": "bug", "description": "Bare except clause swallows all exceptions.", "severity": "high"},
        {"type": "style", "description": "Variable name 'x' is not descriptive.", "severity": "low"},
    ],
    "fixes": [
        {"issue": "Bare except clause swallows all exceptions.", "suggestion": "Catch specific exceptions, e.g. `except ValueError as e`."},
        {"issue": "Variable name 'x' is not descriptive.", "suggestion": "Rename 'x' to something meaningful like 'user_input'."},
    ],
    "optimized_code": "def process(user_input: str) -> str:\n    try:\n        return user_input.strip()\n    except ValueError as e:\n        raise\n",
    "explanation": "The code has a broad exception handler and a vague variable name. Both are fixed in the optimized version.",
}

PYTHON_CODE = """
def process(x):
    try:
        return x.strip()
    except:
        pass
"""


def _mock_service(monkeypatch):
    from app.models.analyze import AnalyzeCodeResponse
    mock = MagicMock()
    mock.analyze.return_value = AnalyzeCodeResponse(**MOCK_RESPONSE)
    monkeypatch.setattr(
        "app.routes.analyze_code.get_analysis_service",
        lambda: mock,
    )
    return mock


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_analyze_code_valid(monkeypatch):
    _mock_service(monkeypatch)
    r = client.post("/api/v1/analyze-code", json={"code": PYTHON_CODE, "language": "python"})
    assert r.status_code == 200
    data = r.json()
    assert "issues" in data
    assert "fixes" in data
    assert "optimized_code" in data
    assert "explanation" in data


def test_analyze_code_issue_schema(monkeypatch):
    _mock_service(monkeypatch)
    r = client.post("/api/v1/analyze-code", json={"code": PYTHON_CODE, "language": "python"})
    issue = r.json()["issues"][0]
    assert {"type", "description", "severity"} <= issue.keys()
    assert issue["severity"] in ("low", "medium", "high")


def test_analyze_code_missing_fields():
    r = client.post("/api/v1/analyze-code", json={"code": PYTHON_CODE})  # missing language
    assert r.status_code == 422


def test_analyze_code_empty_code():
    r = client.post("/api/v1/analyze-code", json={"code": "", "language": "python"})
    assert r.status_code == 422


def test_analyze_code_code_too_long():
    r = client.post("/api/v1/analyze-code", json={"code": "x" * 50_001, "language": "python"})
    assert r.status_code == 422