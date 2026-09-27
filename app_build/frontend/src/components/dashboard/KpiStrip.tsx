'use client';

import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CopyX,
  Radio,
  RefreshCw,
} from 'lucide-react';

interface SummaryData {
  total_reports: number;
  verified: number;
  pending: number;
  auto_flagged: number;
  rejected: number;
  duplicates_filtered: number;
  active_sources: number;
  blacklisted_sources: number;
  reports_last_hour: number;
}

interface KpiStripProps {
  summary: SummaryData | null;
  loading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export default function KpiStrip({ summary, loading, lastUpdated, onRefresh }: KpiStripProps) {
  const verifiedPct = summary?.total_reports
    ? Math.round((summary.verified / summary.total_reports) * 100)
    : 0;

  const duplicatePct = summary?.total_reports
    ? Math.round((summary.duplicates_filtered / summary.total_reports) * 100)
    : 0;

  return (
    <div className="space-y-3">
      {/* Top telemetry status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-900 border border-line rounded-lg px-4 py-2.5 shadow-l1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal"></span>
          </span>
          <span className="font-mono text-xs font-medium text-ink-0">
            Operational Telemetry Stream
          </span>
          <span className="text-[11px] font-mono text-ink-2 hidden sm:inline">
            · Updates every 20 seconds
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-ink-2">
            Last polled:{' '}
            <span className="text-ink-1">
              {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN', { hour12: false }) : 'Connecting…'}
            </span>
          </span>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded bg-navy-800 hover:bg-slate-700 border border-line text-ink-1 hover:text-ink-0 transition-colors disabled:opacity-50"
            title="Poll fresh data now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Ingested */}
        <div className="bg-navy-900 border border-line rounded-lg p-3.5 shadow-l1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Reports</span>
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-ink-0">
              {summary ? (
                summary.total_reports.toLocaleString('en-IN')
              ) : loading ? (
                <div className="h-7 w-20 bg-navy-800 animate-pulse rounded my-0.5" />
              ) : (
                '0'
              )}
            </div>
            <span className="text-[10px] text-ink-2 font-mono mt-0.5 block">
              Multi-source ingest
            </span>
          </div>
        </div>

        {/* Verified Ground-Truth */}
        <div className="bg-navy-900 border border-line rounded-lg p-3.5 shadow-l1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Verified Truth</span>
            <CheckCircle2 className="w-4 h-4 text-teal" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-teal">
              {summary ? (
                summary.verified.toLocaleString('en-IN')
              ) : loading ? (
                <div className="h-7 w-16 bg-navy-800 animate-pulse rounded my-0.5" />
              ) : (
                '0'
              )}
            </div>
            <span className="text-[10px] text-ink-2 font-mono mt-0.5 block">
              {verifiedPct}% operator confirmed
            </span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-navy-900 border border-line rounded-lg p-3.5 shadow-l1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Pending Queue</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-amber">
              {summary ? (
                summary.pending.toLocaleString('en-IN')
              ) : loading ? (
                <div className="h-7 w-16 bg-navy-800 animate-pulse rounded my-0.5" />
              ) : (
                '0'
              )}
            </div>
            <span className="text-[10px] text-ink-2 font-mono mt-0.5 block">
              Awaiting triage
            </span>
          </div>
        </div>

        {/* Auto-Flagged Anomaly */}
        <div className="bg-navy-900 border border-line rounded-lg p-3.5 shadow-l1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Auto-Flagged</span>
            <AlertTriangle className="w-4 h-4 text-red" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-red">
              {summary ? (
                summary.auto_flagged.toLocaleString('en-IN')
              ) : loading ? (
                <div className="h-7 w-16 bg-navy-800 animate-pulse rounded my-0.5" />
              ) : (
                '0'
              )}
            </div>
            <span className="text-[10px] text-ink-2 font-mono mt-0.5 block">
              Low credibility / noise
            </span>
          </div>
        </div>

        {/* Duplicates Filtered */}
        <div className="bg-navy-900 border border-line rounded-lg p-3.5 shadow-l1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Duplicates</span>
            <CopyX className="w-4 h-4 text-ink-2" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-ink-1">
              {summary ? (
                summary.duplicates_filtered.toLocaleString('en-IN')
              ) : loading ? (
                <div className="h-7 w-16 bg-navy-800 animate-pulse rounded my-0.5" />
              ) : (
                '0'
              )}
            </div>
            <span className="text-[10px] text-ink-2 font-mono mt-0.5 block">
              {duplicatePct}% cluster deduplicated
            </span>
          </div>
        </div>

        {/* Cadence / Last Hour */}
        <div className="bg-navy-900 border border-line rounded-lg p-3.5 shadow-l1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Last Hour</span>
            <Radio className="w-4 h-4 text-teal" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-ink-0">
              {summary ? (
                summary.reports_last_hour.toLocaleString('en-IN')
              ) : loading ? (
                <div className="h-7 w-16 bg-navy-800 animate-pulse rounded my-0.5" />
              ) : (
                '0'
              )}
            </div>
            <span className="text-[10px] text-teal font-mono mt-0.5 block">
              Live ingest velocity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
