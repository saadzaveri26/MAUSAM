from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import WeatherReport, Source, VerificationStatus
from auth import require_admin

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    total = db.query(func.count(WeatherReport.id)).scalar() or 0
    verified = db.query(func.count(WeatherReport.id)).filter(
        WeatherReport.verification_status == VerificationStatus.VERIFIED).scalar() or 0
    pending = db.query(func.count(WeatherReport.id)).filter(
        WeatherReport.verification_status == VerificationStatus.PENDING).scalar() or 0
    flagged = db.query(func.count(WeatherReport.id)).filter(
        WeatherReport.verification_status == VerificationStatus.AUTO_FLAGGED).scalar() or 0
    rejected = db.query(func.count(WeatherReport.id)).filter(
        WeatherReport.verification_status == VerificationStatus.REJECTED).scalar() or 0
    duplicates = db.query(func.count(WeatherReport.id)).filter(WeatherReport.is_duplicate == True).scalar() or 0  # noqa
    active_sources = db.query(func.count(Source.id)).filter(Source.is_blacklisted == False).scalar() or 0  # noqa
    blacklisted_sources = db.query(func.count(Source.id)).filter(Source.is_blacklisted == True).scalar() or 0  # noqa

    last_hour = datetime.utcnow() - timedelta(hours=1)
    reports_last_hour = db.query(func.count(WeatherReport.id)).filter(
        WeatherReport.ingested_at >= last_hour).scalar() or 0

    return {
        "total_reports": total,
        "verified": verified,
        "pending": pending,
        "auto_flagged": flagged,
        "rejected": rejected,
        "duplicates_filtered": duplicates,
        "active_sources": active_sources,
        "blacklisted_sources": blacklisted_sources,
        "reports_last_hour": reports_last_hour,
    }


@router.get("/by-category")
def by_category(db: Session = Depends(get_db)):
    rows = (
        db.query(WeatherReport.event_category, func.count(WeatherReport.id))
        .filter(WeatherReport.is_duplicate == False)  # noqa
        .group_by(WeatherReport.event_category)
        .all()
    )
    return [{"category": r[0].value if r[0] else "Other", "count": r[1]} for r in rows]


@router.get("/by-state")
def by_state(db: Session = Depends(get_db)):
    rows = (
        db.query(WeatherReport.state, func.count(WeatherReport.id))
        .filter(WeatherReport.is_duplicate == False)  # noqa
        .group_by(WeatherReport.state)
        .order_by(func.count(WeatherReport.id).desc())
        .all()
    )
    return [{"state": r[0], "count": r[1]} for r in rows if r[0]]


@router.get("/timeseries")
def timeseries(db: Session = Depends(get_db), days: int = 14):
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(func.date(WeatherReport.reported_at), func.count(WeatherReport.id))
        .filter(WeatherReport.reported_at >= since)
        .group_by(func.date(WeatherReport.reported_at))
        .order_by(func.date(WeatherReport.reported_at))
        .all()
    )
    return [{"date": r[0], "count": r[1]} for r in rows]


@router.get("/verification-breakdown")
def verification_breakdown(db: Session = Depends(get_db)):
    rows = (
        db.query(WeatherReport.verification_status, func.count(WeatherReport.id))
        .group_by(WeatherReport.verification_status)
        .all()
    )
    return [{"status": r[0].value if r[0] else "Pending", "count": r[1]} for r in rows]


@router.get("/map-points")
def map_points(db: Session = Depends(get_db), limit: int = 500):
    rows = (
        db.query(WeatherReport)
        .filter(WeatherReport.is_duplicate == False)  # noqa
        .filter(WeatherReport.latitude.isnot(None))
        .order_by(WeatherReport.reported_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "lat": r.latitude,
            "lon": r.longitude,
            "category": r.event_category.value if r.event_category else "Other",
            "severity": r.severity,
            "city": r.city,
            "state": r.state,
            "status": r.verification_status.value if r.verification_status else "Pending",
            "text": r.raw_text[:140],
        }
        for r in rows
    ]


@router.get("/sources")
def sources(db: Session = Depends(get_db)):
    rows = db.query(Source).order_by(Source.trust_score.asc()).all()
    return [
        {
            "id": s.id,
            "handle": s.handle,
            "type": s.source_type.value if s.source_type else None,
            "trust_score": round(s.trust_score, 2),
            "total_reports": s.total_reports,
            "verified_reports": s.verified_reports,
            "rejected_reports": s.rejected_reports,
            "is_blacklisted": s.is_blacklisted,
        }
        for s in rows
    ]


@router.post("/sources/{source_id}/toggle-blacklist", dependencies=[Depends(require_admin)])
def toggle_source_blacklist(source_id: int, db: Session = Depends(get_db)):
    source = db.query(Source).get(source_id)
    if not source:
        raise HTTPException(404, "Source not found")
    source.is_blacklisted = not bool(source.is_blacklisted)
    db.commit()
    db.refresh(source)
    return {
        "id": source.id,
        "handle": source.handle,
        "is_blacklisted": source.is_blacklisted
    }
