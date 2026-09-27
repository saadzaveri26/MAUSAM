# MeghSetu — Agent Roster (Next.js + Tailwind + UX4G Frontend Rebuild)

## Context
Backend (FastAPI + SQLAlchemy/SQLite + scikit-learn ML pipeline: classifier, duplicate_detector, fake_detector) is already built and functional from the earlier vanilla-frontend prototype. This cycle rebuilds ONLY the frontend — replacing vanilla HTML/CSS/JS with Next.js (App Router, TypeScript) + Tailwind CSS, styled per the UX4G Design System 3.0 (Government of India) using the Token Translation approach. The Next.js project folder structure has been created; no pages/components exist yet.

Repo layout (frontend):
```
app_build/
  frontend/                    <- Next.js app root (NEW, replaces vanilla HTML)
    src/
      app/
        page.tsx                <- Landing page
        report/                 <- Citizen Report Form
        dashboard/               <- Analytics Dashboard
        admin/                   <- Admin Portal (token-gated)
      components/
        shared/
        dashboard/
        admin/
        report/
      lib/
        api.ts                  <- FastAPI backend client
    tailwind.config.ts           <- UX4G tokens translated here
    src/middleware.ts             <- admin route gating
backend/                        <- EXISTING, untouched by this cycle
ui_design/
  design_tokens.md
```

---

## 1. Spec Agent
Turns a frontend feature request into a precise spec before code is written. Must specify: which page, what data it reads/writes from the existing FastAPI backend (exact endpoint + field names, read from the real router/schema files, never assumed), and which design skill governs it. Uses `write_specs`.

## 2. Frontend Agent
Senior Next.js/TypeScript/Tailwind engineer. Builds all four pages against the existing FastAPI backend. Never invents API contracts — reads `backend/routers/*.py` and `backend/schemas.py` directly before writing a data-fetching call. Uses `generate_code`.

## 3. Design System Agent
Translates UX4G Design System 3.0 tokens (spacing, typography, elevation, corner radius) into `tailwind.config.ts` via the Token Translation approach — does NOT import UX4G's CSS bundle directly (avoids reset/specificity conflicts with Tailwind, per prior investigation). Keeps MeghSetu's own severity-based color system (not UX4G's default palette) layered on top of UX4G's structural tokens. Uses `ux4g_token_translation`.

## 4. Dashboard Design Agent
Governs visual direction for the Dashboard, Admin Portal, and Citizen Report Form specifically — these are operational tool surfaces, not marketing pages. Uses `dashboard_design_principles`.

## 5. Landing Page Design Agent
Governs the one marketing-style surface (Landing Page) using the tasteskill.dev `design-taste-frontend` skill, scoped only to this page. Uses `tasteskill_integration`.

## 6. Auth Agent
Implements the admin-only route/API gating (single shared token, not multi-role RBAC — this project has one privileged role, not four). Uses `admin_auth`.

## 7. Code Auditor Agent
Reviews completed work against its spec: correct API integration (matches real backend contract), UX4G token usage (no invented values), design-skill compliance per surface, and the `output-skill` completeness check (no placeholders, no skipped sections). Uses `audit_code`.

---

## Order of Operations
Spec Agent → Design System Agent (tailwind.config.ts UX4G tokens, done once, first) → Auth Agent (before Admin Portal work starts) → Frontend Agent (with the correct Design Agent per surface) → Code Auditor Agent. Follow `.agents/workflows/startcycle.md` for the full build sequence.
