'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Layers, Filter, Eye, Maximize2 } from 'lucide-react';

interface MapPoint {
  id: number;
  lat: number;
  lon: number;
  category: string;
  severity: string;
  city: string;
  state: string;
  status: string;
  text: string;
}

interface LeafletMapProps {
  points: MapPoint[];
  loading: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  Low: '#2bb3a3',
  Moderate: '#f5a623',
  High: '#f97316',
  Severe: '#e5484d',
};

export default function LeafletMap({ points, loading }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = Array.from(new Set(points.map((p) => p.category))).sort();

  const filteredPoints = points.filter((p) => {
    if (selectedSeverity !== 'ALL' && p.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted) return;

      const map = L.map(mapContainerRef.current, {
        center: [21.5, 79.0],
        zoom: 5,
        minZoom: 4,
        maxZoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Clean GIS tile layer matching light theme
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16,
        }
      ).addTo(map);

      // Boundary and label reference overlay
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          maxZoom: 16,
        }
      ).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when points or filters change
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import('leaflet')).default;

      markersLayerRef.current.clearLayers();

      filteredPoints.forEach((p) => {
        if (!p.lat || !p.lon) return;

        const color = SEVERITY_COLORS[p.severity] || '#4f9dde';

        // Custom pulsing SVG circle marker
        const circleMarker = L.circleMarker([p.lat, p.lon], {
          radius: p.severity === 'Severe' ? 8 : p.severity === 'High' ? 7 : 6,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.85,
        });

        const popupContent = `
          <div style="font-family: var(--font-noto-sans), sans-serif; color: #071824; font-size: 12px; line-height: 1.4; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
              <strong style="font-size: 13px; color: #071824;">${p.category}</strong>
              <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${color}22; color: ${color};">
                ${p.severity}
              </span>
            </div>
            <div style="margin-bottom: 4px; color: #555; font-size: 11px;">
              📍 <strong>${p.city}</strong>, ${p.state}
            </div>
            <div style="margin-bottom: 6px; font-size: 11.5px; color: #222; max-height: 80px; overflow-y: auto;">
              "${p.text}"
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666; font-family: inherit;">
              <span>Status: <strong>${p.status}</strong></span>
              <span>#{p.id}</span>
            </div>
          </div>
        `;

        circleMarker.bindPopup(popupContent);
        markersLayerRef.current.addLayer(circleMarker);
      });
    }

    updateMarkers();
  }, [filteredPoints]);

  function handleResetView() {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([21.5, 79.0], 5);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-lg shadow-l2 overflow-hidden flex flex-col">
      {/* Top Map Controls Bar */}
      <div className="p-3.5 border-b border-line bg-surface flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-primary" />
          <span className="font-display font-semibold text-ink-0 text-sm">
            Live Spatial Incident Feed
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-ink-1 text-[11px] border border-line shadow-xs">
            {filteredPoints.length} Geocoded Points
          </span>
        </div>

        {/* Severity Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-ink-2 mr-1">Severity:</span>
          {['ALL', 'Severe', 'High', 'Moderate', 'Low'].map((sev) => {
            const isActive = selectedSeverity === sev;
            const color = sev === 'ALL' ? '#6E5D57' : SEVERITY_COLORS[sev];
            return (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2 py-1 rounded text-[11px] transition-all border ${
                  isActive
                    ? 'bg-white text-ink-0 border-line shadow-l1 font-semibold'
                    : 'bg-transparent text-ink-2 border-transparent hover:text-ink-1'
                }`}
                style={{ borderLeftColor: isActive && sev !== 'ALL' ? color : undefined, borderLeftWidth: isActive && sev !== 'ALL' ? '3px' : undefined }}
              >
                {sev}
              </button>
            );
          })}

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ml-2 bg-white border border-line rounded px-2.5 py-1 text-xs text-ink-0 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={handleResetView}
            className="ml-1 p-1 rounded bg-white hover:bg-surface-alt text-ink-2 hover:text-ink-0 border border-line shadow-xs"
            title="Reset to India view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Viewport: dominant visual surface (constrained height and isolated stacking context) */}
      <div className="relative w-full h-[520px] sm:h-[580px] bg-surface-alt isolate z-0 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Operational Severity Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-surface/95 border border-line rounded-md p-3 shadow-l3 text-xs space-y-2 pointer-events-auto backdrop-blur-none">
          <span className="text-[10px] text-ink-2 uppercase tracking-wider block font-semibold">
            IMD Alert Severity
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red border border-red/40"></span>
              <span className="text-ink-1">Severe / Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-500/40"></span>
              <span className="text-ink-1">High / Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber border border-amber/40"></span>
              <span className="text-ink-1">Moderate / Watch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal border border-teal/40"></span>
              <span className="text-ink-1">Low / Normal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
