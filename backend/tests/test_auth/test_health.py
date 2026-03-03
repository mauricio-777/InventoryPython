"""
Integration tests — Health Check endpoints.
These tests verify that the API is running and returns the expected structure.

Run with:
    cd backend
    python -m pytest tests/Auth/ -v
"""

import json


def test_root_health(client):
    """GET / should return 200 with status='ok'."""
    response = client.get("/")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "ok"
    assert "message" in data
    assert "version" in data


def test_api_health_endpoint(client):
    """GET /api/health should return 200 with service info."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "ok"
    assert data["service"] == "inventory-api"


def test_404_returns_json(client):
    """Unknown routes should return 404 with a JSON error envelope."""
    response = client.get("/api/this-route-does-not-exist")
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data["status"] == "error"
    assert data["code"] == 404
    assert "message" in data
