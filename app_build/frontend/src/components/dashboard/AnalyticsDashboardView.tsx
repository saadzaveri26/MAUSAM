'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import KpiStrip from './KpiStrip';
import CategoryChart from './CategoryChart';
import StateChart from './StateChart';
import TimeseriesChart from './TimeseriesChart';
import { AlertTriangle } from 'lucide-react';

// Leaflet must be loaded dynamically on the client side only
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-navy-950 border border-line rounded-lg flex items-center justify-center">
      <span className="text-xs font-mono text-ink-2 animate-pulse">
        Initializing Spatial Telemetry Map…
      </span>
    </div>
  ),
});

export default function AnalyticsDashboardView() {
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [mapPoints, setMapPoints] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [sumRes, catRes, stRes, timeRes, mapRes] = await Promise.all([
        fetch('/api/analytics/summary'),
        fetch('/api/analytics/by-category'),
        fetch('/api/analytics/by-state'),
        fetch('/api/analytics/timeseries?days=14'),
        fetch('/api/analytics/map-points?limit=500'),
      ]);

      if (!sumRes.ok || !catRes.ok || !stRes.ok || !timeRes.ok || !mapRes.ok) {
        throw new Error('One or more analytics telemetry streams failed to respond');
      }

      const [sumData, catData, stData, timeData, mapData] = await Promise.all([
        sumRes.json(),
        catRes.json(),
        stRes.json(),
        timeRes.json(),
        mapRes.json(),
      ]);

      setSummary(sumData);
      setCategories(catData);
      setStates(stData);
      setTimeseries(timeData);
      setMapPoints(mapData);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Error communicating with analytics pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAnalytics();

    // 20-second operational polling interval
    const interval = setInterval(fetchAllAnalytics, 20000);
    return () => clearInterval(interval);
  }, [fetchAllAnalytics]);

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <KpiStrip
        summary={summary}
        loading={loading}
        lastUpdated={lastUpdated}
        onRefresh={fetchAllAnalytics}
      />

      {error && (
        <div className="p-3.5 rounded-md bg-red-dim border border-red/40 flex items-center justify-between text-xs text-red">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAllAnalytics}
            className="px-2.5 py-1 rounded bg-navy-800 text-ink-0 hover:bg-slate-700 font-mono text-[11px]"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Map-Dominant Section (Leaflet takes primary visual focus) */}
      <section aria-label="Geographic Incident Map">
        <LeafletMap points={mapPoints} loading={loading} />
      </section>

      {/* Charts Grid Below Map: Category / State / Trend */}
      <section aria-label="Incident Analytics & Trends" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CategoryChart data={categories} />
        <StateChart data={states} />
        <TimeseriesChart data={timeseries} />
      </section>
    </div>
  );
}
