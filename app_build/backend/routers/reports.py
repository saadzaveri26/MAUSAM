from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import WeatherReport, VerificationStatus, AuditLog
from schemas import CitizenReportIn, VerificationUpdateIn
from pipeline import process_and_store
from auth import require_admin

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("")
def list_reports(
    db: Session = Depends(get_db),
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD"),
    event_category: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    verification_status: Optional[str] = None,
    hide_duplicates: bool = True,
    min_credibility: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = Query(200, le=1000),
    offset: int = 0,
):
    q = db.query(WeatherReport)

    if date_from:
        q = q.filter(WeatherReport.reported_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(WeatherReport.reported_at <= datetime.fromisoformat(date_to + "T23:59:59"))
    if event_category:
        q = q.filter(WeatherReport.event_category == event_category)
    if state:
        q = q.filter(WeatherReport.state == state)
    if city:
        q = q.filter(WeatherReport.city == city)
    if verification_status:
        q = q.filter(WeatherReport.verification_status == verification_status)
    if hide_duplicates:
        q = q.filter(WeatherReport.is_duplicate == False)  # noqa: E712
    if min_credibility is not None:
        q = q.filter(WeatherReport.credibility_score >= min_credibility)
    if search:
        like = f"%{search}%"
        q = q.filter(WeatherReport.raw_text.ilike(like))

    total = q.count()
    rows = q.order_by(WeatherReport.reported_at.desc()).offset(offset).limit(limit).all()
    return {"total": total, "count": len(rows), "results": [r.to_dict() for r in rows]}


@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db)):
    r = db.query(WeatherReport).get(report_id)
    if not r:
        raise HTTPException(404, "Report not found")
    return r.to_dict()


@router.post("/citizen")
def submit_citizen_report(payload: CitizenReportIn, db: Session = Depends(get_db)):
    report = process_and_store(
        db,
        text=payload.text,
        city=payload.city,
        state=payload.state,
        latitude=payload.latitude,
        longitude=payload.longitude,
        hashtags=payload.hashtags or "#IMD",
        media_url=payload.media_url,
        media_type=payload.media_type,
        reporter_handle=payload.reporter_handle or "citizen_anonymous",
        source_type="Citizen Report",
    )
    return report.to_dict()


@router.patch("/{report_id}/verify", dependencies=[Depends(require_admin)])
def update_verification(report_id: int, payload: VerificationUpdateIn, db: Session = Depends(get_db)):
    report = db.query(WeatherReport).get(report_id)
    if not report:
        raise HTTPException(404, "Report not found")

    try:
        new_status = VerificationStatus(payload.status)
    except ValueError:
        raise HTTPException(400, f"Invalid status: {payload.status}")

    report.verification_status = new_status
    report.verified_by = payload.actor
    report.verified_at = datetime.utcnow()
    if payload.notes:
        report.admin_notes = payload.notes

    # Update source trust score based on admin decision (feedback loop)
    if report.source:
        if new_status == VerificationStatus.VERIFIED:
            report.source.verified_reports = (report.source.verified_reports or 0) + 1
            report.source.trust_score = min(1.0, report.source.trust_score + 0.05)
        elif new_status == VerificationStatus.REJECTED:
            report.source.rejected_reports = (report.source.rejected_reports or 0) + 1
            report.source.trust_score = max(0.0, report.source.trust_score - 0.15)
            if report.source.trust_score < 0.15 and report.source.rejected_reports >= 3:
                report.source.is_blacklisted = True

    db.add(AuditLog(report_id=report.id, action=new_status.value, actor=payload.actor, notes=payload.notes))
    db.commit()
    db.refresh(report)
    return report.to_dict()


@router.get("/meta/filters")
def get_filter_options(db: Session = Depends(get_db)):
    states = [r[0] for r in db.query(WeatherReport.state).distinct() if r[0]]
    cities = [r[0] for r in db.query(WeatherReport.city).distinct() if r[0]]
    categories = [r[0].value for r in db.query(WeatherReport.event_category).distinct() if r[0]]
    return {"states": sorted(states), "cities": sorted(cities), "event_categories": sorted(categories)}
