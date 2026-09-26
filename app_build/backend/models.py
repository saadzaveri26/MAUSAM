"""
Core ORM schema for the National Weather Big Data Analytics Platform.

Design notes
------------
- `WeatherReport` is the central fact table: one row per ingested
  post/report, regardless of source (Twitter/X, citizen app, partner API,
  public dataset scrape). This mirrors how a production Kafka -> Spark
  Structured Streaming -> data-lake pipeline would land a unified schema.
- `Source` captures provenance + a running trust/credibility score so the
  fake-report ML pipeline can weight new reports from that source.
- `DuplicateLink` records which reports were merged/clustered by the
  duplicate-detection pipeline, keeping full audit trail instead of deleting.
- `AuditLog` gives the Admin Panel a verification trail (who/what verified,
  and when) — required for the "Verification status tracking" feature.
"""
import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from database import Base


class EventCategory(str, enum.Enum):
    RAINFALL = "Rainfall"
    THUNDERSTORM = "Thunderstorm"
    FLOODING = "Flooding"
    HEATWAVE = "Heatwave"
    FOG = "Fog"
    DUST_STORM = "Dust Storm"
    STRONG_WIND = "Strong Wind"
    CYCLONE = "Cyclone"
    HAIL = "Hail"
    SNOWFALL = "Snowfall"
    OTHER = "Other"


class VerificationStatus(str, enum.Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"
    AUTO_FLAGGED = "Auto-Flagged"


class SourceType(str, enum.Enum):
    TWITTER_X = "Twitter/X"
    CITIZEN_APP = "Citizen Report"
    PUBLIC_API = "Public API (IMD/AWS)"
    NEWS_WEBSITE = "News Website"
    OTHER_SOCIAL = "Other Social Media"


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    handle = Column(String(255), index=True)              # e.g. @user, domain name
    source_type = Column(Enum(SourceType), nullable=False)
    trust_score = Column(Float, default=0.5)               # 0..1, updated by ML feedback loop
    total_reports = Column(Integer, default=0)
    verified_reports = Column(Integer, default=0)
    rejected_reports = Column(Integer, default=0)
    is_blacklisted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("WeatherReport", back_populates="source")


class WeatherReport(Base):
    __tablename__ = "weather_reports"

    id = Column(Integer, primary_key=True, index=True)

    # --- Raw content ---
    raw_text = Column(Text, nullable=False)
    hashtags = Column(String(500), default="")              # comma-separated
    media_url = Column(String(1000), nullable=True)          # photo/video reference
    media_type = Column(String(20), nullable=True)           # image | video | none

    # --- Metadata ---
    reported_at = Column(DateTime, default=datetime.utcnow)  # event/post timestamp
    ingested_at = Column(DateTime, default=datetime.utcnow)  # pipeline ingestion timestamp
    city = Column(String(120), index=True)
    state = Column(String(120), index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # --- Source / provenance ---
    source_id = Column(Integer, ForeignKey("sources.id"))
    source = relationship("Source", back_populates="reports")

    # --- ML-derived fields ---
    event_category = Column(Enum(EventCategory), default=EventCategory.OTHER, index=True)
    category_confidence = Column(Float, default=0.0)
    credibility_score = Column(Float, default=0.5)           # fake/misleading detector output, 0..1
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(Integer, ForeignKey("weather_reports.id"), nullable=True)
    severity = Column(String(20), default="Low")              # Low / Moderate / High / Severe

    # --- Verification workflow (Admin Panel) ---
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING, index=True)
    verified_by = Column(String(120), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "raw_text": self.raw_text,
            "hashtags": self.hashtags,
            "media_url": self.media_url,
            "media_type": self.media_type,
            "reported_at": self.reported_at.isoformat() if self.reported_at else None,
            "ingested_at": self.ingested_at.isoformat() if self.ingested_at else None,
            "city": self.city,
            "state": self.state,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "source": {
                "id": self.source.id,
                "handle": self.source.handle,
                "type": self.source.source_type.value if self.source.source_type else None,
                "trust_score": round(self.source.trust_score, 2) if self.source else None,
            } if self.source else None,
            "event_category": self.event_category.value if self.event_category else None,
            "category_confidence": round(self.category_confidence or 0, 2),
            "credibility_score": round(self.credibility_score or 0, 2),
            "is_duplicate": self.is_duplicate,
            "duplicate_of_id": self.duplicate_of_id,
            "severity": self.severity,
            "verification_status": self.verification_status.value if self.verification_status else None,
            "verified_by": self.verified_by,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "admin_notes": self.admin_notes,
        }


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("weather_reports.id"))
    action = Column(String(50))          # verified | rejected | flagged | merged
    actor = Column(String(120), default="admin")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
