# Skill: admin_auth

## Purpose
Gate the Admin Portal and its API calls. This project has one privileged role (admin), not multi-role RBAC — a full auth provider (Clerk, Firebase Auth, etc.) is disproportionate for a single shared-secret gate under a hard deadline. Use a shared admin token instead.

## Process
1. Backend (FastAPI, already built): add a header-checked dependency to every verify/reject/blacklist-toggle endpoint:
   ```python
   from fastapi import Header, HTTPException
   import os

   ADMIN_TOKEN = os.environ["ADMIN_TOKEN"]

   def require_admin(x_admin_token: str = Header(...)):
       if x_admin_token != ADMIN_TOKEN:
           raise HTTPException(status_code=403, detail="Invalid admin token")
   ```
2. Frontend (Next.js): `src/middleware.ts` protects the `/admin` route — redirect to a token-entry screen if no valid session flag is present.
3. On the token-entry screen, submit the token to a lightweight `/api/admin/verify` Next.js route that checks it against the same `ADMIN_TOKEN` (server-side only, never expose the raw token comparison to client code) and sets an httpOnly session cookie on success.
4. Every admin page/component checks for that session cookie server-side (in a Server Component or route handler) before rendering admin data — never gate purely client-side, since that can be bypassed by disabling JavaScript or calling the API directly.
5. Every admin API call from the frontend to the FastAPI backend includes the `X-Admin-Token` header, read server-side from the httpOnly cookie's associated session, never stored in client-accessible `localStorage`/`sessionStorage`.

## Rules
- No admin-mutating endpoint ships without the backend dependency applied.
- The admin gate is enforced server-side (middleware + server component checks), not just hidden in the client UI.
- `ADMIN_TOKEN` lives in environment variables on both frontend and backend, never hardcoded, never committed.
- This is proportionate for a hackathon deadline, not a claim of production-grade auth.
