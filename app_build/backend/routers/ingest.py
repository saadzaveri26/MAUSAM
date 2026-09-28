from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import IngestSimulateIn
from ingestion.simulators import generate_synthetic_batch
from pipeline import process_and_store
from auth import require_admin

router = APIRouter(prefix="/api/ingest", tags=["ingestion"])


@router.post("/simulate", dependencies=[Depends(require_admin)])
def simulate_ingestion(payload: IngestSimulateIn, db: Session = Depends(get_db)):
    """
    Simulates a real-time multi-source ingestion tick (what a Kafka consumer
    reading from the Twitter/X filtered stream + public-API pollers would
    hand off to the processing pipeline). Useful for demoing the platform
    without live, credentialed API access.
    """
    batch = generate_synthetic_batch(payload.count)
    stored = []
    for item in batch:
        report = process_and_store(
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
        stored.append(report.id)
    return {"ingested": len(stored), "report_ids": stored}
