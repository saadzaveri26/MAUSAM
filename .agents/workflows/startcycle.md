---
description: Standard cycle for building the Next.js + Tailwind + UX4G frontend against the already-existing FastAPI backend.
---

## Steps
1. Spec Agent runs `write_specs` for the requested page/feature, reading real backend router/schema files for the exact API contract.
2. If this is the very first cycle: Design System Agent runs `ux4g_token_translation` ONCE to set up `tailwind.config.ts` before any page is built.
3. If the feature touches the Admin Portal: Auth Agent runs `admin_auth` before any admin page/component is written.
4. Frontend Agent runs `generate_code`, using `dashboard_design_principles` for the Dashboard/Admin/Report pages, or `tasteskill_integration`'s design-taste-frontend for the Landing Page only.
5. Code Auditor Agent runs `audit_code` — API contract correctness, token usage, design-skill compliance, and output-skill completeness.

## Current State
- Backend: fully built and functional (FastAPI, SQLAlchemy/SQLite, ML pipeline — classifier, duplicate_detector, fake_detector, active-learning source-trust loop). `require_admin` dependency applied to verify/reject and source blacklist toggle endpoints.
- Frontend: Complete Next.js (App Router, TypeScript) + Tailwind CSS rebuild active. All 6 startcycle passes implemented:
  1. UX4G Token Translation in `tailwind.config.ts`, `globals.css`, and `design_tokens.md`.
  2. Admin Auth Foundation in `middleware.ts`, `lib/auth.ts`, and `admin/login/page.tsx`.
  3. Citizen Report Form in `report/page.tsx` with GPS auto-capture and plain-language ML results.
  4. Analytics Dashboard in `dashboard/page.tsx` with map-dominant Leaflet layout and 20s polling.
  5. Admin Portal in `admin/page.tsx` with dense table-first queue and source credibility registry.
  6. Public Landing Page in `app/page.tsx` adhering to the restrained official design brief.

## Build Order
1. `ux4g_token_translation` — tailwind.config.ts setup (once, first, blocks everything else).
2. `admin_auth` — backend dependency + Next.js middleware (before any admin UI work).
3. Citizen Report Form — simplest, most time-sensitive as the live demo path.
4. Analytics Dashboard.
5. Admin Portal (built only after step 2 is confirmed working).
6. Landing Page (lowest priority, uses tasteskill's design-taste-frontend).

## Ground Rules
- Never invent a FastAPI endpoint's field names or shape — read the real router/schema files first, every time.
- Never import UX4G's CSS bundle — Token Translation only.
- design-taste-frontend (and its visual-style variants) never touches the Dashboard, Admin Portal, or Citizen Report Form.
- Admin gating is server-side, not client-hidden.
- "Real-time" language in the UI must match the actual polling mechanism.
- No placeholder/fabricated data anywhere in a surface marked as done (output-skill + pre-flight audit both check this).