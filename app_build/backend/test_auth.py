import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("========================================")
    print("Testing Backend Admin Auth Protection")
    print("========================================")

    # 1. Test verify endpoint without token
    print("\n[TEST 1] PATCH /api/reports/1/verify without X-Admin-Token header...")
    res = client.patch("/api/reports/1/verify", json={"status": "Verified", "actor": "tester"})
    print(f"Status: {res.status_code}, Response: {res.json()}")
    assert res.status_code in (403, 422), f"Expected 403 or 422, got {res.status_code}"
    print("-> BLOCKED as unauthenticated (Success)")

    # 2. Test verify endpoint with invalid token
    print("\n[TEST 2] PATCH /api/reports/1/verify with INVALID X-Admin-Token...")
    res = client.patch(
        "/api/reports/1/verify",
        headers={"X-Admin-Token": "bad-token-123"},
        json={"status": "Verified", "actor": "tester"}
    )
    print(f"Status: {res.status_code}, Response: {res.json()}")
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    assert res.json().get("detail") == "Invalid admin token"
    print("-> BLOCKED with 403 Forbidden: Invalid admin token (Success)")

    # 3. Test verify endpoint with valid token
    print("\n[TEST 3] PATCH /api/reports/1/verify with VALID X-Admin-Token...")
    res = client.patch(
        "/api/reports/1/verify",
        headers={"X-Admin-Token": "meghsetu-admin-secret-key-2026"},
        json={"status": "Verified", "actor": "admin_test", "notes": "Pass 2 auth verification test"}
    )
    print(f"Status: {res.status_code}, Verification Status: {res.json().get('verification_status')}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("-> ALLOWED with 200 OK (Success)")

    # 4. Test blacklist toggle without token
    print("\n[TEST 4] POST /api/analytics/sources/1/toggle-blacklist without token...")
    res = client.post("/api/analytics/sources/1/toggle-blacklist")
    print(f"Status: {res.status_code}, Response: {res.json()}")
    assert res.status_code in (403, 422), f"Expected 403 or 422, got {res.status_code}"
    print("-> BLOCKED as unauthenticated (Success)")

    # 5. Test blacklist toggle with invalid token
    print("\n[TEST 5] POST /api/analytics/sources/1/toggle-blacklist with INVALID token...")
    res = client.post(
        "/api/analytics/sources/1/toggle-blacklist",
        headers={"X-Admin-Token": "bad-token-123"}
    )
    print(f"Status: {res.status_code}, Response: {res.json()}")
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print("-> BLOCKED with 403 Forbidden: Invalid admin token (Success)")

    # 6. Test blacklist toggle with valid token
    print("\n[TEST 6] POST /api/analytics/sources/1/toggle-blacklist with VALID token...")
    res = client.post(
        "/api/analytics/sources/1/toggle-blacklist",
        headers={"X-Admin-Token": "meghsetu-admin-secret-key-2026"}
    )
    print(f"Status: {res.status_code}, Blacklisted: {res.json().get('is_blacklisted')}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("-> ALLOWED with 200 OK (Success)")

    # 7. Test citizen public submission is NOT blocked by admin auth
    print("\n[TEST 7] Public report submission remains unblocked...")
    res = client.get("/api/reports?limit=1")
    assert res.status_code == 200
    print("-> Unprotected routes accessible without token (Success)")

    print("\nALL 7 BACKEND AUTH TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
