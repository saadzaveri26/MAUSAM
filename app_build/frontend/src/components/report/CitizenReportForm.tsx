'use client';

import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  Sparkles,
  Info,
  CloudRain,
  CloudLightning,
  Waves,
  Thermometer,
  CloudFog,
  Wind,
  Tornado,
  CloudHail,
  Snowflake,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

/**
 * Weather category config — each category gets a line-icon for visual clarity.
 * Per user directive: "Add a simple line-icon per weather category on the report
 * form's category selector"
 */
const EVENT_CATEGORIES: { label: string; icon: LucideIcon }[] = [
  { label: 'Rainfall', icon: CloudRain },
  { label: 'Thunderstorm', icon: CloudLightning },
  { label: 'Flooding', icon: Waves },
  { label: 'Heatwave', icon: Thermometer },
  { label: 'Fog', icon: CloudFog },
  { label: 'Dust Storm', icon: Wind },
  { label: 'Strong Wind', icon: Wind },
  { label: 'Cyclone', icon: Tornado },
  { label: 'Hail', icon: CloudHail },
  { label: 'Snowfall', icon: Snowflake },
  { label: 'Other', icon: HelpCircle },
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
];

interface GpsState {
  status: 'idle' | 'locating' | 'locked' | 'denied' | 'unsupported';
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error?: string;
}

interface MLResult {
  id: number;
  raw_text: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  event_category: string;
  category_confidence: number;
  credibility_score: number;
  severity: string;
  is_duplicate: boolean;
  duplicate_of_id: number | null;
  verification_status: string;
  reported_at: string;
}

