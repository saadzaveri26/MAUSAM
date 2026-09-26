"""
Convenience script: populates the database with a realistic demo dataset in
one command, so evaluators see a populated dashboard immediately instead of
an empty state.

Run:
    python seed_data.py
"""
from database import Base, engine, SessionLocal
from ingestion.simulators import generate_synthetic_batch
from pipeline import process_and_store

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
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
    db.close()
    print(f"Seeded {len(batch)} synthetic weather reports into weather_platform.db")
