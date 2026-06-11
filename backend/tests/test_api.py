"""
Basic smoke tests — run with: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient

# Set required env vars before importing the app
import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")

from main import app  # noqa: E402

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_register_and_login():
    payload = {"email": "test@example.com", "password": "securepass1", "full_name": "Test User"}
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 201
    assert r.json()["email"] == payload["email"]

    r = client.post(
        "/api/v1/auth/login",
        data={"username": payload["email"], "password": payload["password"]},
    )
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_analyze_requires_auth():
    r = client.post("/api/v1/analyze/", json={"code": "print('hello')"})
    assert r.status_code == 401


def test_analyze_with_auth():
    # Register + login
    client.post(
        "/api/v1/auth/register",
        json={"email": "dev@example.com", "password": "securepass1", "full_name": "Dev"},
    )
    token = client.post(
        "/api/v1/auth/login",
        data={"username": "dev@example.com", "password": "securepass1"},
    ).json()["access_token"]

    r = client.post(
        "/api/v1/analyze/",
        json={"code": "password = 'hunter2'\n# TODO: fix this"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "score" in data
    assert isinstance(data["issues"], list)