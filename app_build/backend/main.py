import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from database import Base, engine, SessionLocal
from models import WeatherReport
from routers import reports, ingest, analytics

env_file = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip()
                if k not in os.environ:
                    os.environ[k] = v

admin_tok = os.environ.get("ADMIN_TOKEN", "").strip()
if not admin_tok or len(admin_tok) < 24:
    raise RuntimeError("ADMIN_TOKEN must be set and at least 24 characters")

raw_origins = os.environ.get("ALLOWED_ORIGINS", "").strip()
if raw_origins:
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    for o in origins:
        if "*" in o:
            raise RuntimeError(f"Wildcard not allowed in ALLOWED_ORIGINS: {o}")
else:
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(WeatherReport.id).count() == 0:
            from ingestion.simulators import generate_synthetic_batch
            from pipeline import process_and_store
            batch = generate_synthetic_batch(180)
            for item in batch:
                process_and_store(
                    db,
                    text=item["raw_text"],
                    city=item["city"],
                    state=item["state"],
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    hashtags=item["hashtags"],
                    media_url=f"https://media.example.gov.in/{item['media_type']}/demo.jpg" if item["has_media"] else None,
                    media_type=item["media_type"],
                    reporter_handle=item["source_handle"],
                    source_type=item["source_type"],
                    reported_at=item["reported_at"],
                )
            db.commit()
    finally:
        db.close()
    yield

app = FastAPI(
    title="National Weather Big Data Analytics Platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Token", "Authorization"],
)

@app.exception_handler(StarletteHTTPException)
async def http_exc_handler(req: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(Exception)
async def unhandled_exc_handler(req: Request, exc: Exception):
    sys.stdout.write(f"ERROR: {req.method} {req.url.path} {type(exc).__name__}: {str(exc)}\n")
    sys.stdout.flush()
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.include_router(reports.router)
app.include_router(ingest.router)
app.include_router(analytics.router)

media_dir = os.path.join(os.path.dirname(__file__), "media")
os.makedirs(media_dir, exist_ok=True)
app.mount("/media", StaticFiles(directory=media_dir), name="media")

@app.get("/")
def root():
    return {
        "platform": "National Weather Big Data Analytics Platform",
        "status": "online",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "ok"}
