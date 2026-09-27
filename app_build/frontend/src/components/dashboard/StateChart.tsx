'use client';

import React from 'react';
import { Map } from 'lucide-react';

interface StateData {
  state: string;
  count: number;
}

interface StateChartProps {
  data: StateData[];
}

export default function StateChart({ data }: StateChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-surface border border-line rounded-lg p-5 shadow-l1 space-y-4">
      <div className="flex items-center justify-between border-b border-line-soft pb-3">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-teal" />
          <h3 className="font-display font-semibold text-sm text-ink-0">
            State-Wise Activity
          </h3>
        </div>
        <span className="text-[11px] font-mono text-ink-2">
          Regional incidence ranking
        </span>
      </div>

      <div className="space-y-2.5">
        {data.slice(0, 7).map((item, idx) => {
          const barWidth = Math.round((item.count / max) * 100);

          return (
            <div key={item.state} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-1 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-ink-2 w-4">#{idx + 1}</span>
                  <span>{item.state}</span>
                </span>
                <span className="font-mono text-[11px] text-ink-0 font-semibold">
                  {item.count} reports
                </span>
              </div>
              <div className="w-full h-2 bg-surface-alt rounded-xs overflow-hidden">
                <div
                  className="h-full rounded-xs bg-teal transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
