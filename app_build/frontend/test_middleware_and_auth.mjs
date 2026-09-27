import { proxy as middleware } from './src/proxy.ts';
import { NextRequest } from 'next/server';
import { POST } from './src/app/api/admin/verify/route.ts';

async function runTests() {
  console.log("========================================");
  console.log("Testing Next.js Admin Auth & Middleware");
  console.log("========================================");

  // 1. Unauthenticated request to /admin
  console.log("\n[TEST 1] GET /admin without session cookie...");
  const reqUnauth = new NextRequest('http://localhost:3000/admin');
  const resUnauth = middleware(reqUnauth);
  console.log("Response status:", resUnauth.status);
  console.log("Redirect location:", resUnauth.headers.get('location'));
  if (resUnauth.status === 307 && resUnauth.headers.get('location')?.includes('/admin/login?redirect=%2Fadmin')) {
    console.log("-> BLOCKED & REDIRECTED to /admin/login (Success)");
  } else {
    throw new Error(`Expected redirect to /admin/login, got status ${resUnauth.status}`);
  }

  // 2. Request with INVALID cookie
  console.log("\n[TEST 2] GET /admin with INVALID session cookie...");
  const reqInvalid = new NextRequest('http://localhost:3000/admin', {
    headers: { cookie: 'meghsetu_admin_session=wrong-token' }
  });
  const resInvalid = middleware(reqInvalid);
  console.log("Response status:", resInvalid.status);
  console.log("Redirect location:", resInvalid.headers.get('location'));
  if (resInvalid.status === 307 && resInvalid.headers.get('location')?.includes('/admin/login')) {
    console.log("-> BLOCKED & REDIRECTED to /admin/login (Success)");
  } else {
    throw new Error(`Expected redirect to /admin/login, got status ${resInvalid.status}`);
  }

  // 3. Request with VALID cookie
  console.log("\n[TEST 3] GET /admin with VALID session cookie...");
  const reqValid = new NextRequest('http://localhost:3000/admin', {
    headers: { cookie: 'meghsetu_admin_session=meghsetu-admin-secret-key-2026' }
  });
  const resValid = middleware(reqValid);
  console.log("Response status:", resValid.status);
  console.log("Redirect location:", resValid.headers.get('location') || 'None (allowed through)');
  if (resValid.status === 200 && !resValid.headers.get('location')) {
    console.log("-> ALLOWED to access /admin (Success)");
  } else {
    throw new Error(`Expected pass-through, got ${resValid.status}`);
  }

  // 4. Request to /admin/login while ALREADY authenticated
  console.log("\n[TEST 4] GET /admin/login with VALID session cookie...");
  const reqLoginAuth = new NextRequest('http://localhost:3000/admin/login', {
    headers: { cookie: 'meghsetu_admin_session=meghsetu-admin-secret-key-2026' }
  });
  const resLoginAuth = middleware(reqLoginAuth);
  console.log("Response status:", resLoginAuth.status);
  console.log("Redirect location:", resLoginAuth.headers.get('location'));
  if (resLoginAuth.status === 307 && resLoginAuth.headers.get('location')?.endsWith('/admin')) {
    console.log("-> REDIRECTED to /admin dashboard (Success)");
  } else {
    throw new Error(`Expected redirect to /admin, got ${resLoginAuth.status}`);
  }

  // 5. POST /api/admin/verify with INVALID token
  console.log("\n[TEST 5] POST /api/admin/verify with INVALID token...");
  const apiReqInvalid = new NextRequest('http://localhost:3000/api/admin/verify', {
    method: 'POST',
    body: JSON.stringify({ token: 'wrong-key' }),
    headers: { 'Content-Type': 'application/json' }
  });
  const apiResInvalid = await POST(apiReqInvalid);
  const apiInvalidJson = await apiResInvalid.json();
  console.log("Response status:", apiResInvalid.status, apiInvalidJson);
  if (apiResInvalid.status === 401 && apiInvalidJson.error === 'Invalid admin token') {
    console.log("-> REJECTED with 401 Unauthorized (Success)");
  } else {
    throw new Error(`Expected 401, got ${apiResInvalid.status}`);
  }

  // 6. POST /api/admin/verify with VALID token
  console.log("\n[TEST 6] POST /api/admin/verify with VALID token...");
  const apiReqValid = new NextRequest('http://localhost:3000/api/admin/verify', {
    method: 'POST',
    body: JSON.stringify({ token: 'meghsetu-admin-secret-key-2026' }),
    headers: { 'Content-Type': 'application/json' }
  });
  const apiResValid = await POST(apiReqValid);
  const apiValidJson = await apiResValid.json();
  const setCookieHeader = apiResValid.headers.get('set-cookie');
  console.log("Response status:", apiResValid.status, apiValidJson);
  console.log("Set-Cookie header:", setCookieHeader);
  if (apiResValid.status === 200 && apiValidJson.success && setCookieHeader?.includes('meghsetu_admin_session=')) {
    console.log("-> ACCEPTED with 200 OK & httpOnly session cookie set (Success)");
  } else {
    throw new Error(`Expected 200 with Set-Cookie, got ${apiResValid.status}`);
  }

  console.log("\nALL NEXT.JS AUTH & MIDDLEWARE TESTS PASSED!");
}

runTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
