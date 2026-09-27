'use client';

import React from 'react';
import {
  BarChart2,
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

interface CategoryData {
  category: string;
  count: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

/**
 * Weather category icon + color map.
 * Per user directive: "Add a simple line-icon per weather category on the
 * dashboard's category breakdown chart, for visual clarity and a touch of
 * personality without reintroducing a character."
 */
const CATEGORY_CONFIG: Record<string, { color: string; icon: LucideIcon }> = {
  Rainfall:     { color: '#4f9dde', icon: CloudRain },
  Flooding:     { color: '#2bb3a3', icon: Waves },
  Thunderstorm: { color: '#f5a623', icon: CloudLightning },
  Heatwave:     { color: '#f97316', icon: Thermometer },
  Fog:          { color: '#7f95a1', icon: CloudFog },
  'Dust Storm': { color: '#d97706', icon: Wind },
  'Strong Wind':{ color: '#38bdf8', icon: Wind },
  Cyclone:      { color: '#e5484d', icon: Tornado },
  Hail:         { color: '#a855f7', icon: CloudHail },
  Snowfall:     { color: '#e2e8f0', icon: Snowflake },
  Other:        { color: '#64748b', icon: HelpCircle },
};

export default function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-surface border border-line rounded-lg p-5 shadow-l1 space-y-4">
      <div className="flex items-center justify-between border-b border-line-soft pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-brand-primary" />
          <h3 className="font-display font-semibold text-sm text-ink-0">
            Event Categorization
          </h3>
        </div>
        <span className="text-[11px] text-ink-2">
          Non-duplicate incident volume
        </span>
      </div>

      <div className="space-y-2.5">
        {data.slice(0, 7).map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const barWidth = Math.round((item.count / max) * 100);
          const config = CATEGORY_CONFIG[item.category] || { color: '#4f9dde', icon: HelpCircle };
          const Icon = config.icon;

          return (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-1 font-medium flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: config.color }} strokeWidth={1.5} />
                  {item.category}
                </span>
                <span className="text-[11px] text-ink-2">
                  <span className="text-ink-0 font-semibold">{item.count}</span> ({pct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-surface-alt rounded-xs overflow-hidden">
                <div
                  className="h-full rounded-xs transition-all duration-500"
                  style={{ width: `${barWidth}%`, backgroundColor: config.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
