from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CitizenReportIn(BaseModel):
    text: str = Field(..., min_length=3, description="Report description / caption")
    city: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hashtags: Optional[str] = ""
    media_url: Optional[str] = None
    media_type: Optional[str] = "none"
    reporter_handle: Optional[str] = "citizen_anonymous"


class IngestSimulateIn(BaseModel):
    count: int = Field(25, ge=1, le=500, description="Number of synthetic posts to simulate-ingest")


class VerificationUpdateIn(BaseModel):
    status: str  # Verified | Rejected | Auto-Flagged | Pending
    actor: Optional[str] = "admin"
    notes: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    raw_text: str
    city: Optional[str]
    state: Optional[str]
    event_category: Optional[str]
    verification_status: Optional[str]

    class Config:
        from_attributes = True
