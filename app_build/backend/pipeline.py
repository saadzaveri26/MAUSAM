"""
Central processing pipeline: raw report -> ML enrichment -> persisted row.

Every ingestion path (citizen submission, simulated social-media batch,
future live connectors) funnels through `process_and_store` so scoring
logic lives in exactly one place.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from models import WeatherReport, Source, SourceType, EventCategory, VerificationStatus
from ml.classifier import event_classifier
from ml.fake_detector import score_report, verification_bucket
from ml.duplicate_detector import find_duplicate


def _get_or_create_source(db: Session, handle: str, source_type: str) -> Source:
    src = db.query(Source).filter(Source.handle == handle).first()
    if src:
        return src
    try:
        st_enum = SourceType(source_type)
    except ValueError:
        st_enum = SourceType.OTHER_SOCIAL
    src = Source(handle=handle, source_type=st_enum, trust_score=0.5)
    db.add(src)
    db.flush()
    return src


def _recent_candidates(db: Session, city: str, reported_at: datetime):
    window_start = reported_at - timedelta(hours=6)
    window_end = reported_at + timedelta(hours=6)
    rows = (
        db.query(WeatherReport)
        .filter(WeatherReport.city == city)
        .filter(WeatherReport.reported_at >= window_start)
        .filter(WeatherReport.reported_at <= window_end)
        .order_by(WeatherReport.id.desc())
        .limit(50)
        .all()
    )
    return [{"id": r.id, "raw_text": r.raw_text, "city": r.city, "reported_at": r.reported_at} for r in rows]


def process_and_store(
    db: Session,
    *,
    text: str,
    city: str,
    state: str,
    latitude: float,
    longitude: float,
    hashtags: str,
    media_url: str,
    media_type: str,
    reporter_handle: str,
    source_type: str,
    reported_at: datetime = None,
) -> WeatherReport:
    reported_at = reported_at or datetime.utcnow()

    source = _get_or_create_source(db, reporter_handle, source_type)

    # 1. Duplicate detection against recent same-city reports
    candidates = _recent_candidates(db, city, reported_at)
    dup_id = find_duplicate(text, city, reported_at, candidates)

    # 2. Event categorization
    category_label, confidence, severity = event_classifier.classify(text, hashtags)
    try:
        category_enum = EventCategory(category_label)
    except ValueError:
        category_enum = EventCategory.OTHER

    # 3. Credibility / fake-report scoring
    corroboration_count = sum(1 for c in candidates if c["id"] != dup_id)
    credibility = score_report(
        text,
        source_trust_score=source.trust_score,
        has_media=bool(media_url) or media_type not in (None, "none"),
        corroboration_count=corroboration_count,
    )
    status_label = verification_bucket(credibility)

    report = WeatherReport(
        raw_text=text,
        hashtags=hashtags or "",
        media_url=media_url,
        media_type=media_type or "none",
        reported_at=reported_at,
        city=city,
        state=state,
        latitude=latitude,
        longitude=longitude,
        source_id=source.id,
        event_category=category_enum,
        category_confidence=confidence,
        credibility_score=credibility,
        is_duplicate=dup_id is not None,
        duplicate_of_id=dup_id,
        severity=severity,
        verification_status=VerificationStatus(status_label),
    )
    db.add(report)

    source.total_reports = (source.total_reports or 0) + 1
    db.add(source)

    db.commit()
    db.refresh(report)
    return report
