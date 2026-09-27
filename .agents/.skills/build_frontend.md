# Skill: build_frontend

## Purpose
Implement the four MeghSetu frontend surfaces against the real backend API, using dashboard_design_principles.md for visual direction and admin_auth.md for the admin portal's auth requirement.

## Process
1. Read the actual routers (`reports.py`, `analytics.py`, `ingest.py`) and `schemas.py` first to get exact field names and response shapes. Do not guess API contracts or invent field names that seem plausible.
2. Confirm `admin_auth.md` has been implemented and the admin token dependency is live before building the admin frontend against it.
3. Build in this order: Citizen Report Form (simplest, most time-sensitive as the live demo path) → Analytics Dashboard → Admin Portal → Landing Page (lowest priority, least functionally important).
4. Each page pulls from the shared `frontend/shared/` CSS token file — do not let any page's styling drift independently.
5. Vanilla HTML/CSS/ES6 JS, no build step, consistent with the existing architecture — do not introduce a framework or bundler at this stage of the timeline.

## Rules
- No admin-portal frontend work happens before the token auth from `admin_auth.md` is confirmed live and tested.
- Every API call's request/response shape must be verified against the actual backend code, not assumed.
- Run the `dashboard_design_principles.md` pre-flight audit on each surface before marking it done.
