"""
Database engine & session management.

Prototype uses SQLite for zero-config local/demo runs. The schema and access
layer (SQLAlchemy ORM) are engine-agnostic: swapping DATABASE_URL to a
PostgreSQL / TimescaleDB / MongoDB-backed connector is a one-line change for
the production deployment (see production_artifacts/docs/DATA_FLOW.md).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.environ.get(
    "DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'weather_platform.db')}"
)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
