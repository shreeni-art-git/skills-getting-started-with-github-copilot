import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_and_unregister():
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Signup
    response = client.post(f"/activities/{activity}/signup", json={"email": email})
    assert response.status_code == 200 or response.status_code == 400  # 400 if already signed up
    # Unregister
    response = client.post(f"/activities/{activity}/unregister", json={"email": email})
    assert response.status_code == 200 or response.status_code == 404  # 404 if not found

def test_signup_invalid_activity():
    response = client.post("/activities/Nonexistent/signup", json={"email": "nobody@mergington.edu"})
    assert response.status_code == 404

def test_unregister_invalid_participant():
    response = client.post("/activities/Chess Club/unregister", json={"email": "notfound@mergington.edu"})
    assert response.status_code == 404
