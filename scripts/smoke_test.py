#!/usr/bin/env python3
import sys
import argparse
import urllib.request
import urllib.error
import urllib.parse
import json

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def make_request(url, method="GET", headers=None, data=None, follow_redirects=True):
    headers = headers or {}
    req = urllib.request.Request(url, headers=headers, method=method)
    if data is not None:
        if isinstance(data, (dict, list)):
            req.data = json.dumps(data).encode("utf-8")
            if "Content-Type" not in headers:
                req.add_header("Content-Type", "application/json")
        elif isinstance(data, str):
            req.data = data.encode("utf-8")
        else:
            req.data = data

    opener = urllib.request.build_opener() if follow_redirects else urllib.request.build_opener(NoRedirectHandler)

    try:
        with opener.open(req, timeout=15) as res:
            body = res.read().decode("utf-8")
            resp_headers = dict(res.headers)
            try:
                parsed = json.loads(body)
            except Exception:
                parsed = body
            return res.status, parsed, resp_headers
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed, dict(e.headers)
    except Exception as e:
        return 0, str(e), {}

def run_tests(api_url: str, frontend_url: str = None, token: str = "test-admin-secret-key-32chars-ok!", allowed_origin: str = "http://localhost:3000"):
    api_url = api_url.rstrip("/")
    passed = 0
    failed = 0

    def check(desc: str, condition: bool, detail: str = ""):
        nonlocal passed, failed
        if condition:
            print(f"[PASS] {desc}")
            passed += 1
        else:
            print(f"[FAIL] {desc} - {detail}")
            failed += 1

    print(f"\n--- MeghSetu Automated Smoke Test ---")
    print(f"Target API: {api_url}")
    if frontend_url:
        print(f"Target Frontend: {frontend_url}")
    print("--------------------------------------\n")

    # 1. /health
    status, body, _ = make_request(f"{api_url}/health")
    check("GET /health returns HTTP 200 with status ok", status == 200 and isinstance(body, dict) and body.get("status") == "ok", f"Got status={status}, body={body}")

    # 2. Seeded data present
    status, body, _ = make_request(f"{api_url}/api/reports?limit=10")
    check("GET /api/reports returns seeded dataset", status == 200 and isinstance(body, dict) and body.get("total", 0) > 0, f"Got status={status}, total={body.get('total') if isinstance(body, dict) else 'N/A'}")

    # 3. Citizen report submission
    payload = {
        "text": "Automated smoke test severe thunderstorm observation #WeatherUpdate",
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.076,
        "longitude": 72.877,
        "reporter_handle": "smoke_tester",
    }
    status, body, _ = make_request(f"{api_url}/api/reports/citizen", method="POST", data=payload)
    report_id = body.get("id") if isinstance(body, dict) else None
    check("POST /api/reports/citizen succeeds and returns report ID", status == 200 and report_id is not None, f"Got status={status}, body={body}")

    # 4. Verify submitted report exists
    if report_id:
        status, body, _ = make_request(f"{api_url}/api/reports/{report_id}")
        check(f"GET /api/reports/{report_id} fetches newly submitted report", status == 200 and isinstance(body, dict) and body.get("id") == report_id, f"Got status={status}")

    # 5. CORS allowed origin
    status, _, headers = make_request(f"{api_url}/api/reports", method="OPTIONS", headers={
        "Origin": allowed_origin,
        "Access-Control-Request-Method": "GET",
    })
    acao = headers.get("access-control-allow-origin") or headers.get("Access-Control-Allow-Origin")
    check(f"CORS preflight from allowed origin ({allowed_origin}) receives header", acao == allowed_origin, f"Header value: {acao}")

    # 6. CORS disallowed origin
    status, _, headers = make_request(f"{api_url}/api/reports", method="OPTIONS", headers={
        "Origin": "https://evil.example",
        "Access-Control-Request-Method": "GET",
    })
    evil_acao = headers.get("access-control-allow-origin") or headers.get("Access-Control-Allow-Origin")
    check("CORS preflight from unauthorized origin (evil.example) is denied", evil_acao is None, f"Header value: {evil_acao}")

    # 7. Admin endpoint without token
    status, body, _ = make_request(f"{api_url}/api/ingest/simulate", method="POST", data={"count": 1})
    check("POST /api/ingest/simulate without X-Admin-Token returns 403", status == 403, f"Got status={status}")

    # 8. Admin endpoint with token
    status, body, _ = make_request(f"{api_url}/api/ingest/simulate", method="POST", headers={"X-Admin-Token": token}, data={"count": 1})
    check("POST /api/ingest/simulate with valid X-Admin-Token returns 200", status == 200 and isinstance(body, dict) and body.get("ingested") == 1, f"Got status={status}, body={body}")

    # 9. Admin sources endpoint protection
    status, _, _ = make_request(f"{api_url}/api/analytics/sources")
    check("GET /api/analytics/sources without token returns 403", status == 403, f"Got status={status}")

    status, body, _ = make_request(f"{api_url}/api/analytics/sources", headers={"X-Admin-Token": token})
    check("GET /api/analytics/sources with X-Admin-Token returns 200", status == 200 and isinstance(body, list), f"Got status={status}")

    # 10. Frontend URLs (if provided)
    if frontend_url:
        fe_base = frontend_url.rstrip("/")
        for route in ["/", "/dashboard", "/report", "/admin/login"]:
            status, _, _ = make_request(f"{fe_base}{route}")
            check(f"Frontend route {route} returns 200", status == 200, f"Got status={status}")

        status, _, headers = make_request(f"{fe_base}/admin", follow_redirects=False)
        loc = headers.get("location") or headers.get("Location")
        check("Frontend unauthenticated /admin route redirects to login", status in (307, 308) and "login" in str(loc), f"Got status={status}, location={loc}")

    print("\n--------------------------------------")
    print(f"Results: {passed} passed, {failed} failed")
    print("--------------------------------------\n")
    return failed == 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MeghSetu Smoke Test Suite")
    parser.add_argument("--api-url", default="http://127.0.0.1:8000", help="Base URL of FastAPI backend")
    parser.add_argument("--frontend-url", default=None, help="Base URL of Next.js frontend")
    parser.add_argument("--token", default="test-admin-secret-key-32chars-ok!", help="Admin secret token")
    parser.add_argument("--allowed-origin", default="http://localhost:3000", help="Configured allowed origin")
    args = parser.parse_args()

    success = run_tests(args.api_url, args.frontend_url, args.token, args.allowed_origin)
    sys.exit(0 if success else 1)
