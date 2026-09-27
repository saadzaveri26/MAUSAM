# MeghSetu — National Weather Big Data Analytics Platform

**SIH 2026 · Problem Statement 26069 · National Weather Big Data Analytics Platform**
Category: Software · Theme: Disaster Management

A working prototype of a platform that ingests weather-related reports from
social media, citizen submissions, and public sources; runs them through an
ML pipeline for event classification, fake-report/credibility scoring, and
duplicate detection; and surfaces the result on a real-time analytics
dashboard and admin verification console.

---

## What's actually working right now

This is a functioning prototype, not a mockup — the backend, database, ML
scoring, and all three frontend pages are wired together and were tested
end-to-end while building this repo.

| Feature from the PS | Status | Notes |
|---|---|---|
| Multi-source ingestion (social media, APIs, citizen reports) | ✅ Working | Citizen reports via a real HTTP endpoint; social/API sources via a realistic **simulated** ingestion batch (see "Why simulated ingestion" below) |
| Metadata capture (date/time, city, state, GPS, media, category) | ✅ Working | Full schema in `models.py` |
| Centralized database | ✅ Working | SQLite for the prototype, schema designed to move to PostgreSQL/TimescaleDB unchanged |
| ML event categorization (rainfall, thunderstorm, flooding, heatwave, fog, dust storm, strong wind, +cyclone/hail/snow) | ✅ Working | Hybrid keyword-lexicon + TF-IDF/Naive Bayes classifier, `ml/classifier.py` |
| Fake/misleading report detection | ✅ Working | Explainable heuristic scorer over source trust + content signals, `ml/fake_detector.py` |
| Untrusted source verification | ✅ Working | Per-source trust score that updates from admin verify/reject decisions (`routers/reports.py`) |
| Duplicate removal | ✅ Working | TF-IDF cosine similarity gated by city + time window, `ml/duplicate_detector.py` |
| Web dashboard — date/event/location filters, real-time viz | ✅ Working | `app_build/frontend/dashboard/` — Chart.js + Leaflet, auto-refreshes every 20s |
| Admin panel — verification status tracking | ✅ Working | `app_build/frontend/admin/` — verify/reject queue, source credibility table, one-click demo ingestion trigger |
| Citizen reporting UI | ✅ Working | `app_build/frontend/citizen-report/` — captures GPS via browser geolocation, shows live ML classification result on submit |
| Public landing page | ✅ Working | `html_landing_page/` |
| Live Twitter/X, Facebook, IMD AWS API connectors | 🔶 Simulated | See note below — architecture is ready for live credentials |
| Deployment artifacts (Docker, nginx) | ✅ Included | `production_artifacts/deployment/` |

### Why simulated ingestion instead of live APIs?

Twitter/X's filtered stream, Meta's Graph API, and IMD's AWS station feeds
all require paid or allow-listed credentials that aren't obtainable for a
hackathon prototype. Instead, `app_build/backend/ingestion/simulators.py`
generates realistic, India-specific weather posts — including occasional
clickbait/noise — that flow through the **exact same** processing pipeline
a live connector would use. Every other component (classification,
credibility scoring, deduplication, storage, dashboard, admin workflow) is
running real code against real (synthetically-sourced) data, not mocked API
responses. Swapping in live credentials later is a small, isolated change —
see `production_artifacts/docs/DATA_FLOW.md`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend API | **FastAPI** (Python 3.11), Uvicorn |
| Database / ORM | **SQLAlchemy** over **SQLite** (prototype) — schema designed for a drop-in swap to PostgreSQL/TimescaleDB |
| ML / AI | **scikit-learn** (TF-IDF, Multinomial Naive Bayes, cosine similarity), hand-tuned lexicons for Indian weather vocabulary |
| Frontend | **Next.js** (App Router, TypeScript) + **Tailwind CSS** (UX4G 3.0 Token Translation) |
| Design System | **UX4G Design System 3.0** (Government of India, MIT License) — Token Hybrid |
| Data viz | **Chart.js** (analytics charts), **Leaflet.js** (live map, CARTO dark tiles) |
| Landing page | Next.js Landing Page / Static HTML fallback |
| Deployment | Docker, Docker Compose, Nginx (see `production_artifacts/deployment/`) |

---

## Attribution & Design System

This product uses components and design tokens from the **UX4G Design System 3.0**, developed by the Government of India, released under the [MIT License](https://ux4g.gov.in). Use of the UX4G Design System does not imply official endorsement, approval, or affiliation with the Government of India.

---

## Folder structure

```
.agents/                      Reserved for AI coding-agent config (not used by the app)
app_build/
  backend/                    FastAPI app
    main.py                   App entrypoint & router registration
    database.py                SQLAlchemy engine/session
    models.py                  ORM schema (WeatherReport, Source, AuditLog)
    schemas.py                  Pydantic request/response models
    pipeline.py                 Central ingest → ML → store pipeline
    seed_data.py                 One-command demo data seeder
    ml/
      classifier.py            Event categorization
      fake_detector.py          Credibility / fake-report scoring
      duplicate_detector.py     Duplicate detection
    ingestion/
      simulators.py            Synthetic multi-source batch generator
    routers/
      reports.py, ingest.py, analytics.py
  frontend/
    dashboard/                Analytics dashboard (filters, KPIs, charts, live map)
    admin/                    Admin panel (verification queue, source credibility)
    citizen-report/            Public report submission form
    shared/                    Shared theme.css + api.js used by all three pages
html_landing_page/            Public marketing/info landing page
production_artifacts/
  deployment/                Dockerfile, docker-compose.yml, nginx.conf
  docs/                       API_DOCUMENTATION.md, DATA_FLOW.md (with architecture diagram)
  diagrams/                   (reserved for exported diagram images)
```

---

## Running it locally

**1. Backend**

```bash
cd app_build/backend
pip install -r requirements.txt
python seed_data.py          # populates ~180 realistic demo reports
uvicorn main:app --reload --port 8000
```

API is now live at `http://localhost:8000` (Swagger docs at `/docs`).

**2. Frontend**

No build step — just open these files in a browser (they call the API at
`http://localhost:8000` by default):

- `app_build/frontend/dashboard/index.html` — main analytics dashboard
- `app_build/frontend/admin/index.html` — admin/verification panel
- `app_build/frontend/citizen-report/index.html` — citizen report form
- `html_landing_page/index.html` — public landing page

To point the frontend at a different API URL (e.g. a deployed backend), set
`window.WEATHER_API_BASE` before `api.js` loads on any page.

**3. Docker (full stack)**

```bash
docker compose -f production_artifacts/deployment/docker-compose.yml up --build
```

---

## Suggested next steps for a full build-out

1. Swap the simulated ingestion connector for live Twitter/X, Meta, and IMD AWS API credentials once available.
2. Move from SQLite to PostgreSQL/TimescaleDB and put the ingestion pipeline behind Kafka for true streaming scale.
3. Replace the Naive Bayes classifier with a fine-tuned transformer (e.g. IndicBERT) trained on IMD-labelled historical reports.
4. Add authentication/roles to the Admin Panel (currently open for demo purposes).
5. Add push-based live updates (WebSockets) instead of the current 20-second dashboard poll.