export default function CitizenReportForm() {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Rainfall');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');
  const [reporterHandle, setReporterHandle] = useState('citizen_field_reporter');
  const [gps, setGps] = useState<GpsState>({
    status: 'idle',
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mlResult, setMlResult] = useState<MLResult | null>(null);

  // Auto-capture GPS with visible states
  function handleCaptureGps() {
    if (!('geolocation' in navigator)) {
      setGps({
        status: 'unsupported',
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setGps({ status: 'locating', latitude: null, longitude: null, accuracy: null });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          status: 'locked',
          latitude: parseFloat(pos.coords.latitude.toFixed(5)),
          longitude: parseFloat(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy),
        });
      },
      (err) => {
        setGps({
          status: 'denied',
          latitude: null,
          longitude: null,
          accuracy: null,
          error:
            err.code === err.PERMISSION_DENIED
              ? 'Location permission denied by user. Enter city manually.'
              : 'GPS signal timeout. Please specify coordinates or city manually.',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  function handleClearGps() {
    setGps({ status: 'idle', latitude: null, longitude: null, accuracy: null });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 3) {
      setSubmitError('Observation description must be at least 3 characters.');
      return;
    }
    if (!city.trim()) {
      setSubmitError('Please specify the reporting city or district.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      text: `${text.trim()} #${category.replace(/\s+/g, '')} #WeatherUpdate`,
      city: city.trim(),
      state: state,
      latitude: gps.latitude,
      longitude: gps.longitude,
      hashtags: `#${category.replace(/\s+/g, '')},#WeatherUpdate`,
      media_url: null,
      media_type: 'none',
      reporter_handle: reporterHandle.trim() || 'citizen_anonymous',
    };

    try {
      const res = await fetch('/api/reports/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setMlResult(data);
    } catch (err: any) {
      setSubmitError(err.message || 'Network error communicating with analysis pipeline');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setText('');
    setCity('');
    setMlResult(null);
    setSubmitError(null);
    handleClearGps();
  }

  // Plain-Language ML Result View (No raw JSON)
  if (mlResult) {
    const confidencePct = Math.round(mlResult.category_confidence * 100);
    const credibilityPct = Math.round(mlResult.credibility_score * 100);

    const severityConfig: Record<string, { badge: string; color: string; desc: string }> = {
      Low: {
        badge: 'Low / Green Warning Level',
        color: 'text-teal border-teal/30 bg-teal-dim',
        desc: 'Normal weather event. No imminent operational hazard identified.',
      },
      Moderate: {
        badge: 'Moderate / Yellow Watch Level',
        color: 'text-amber border-amber/30 bg-amber-dim',
        desc: 'Advisory alert. Area requires continued observation by local authorities.',
      },
      High: {
        badge: 'High / Orange Alert Level',
        color: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
        desc: 'Severe condition. Municipal disaster management units notified.',
      },
      Severe: {
        badge: 'Severe / Red Warning Level',
        color: 'text-red border-red/30 bg-red-dim',
        desc: 'Critical emergency hazard. Immediate field verification prioritized.',
      },
    };

    const currentSev = severityConfig[mlResult.severity] || severityConfig.Low;

    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Success Header */}
        <div className="bg-surface border border-teal/40 rounded-lg p-6 shadow-l2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-teal-dim text-teal flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg text-ink-0">
                  Observation Ingested &amp; Analyzed
                </h2>
                <p className="text-xs text-ink-2">
                  RECORD ID #{mlResult.id} · OPERATIONAL VERIFICATION PIPELINE
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-teal-dim border border-teal/30 text-teal text-xs font-medium shrink-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span>Pipeline Verified</span>
            </div>
          </div>

          <p className="text-xs text-ink-1 leading-relaxed border-t border-line-soft pt-3">
            Your weather report has been processed by MeghSetu&apos;s real-time event classifier,
            duplicate detection engine, and credibility model. The findings are summarized below.
          </p>
        </div>

        {/* Plain Language Analysis Cards */}
        <div className="bg-surface border border-line rounded-lg p-6 shadow-l1 space-y-5">
          <h3 className="font-display font-medium text-sm text-ink-0 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber" />
            <span>Automated Meteorological Analysis</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Category */}
            <div className="p-3.5 bg-white border border-line rounded-md shadow-xs">
              <span className="text-[11px] text-ink-2 block mb-1">
                CLASSIFIED EVENT
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold text-ink-0">
                  {mlResult.event_category}
                </span>
                <span className="text-xs text-teal font-semibold">
                  {confidencePct}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-ink-2 mt-1">
                Detected via automated meteorological text processing.
              </p>
            </div>

            {/* Assessed Severity */}
            <div className="p-3.5 bg-white border border-line rounded-md shadow-xs">
              <span className="text-[11px] text-ink-2 block mb-1">
                OPERATIONAL SEVERITY
              </span>
              <div className="flex items-baseline justify-between">
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${currentSev.color}`}>
                  {mlResult.severity}
                </span>
                <span className="text-xs text-ink-1">
                  Severity Scale
                </span>
              </div>
              <p className="text-[11px] text-ink-2 mt-1">
                {currentSev.desc}
              </p>
            </div>

            {/* Credibility Score */}
            <div className="p-3.5 bg-white border border-line rounded-md shadow-xs">
              <span className="text-[11px] text-ink-2 block mb-1">
                CREDIBILITY RATING
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold text-ink-0">
                  {credibilityPct}% Reliable
                </span>
                <span className="text-xs text-amber font-semibold">
                  {credibilityPct >= 65 ? 'Verified Source Signal' : 'Standard Citizen Signal'}
                </span>
              </div>
              <p className="text-[11px] text-ink-2 mt-1">
                Scored over vocabulary consistency, geography, and source trust history.
              </p>
            </div>

            {/* Duplicate Filter */}
            <div className="p-3.5 bg-white border border-line rounded-md shadow-xs">
              <span className="text-[11px] text-ink-2 block mb-1">
                DEDUPLICATION STATUS
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink-0">
                  {mlResult.is_duplicate ? 'Corroborating Event' : 'Unique Incident'}
                </span>
                <span className="text-xs text-ink-2">
                  {mlResult.is_duplicate ? `Linked to #${mlResult.duplicate_of_id}` : 'Primary Entry'}
                </span>
              </div>
              <p className="text-[11px] text-ink-2 mt-1">
                {mlResult.is_duplicate
                  ? 'Matched with an active spatial cluster within the 3-hour window.'
                  : 'No duplicate observations recorded in this district within the active window.'}
              </p>
            </div>
          </div>

          {/* Submission Details */}
          <div className="p-3 bg-surface-alt border border-line rounded-md text-xs text-ink-1 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-ink-2">Location:</span>
              <span className="text-ink-0">{mlResult.city}, {mlResult.state} {mlResult.latitude ? `(${mlResult.latitude}°N, ${mlResult.longitude}°E)` : ''}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-ink-2">Status:</span>
              <span className="text-amber">Pending Admin Verification Queue</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-ink-2">Logged Text:</span>
              <span className="text-ink-0 italic truncate max-w-[280px]">{mlResult.raw_text}</span>
            </div>
          </div>

          {/* Action to submit another */}
          <button
            onClick={resetForm}
            className="w-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-medium text-xs py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Submit Another Observation</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Intro banner — no eyebrow (tasteskill: max 1 eyebrow per 3 sections) */}
      <div className="bg-surface border border-brand-primary/20 rounded-lg p-5 shadow-l1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-lg text-ink-0">
            Citizen Weather Incident Report
          </h1>
          <p className="text-xs text-ink-1 mt-2 leading-relaxed max-w-md">
            Submit observed weather conditions from your area. Observations are analyzed
            in real-time by ML models for credibility scoring and duplicate detection.
          </p>
        </div>
        <div className="px-3.5 py-2.5 rounded-md bg-brand-primary/10 border border-brand-primary/30 text-xs shrink-0 self-start sm:self-center space-y-1">
          <div className="flex items-center gap-1.5 text-brand-primary font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span>Live Intake Channel</span>
          </div>
          <span className="block text-[11px] text-ink-2">Real-Time Ground Truth</span>
        </div>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-md bg-red-dim border border-red/40 flex items-start gap-2.5 text-xs text-red">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main Single Column Form */}
      <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 sm:p-6 shadow-l2 space-y-5">
        {/* Category selector — solid filled pink background when selected */}
        <div>
          <label className="block text-xs text-ink-1 uppercase tracking-wider mb-3 font-semibold">
            Incident Category <span className="text-brand-primary">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {EVENT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-md border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm font-semibold ring-2 ring-brand-primary/30'
                      : 'bg-white border-line text-ink-1 hover:border-brand-primary/40 hover:text-ink-0'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} strokeWidth={isSelected ? 2 : 1.5} />
                  <span className="text-[11px] leading-tight text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Observation Text */}
        <div>
          <label htmlFor="report-text" className="block text-xs text-ink-1 uppercase tracking-wider mb-2 font-semibold">
            Observation Details <span className="text-brand-primary">*</span>
          </label>
          <textarea
            id="report-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you see: rainfall intensity, flooded roads/landmarks, water depth, fallen trees, wind strength, etc."
            className="w-full bg-white border border-line rounded-md px-3.5 py-2.5 text-sm text-ink-0 placeholder-ink-2 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors leading-relaxed shadow-xs"
            required
          />
          <span className="block text-[11px] text-ink-2 mt-1">
            Minimum 3 characters. Include recognizable landmarks for local validation.
          </span>
        </div>

        {/* GPS Capture with Explicit Visible Confirmation */}
        <div className="p-3.5 bg-surface-alt border border-line rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-1 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-brand-primary" />
              <span>GPS Geolocation</span>
            </span>

            {gps.status === 'locked' && (
              <button
                type="button"
                onClick={handleClearGps}
                className="text-[11px] text-ink-2 hover:text-red transition-colors"
              >
                Clear Coordinates
              </button>
            )}
          </div>

          {/* GPS status displays */}
          {gps.status === 'idle' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs text-ink-2">
                Coordinates are optional but enhance classification accuracy.
              </span>
              <button
                type="button"
                onClick={handleCaptureGps}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-primary/10 border border-brand-primary/30 hover:bg-brand-primary/20 text-xs text-brand-primary transition-colors shrink-0"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Auto-Capture Device GPS</span>
              </button>
            </div>
          )}

          {gps.status === 'locating' && (
            <div className="flex items-center gap-2.5 text-xs text-brand-primary animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              <span>Querying device GPS satellites and network towers…</span>
            </div>
          )}

          {gps.status === 'locked' && (
            <div className="p-2.5 rounded bg-teal-dim border border-teal/40 flex items-start gap-2.5 text-xs text-teal">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">GPS Coordinates Locked &amp; Confirmed</span>
                <span className="text-[11px] text-ink-0 block">
                  {gps.latitude?.toFixed(4)}° N, {gps.longitude?.toFixed(4)}° E (±{gps.accuracy}m accuracy)
                </span>
              </div>
            </div>
          )}

          {(gps.status === 'denied' || gps.status === 'unsupported') && (
            <div className="p-2.5 rounded bg-amber-dim border border-amber/40 text-xs text-amber flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span>{gps.error}</span>
                <span className="block text-[11px] text-ink-2 mt-0.5">
                  You can proceed by entering your city and state below.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* State & City Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="report-state" className="block text-xs text-ink-1 uppercase tracking-wider mb-2 font-semibold">
              State / UT <span className="text-brand-primary">*</span>
            </label>
            <select
              id="report-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-white border border-line rounded-md px-3.5 py-2.5 text-sm text-ink-0 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors shadow-xs"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="report-city" className="block text-xs text-ink-1 uppercase tracking-wider mb-2 font-semibold">
              City / District <span className="text-brand-primary">*</span>
            </label>
            <input
              id="report-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai, Chennai, Patna"
              className="w-full bg-white border border-line rounded-md px-3.5 py-2.5 text-sm text-ink-0 placeholder-ink-2 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors shadow-xs"
              required
            />
          </div>
        </div>

        {/* Reporter Handle (Provenance) */}
        <div>
          <label htmlFor="report-handle" className="block text-xs text-ink-1 uppercase tracking-wider mb-2 font-semibold">
            Reporter Identifier / Handle
          </label>
          <input
            id="report-handle"
            type="text"
            value={reporterHandle}
            onChange={(e) => setReporterHandle(e.target.value)}
            placeholder="citizen_field_reporter"
            className="w-full bg-white border border-line rounded-md px-3.5 py-2.5 text-sm text-ink-0 placeholder-ink-2 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors shadow-xs"
          />
          <span className="block text-[11px] text-ink-2 mt-1">
            Builds source credibility history. Retains anonymity if desired.
          </span>
        </div>

        {/* Submit button — coral pink primary with sunset orange hover */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-primary hover:bg-brand-secondary text-navy-950 font-semibold text-sm py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-l2"
        >
          {submitting ? (
            <span className="inline-block animate-pulse text-xs">
              Transmitting to ML Pipeline…
            </span>
          ) : (
            <>
              <span>Submit Weather Report</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center">
          <span className="text-[11px] text-ink-2">
            MeghSetu · National Weather Big Data Analytics Platform
          </span>
        </div>
      </form>
    </div>
  );
}
