'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Layers,
  Users,
  Radio,
  FileCheck,
  Lock,
  MessageSquare,
  Ban,
  Check,
} from 'lucide-react';

interface ReportItem {
  id: number;
  raw_text: string;
  city: string;
  state: string;
  event_category: string;
  category_confidence: number;
  credibility_score: number;
  severity: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected' | 'Auto-Flagged';
  is_duplicate: boolean;
  duplicate_of_id?: number | null;
  reported_at: string;
  source?: {
    id: number;
    handle: string;
    type: string;
    trust_score: number;
  } | null;
  admin_notes?: string | null;
}

interface SourceItem {
  id: number;
  handle: string;
  type: string | null;
  trust_score: number;
  total_reports: number;
  verified_reports: number;
  rejected_reports: number;
  is_blacklisted: boolean;
}

export default function AdminConsoleView() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'queue' | 'sources'>('queue');

  // Queue data & filters
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hideDuplicates, setHideDuplicates] = useState<boolean>(false);

  // Filter metadata
  const [filterMeta, setFilterMeta] = useState<{ states: string[]; cities: string[]; event_categories: string[] }>({
    states: [],
    cities: [],
    event_categories: [],
  });

  // Verification action notes modal/state
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [activeAction, setActiveAction] = useState<'Verified' | 'Rejected' | null>(null);

  // Sources data
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);

  // Ingest simulation
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  // Fetch filter options
  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch('/api/reports/meta/filters');
        if (res.ok) {
          const data = await res.json();
          setFilterMeta(data);
        }
      } catch (err) {
        // Fallback meta
      }
    }
    loadMeta();
  }, []);

  // Fetch Queue
  const fetchQueue = useCallback(async () => {
    setLoadingQueue(true);
    setQueueError(null);
    try {
      const p = new URLSearchParams();
      if (filterStatus) p.set('verification_status', filterStatus);
      if (filterCategory) p.set('event_category', filterCategory);
      if (filterState) p.set('state', filterState);
      if (searchTerm) p.set('search', searchTerm);
      p.set('hide_duplicates', hideDuplicates ? 'true' : 'false');
      p.set('limit', '80');

      const res = await fetch(`/api/reports?${p.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve verification queue');
      const data = await res.json();
      setReports(data.results || []);
      setTotalReports(data.total || 0);
    } catch (err: any) {
      setQueueError(err.message || 'Error communicating with report database');
    } finally {
      setLoadingQueue(false);
    }
  }, [filterStatus, filterCategory, filterState, searchTerm, hideDuplicates]);

  // Fetch Sources
  const fetchSources = useCallback(async () => {
    setLoadingSources(true);
    try {
      const res = await fetch('/api/analytics/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      // Error fetching sources
    } finally {
      setLoadingSources(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchQueue();
    } else {
      fetchSources();
    }
  }, [activeTab, fetchQueue, fetchSources]);

  // Handle Verify / Reject Action
  async function handleVerifyAction(id: number, status: 'Verified' | 'Rejected', notes?: string) {
    try {
      const res = await fetch(`/api/admin/reports/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actor: 'imd_operator_01',
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update report status');
      }

      // Close modal if open
      setActioningId(null);
      setNoteText('');
      setActiveAction(null);

      // Refresh queue and sources
      fetchQueue();
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    }
  }

  // Handle Toggle Blacklist
  async function handleToggleBlacklist(sourceId: number) {
    try {
      const res = await fetch(`/api/admin/sources/${sourceId}/blacklist`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to toggle blacklist status');
      }
      fetchSources();
    } catch (err: any) {
      alert(`Failed to update blacklist status: ${err.message}`);
    }
  }

  // Handle Ingest Simulation Batch
  async function handleTriggerSimulate() {
    setSimulating(true);
    setSimMessage('Ingesting 25 synthetic multi-source weather reports through ML pipeline…');
    try {
      const res = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 25 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch ingestion simulation failed');

      setSimMessage(`Batch complete: ingested ${data.ingested} reports.`);
      fetchQueue();
    } catch (err: any) {
      setSimMessage(`Ingestion failed: ${err.message}`);
    } finally {
      setSimulating(false);
      setTimeout(() => setSimMessage(null), 5000);
    }
  }

  // Handle Logout / Lock
  async function handleLogout() {
    await fetch('/api/admin/verify', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'Verified':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-teal-dim text-teal border border-teal/30"><span className="w-1.5 h-1.5 rounded-full bg-teal" />Verified</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-red-dim text-red border border-red/30"><span className="w-1.5 h-1.5 rounded-full bg-red" />Rejected</span>;
      case 'Auto-Flagged':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-dim text-amber border border-amber/30"><span className="w-1.5 h-1.5 rounded-full bg-amber" />Flagged</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-accent/15 text-accent border border-accent/30"><span className="w-1.5 h-1.5 rounded-full bg-accent" />Pending</span>;
    }
  }

  function getCredibilityIndicator(score: number) {
    const pct = Math.round(score * 100);
    let barColor = 'bg-red';
    let textColor = 'text-red';
    if (score >= 0.65) {
      barColor = 'bg-teal';
      textColor = 'text-teal';
    } else if (score >= 0.4) {
      barColor = 'bg-amber';
      textColor = 'text-amber';
    }

    return (
      <div className="w-20 space-y-1">
        <div className="flex justify-between font-mono text-[11px]">
          <span className={`font-semibold ${textColor}`}>{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-navy-800 rounded-full overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Admin Controls & Toolbar */}
      <div className="bg-navy-900 border border-line rounded-lg p-4 sm:p-5 shadow-l1 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-dim text-amber flex items-center justify-center border border-amber/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-ink-0 leading-tight">
                IMD Operational Verification Console
              </h1>
              <span className="text-[11px] font-mono text-ink-2">
                ACTIVE OPERATOR SESSION · PRIVILEGED AUDIT QUEUE
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTriggerSimulate}
            disabled={simulating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-navy-800 hover:bg-slate-700 border border-line text-xs font-mono text-amber transition-colors disabled:opacity-50"
            title="Ingest a simulated multi-source batch for demonstration"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{simulating ? 'Ingesting Batch…' : 'Simulate Batch (+25)'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-navy-800 hover:bg-red-dim border border-line hover:border-red/40 text-xs font-mono text-ink-2 hover:text-red transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Session</span>
          </button>
        </div>
      </div>

      {simMessage && (
        <div className="p-3 bg-navy-800 border border-amber/40 rounded-md text-xs text-amber font-mono flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{simMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-line gap-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'queue'
              ? 'border-amber text-amber font-semibold'
              : 'border-transparent text-ink-2 hover:text-ink-0'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Verification Queue ({totalReports})</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'sources'
              ? 'border-amber text-amber font-semibold'
              : 'border-transparent text-ink-2 hover:text-ink-0'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Source Credibility & Blacklist</span>
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Dense Filter Bar */}
          <div className="bg-navy-900 border border-line rounded-lg p-3.5 shadow-l1 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-ink-2">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-navy-800 border border-line rounded px-2.5 py-1 text-xs text-ink-0 font-mono focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Auto-Flagged">Auto-Flagged</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-ink-2">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-navy-800 border border-line rounded px-2.5 py-1 text-xs text-ink-0 font-mono focus:outline-none"
              >
                <option value="">All Categories</option>
                {filterMeta.event_categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-ink-2">State:</span>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="bg-navy-800 border border-line rounded px-2.5 py-1 text-xs text-ink-0 font-mono focus:outline-none"
              >
                <option value="">All States</option>
                {filterMeta.states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-ink-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter incident keywords…"
                  className="w-full bg-navy-800 border border-line rounded pl-8 pr-2.5 py-1 text-xs text-ink-0 placeholder-ink-2 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-ink-2 hover:text-ink-0 select-none">
              <input
                type="checkbox"
                checked={hideDuplicates}
                onChange={(e) => setHideDuplicates(e.target.checked)}
                className="rounded bg-navy-800 border-line text-amber focus:ring-0"
              />
              <span className="text-[11px] font-mono">Hide Duplicates</span>
            </label>

            <button
              onClick={fetchQueue}
              className="p-1.5 rounded bg-navy-800 hover:bg-slate-700 text-ink-1 hover:text-ink-0 border border-line"
              title="Refresh queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingQueue ? 'animate-spin text-amber' : ''}`} />
            </button>
          </div>

          {queueError && (
            <div className="p-3 bg-red-dim border border-red/40 rounded-md text-xs text-red">
              {queueError}
            </div>
          )}

          {/* DENSE TABLE-FIRST VERIFICATION QUEUE */}
          <div className="bg-navy-900 border border-line rounded-lg shadow-l2 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line bg-navy-950/60 font-mono text-[11px] text-ink-2 uppercase tracking-wider">
                  <th className="py-3 px-3.5 font-medium">Time / ID</th>
                  <th className="py-3 px-3.5 font-medium">Location</th>
                  <th className="py-3 px-3.5 font-medium">Event & Severity</th>
                  <th className="py-3 px-3.5 font-medium min-w-[280px]">Observation Snippet</th>
                  <th className="py-3 px-3.5 font-medium">Source / Trust</th>
                  <th className="py-3 px-3.5 font-medium">Credibility</th>
                  <th className="py-3 px-3.5 font-medium">Status</th>
                  <th className="py-3 px-3.5 font-medium text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-ink-2 font-mono text-xs">
                      {loadingQueue ? 'Loading triage queue…' : 'No incident reports match this filter.'}
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => {
                    const reportedDate = new Date(r.reported_at);
                    const formattedTime = isNaN(reportedDate.getTime())
                      ? r.reported_at
                      : reportedDate.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={r.id} className="hover:bg-navy-800/40 transition-colors">
                        {/* Time & ID */}
                        <td className="py-3 px-3.5 font-mono text-[11px] text-ink-1 whitespace-nowrap">
                          <span className="font-semibold text-ink-0">#{r.id}</span>
                          <span className="block text-[10px] text-ink-2">{formattedTime}</span>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-medium text-ink-0 block">{r.city}</span>
                          <span className="text-[11px] text-ink-2 font-mono block">{r.state}</span>
                        </td>

                        {/* Event Category & Severity */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-semibold text-ink-0 block">{r.event_category}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-ink-2">
                              {r.severity}
                            </span>
                            {r.is_duplicate && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-dim text-red border border-red/30">
                                Duplicate
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Observation Text */}
                        <td className="py-3 px-3.5 text-ink-1 leading-relaxed">
                          <p className="line-clamp-2 text-xs text-ink-0">
                            {r.raw_text}
                          </p>
                          {r.admin_notes && (
                            <span className="block text-[10px] font-mono text-amber mt-1 italic">
                              Note: {r.admin_notes}
                            </span>
                          )}
                        </td>

                        {/* Source Handle */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px]">
                          <span className="text-ink-0 block">{r.source?.handle || 'citizen_anon'}</span>
                          <span className="text-[10px] text-ink-2 block">{r.source?.type || 'Citizen Report'}</span>
                        </td>

                        {/* Credibility */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {getCredibilityIndicator(r.credibility_score)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {getStatusBadge(r.verification_status)}
                        </td>

                        {/* Operator Actions */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {/* One-click Verify */}
                            <button
                              onClick={() => handleVerifyAction(r.id, 'Verified')}
                              className="px-2.5 py-1 rounded bg-teal hover:bg-teal/90 text-navy-950 font-semibold text-[11px] transition-colors shadow-l1 flex items-center gap-1"
                              title="Verify this report"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verify</span>
                            </button>

                            {/* One-click Reject */}
                            <button
                              onClick={() => handleVerifyAction(r.id, 'Rejected')}
                              className="px-2.5 py-1 rounded bg-navy-800 hover:bg-red-dim border border-line hover:border-red/40 text-red text-[11px] font-medium transition-colors"
                              title="Reject this report"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>

                            {/* Notes trigger */}
                            <button
                              onClick={() => {
                                setActioningId(r.id);
                                setNoteText(r.admin_notes || '');
                                setActiveAction('Verified');
                              }}
                              className="p-1 rounded bg-navy-800 hover:bg-slate-700 text-ink-2 hover:text-ink-0 border border-line"
                              title="Add verification note"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCE CREDIBILITY & BLACKLIST TABLE */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-navy-900 border border-line rounded-lg p-4 shadow-l1 flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-sm text-ink-0">
                Source Provenance & Trust Registry
              </h2>
              <p className="text-xs text-ink-2 font-mono mt-0.5">
                ACTIVE-LEARNING FEEDBACK LOOP · UPDATES ON OPERATOR DECISIONS
              </p>
            </div>
            <button
              onClick={fetchSources}
              className="p-1.5 rounded bg-navy-800 hover:bg-slate-700 text-ink-1 hover:text-ink-0 border border-line"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSources ? 'animate-spin text-amber' : ''}`} />
            </button>
          </div>

          <div className="bg-navy-900 border border-line rounded-lg shadow-l2 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line bg-navy-950/60 font-mono text-[11px] text-ink-2 uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Source Handle</th>
                  <th className="py-3 px-4 font-medium">Channel Type</th>
                  <th className="py-3 px-4 font-medium">Trust Score</th>
                  <th className="py-3 px-4 font-medium text-center">Total Ingested</th>
                  <th className="py-3 px-4 font-medium text-center">Verified</th>
                  <th className="py-3 px-4 font-medium text-center">Rejected</th>
                  <th className="py-3 px-4 font-medium text-center">Blacklist Status</th>
                  <th className="py-3 px-4 font-medium text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {sources.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-ink-2 font-mono text-xs">
                      {loadingSources ? 'Loading sources…' : 'No registered sources in database.'}
                    </td>
                  </tr>
                ) : (
                  sources.map((s) => (
                    <tr key={s.id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-ink-0">{s.handle}</td>
                      <td className="py-3 px-4 text-ink-1">{s.type || 'Citizen Observation'}</td>
                      <td className="py-3 px-4">
                        {getCredibilityIndicator(s.trust_score)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-ink-0 font-medium">{s.total_reports}</td>
                      <td className="py-3 px-4 text-center font-mono text-teal font-medium">{s.verified_reports}</td>
                      <td className="py-3 px-4 text-center font-mono text-red font-medium">{s.rejected_reports}</td>
                      <td className="py-3 px-4 text-center">
                        {s.is_blacklisted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-dim text-red border border-red/40">
                            <Ban className="w-3 h-3" /> Blacklisted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-dim text-teal border border-teal/40">
                            Active Source
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleBlacklist(s.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors border ${
                            s.is_blacklisted
                              ? 'bg-teal-dim border-teal/40 text-teal hover:bg-teal hover:text-navy-950'
                              : 'bg-navy-800 border-line text-red hover:bg-red-dim hover:border-red/40'
                          }`}
                        >
                          {s.is_blacklisted ? 'Un-blacklist' : 'Blacklist Source'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Notes Modal */}
      {actioningId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80">
          <div className="w-full max-w-md bg-navy-900 border border-line rounded-lg p-6 shadow-l4 space-y-4">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="font-display font-semibold text-sm text-ink-0">
                Operator Audit Decision for Report #{actioningId}
              </h3>
              <button
                onClick={() => setActioningId(null)}
                className="text-ink-2 hover:text-ink-0 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-ink-1 uppercase tracking-wider mb-2">
                Operational Justification / Notes
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Corroborated with AWS radar station; water depth ~45cm verified."
                className="w-full bg-navy-800 border border-line rounded-md p-3 text-xs text-ink-0 placeholder-ink-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setActioningId(null)}
                className="px-3 py-1.5 rounded-md bg-navy-800 border border-line text-ink-2 hover:text-ink-0 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyAction(actioningId, 'Rejected', noteText)}
                className="px-3 py-1.5 rounded-md bg-red-dim border border-red/40 text-red hover:bg-red hover:text-white font-medium text-xs transition-colors"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => handleVerifyAction(actioningId, 'Verified', noteText)}
                className="px-3.5 py-1.5 rounded-md bg-teal hover:bg-teal/90 text-navy-950 font-semibold text-xs transition-colors shadow-l1"
              >
                Confirm Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
