"""
National Weather Big Data Analytics Platform — API entrypoint (prototype)

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Then open the dashboard/admin/citizen-report HTML files in
app_build/frontend/ (they call this API at http://localhost:8000).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import Base, engine
from routers import reports, ingest, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="National Weather Big Data Analytics Platform",
    description="SIH 2026 — PS 26069 | Ministry of Earth Sciences / IMD prototype API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # relaxed for prototype/demo; lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router)
app.include_router(ingest.router)
app.include_router(analytics.router)

# Serve uploaded/demo media if present
media_dir = os.path.join(os.path.dirname(__file__), "media")
os.makedirs(media_dir, exist_ok=True)
app.mount("/media", StaticFiles(directory=media_dir), name="media")


@app.get("/")
def root():
    return {
        "platform": "National Weather Big Data Analytics Platform",
        "problem_statement": "SIH 26069",
        "status": "prototype running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
