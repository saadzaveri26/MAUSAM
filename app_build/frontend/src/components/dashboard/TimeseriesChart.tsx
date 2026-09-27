'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface TimeseriesPoint {
  date: string;
  count: number;
}

interface TimeseriesChartProps {
  data: TimeseriesPoint[];
}

export default function TimeseriesChart({ data }: TimeseriesChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 110;
  const chartWidth = 500;

  // Build SVG path
  const points = data.map((d, index) => {
    const x = data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - (d.count / max) * (chartHeight - 16) - 8;
    return { x, y, ...d };
  });

  const pathD = points.length
    ? `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(' ')
    : '';

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  return (
    <div className="bg-navy-900 border border-line rounded-lg p-5 shadow-l1 space-y-4">
      <div className="flex items-center justify-between border-b border-line-soft pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber" />
          <h3 className="font-display font-semibold text-sm text-ink-0">
            14-Day Ingestion Velocity
          </h3>
        </div>
        <span className="text-[11px] font-mono text-ink-2">
          Daily multi-source volume
        </span>
      </div>

      <div className="space-y-3">
        {/* SVG Area Chart */}
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-28 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5a623" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f5a623" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="rgba(233, 241, 245, 0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="rgba(233, 241, 245, 0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2={chartWidth} y2="100" stroke="rgba(233, 241, 245, 0.05)" strokeDasharray="3 3" />

            {/* Area fill */}
            {areaD && <path d={areaD} fill="url(#trendGradient)" />}

            {/* Line stroke */}
            {pathD && <path d={pathD} fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Point circles */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="3"
                className="fill-navy-950 stroke-amber stroke-2 hover:r-4 transition-all"
              >
                <title>{`${p.date}: ${p.count} reports`}</title>
              </circle>
            ))}
          </svg>
        </div>

        {/* Date axis labels */}
        <div className="flex justify-between text-[10px] font-mono text-ink-2 pt-1 border-t border-line-soft">
          <span>{data[0]?.date ? data[0].date.slice(5) : '—'}</span>
          <span>Mid-Period</span>
          <span>{data[data.length - 1]?.date ? data[data.length - 1].date.slice(5) : 'Today'}</span>
        </div>
      </div>
    </div>
  );
}
