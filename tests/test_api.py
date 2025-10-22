from fastapi.testclient import TestClient
import pytest

from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    # Should return a dict of activities
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_duplicate():
    activity = "Chess Club"
    email = "testuser@example.com"

    # Ensure email not present initially
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)

    # Sign up
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    j = resp.json()
    assert "Signed up" in j["message"]
    assert email in activities[activity]["participants"]

    # Duplicate signup should return 400
    resp2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp2.status_code == 400


def test_unregister_and_not_found():
    activity = "Chess Club"
    email = "testuser@example.com"

    # ensure present
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)

    # Unregister
    resp = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp.status_code == 200
    j = resp.json()
    assert "Unregistered" in j["message"]
    assert email not in activities[activity]["participants"]

    # Unregister non-existent should be 404
    resp2 = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp2.status_code == 404
 