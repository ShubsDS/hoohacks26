'use client';

import { useEffect, useRef } from 'react';
import type { Report } from '@/lib/types';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#FF3B30',
  HIGH: '#FF9500',
  MEDIUM: '#FFD60A',
  LOW: '#34C759',
};

interface Props {
  reports: Report[];
  onSelectReport: (report: Report) => void;
}

export default function LiveMap({ reports, onSelectReport }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then(L => {
      if (!containerRef.current || mapRef.current) return;

      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!).setView([38.0336, -78.508], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => {
      const map = mapRef.current as ReturnType<typeof L.map>;
      const currentIds = new Set(reports.map(r => r.id));

      // Remove stale markers
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          (marker as ReturnType<typeof L.marker>).remove();
          markersRef.current.delete(id);
        }
      });

      // Add/update markers
      reports.forEach(report => {
        if (markersRef.current.has(report.id)) return;
        const color = SEVERITY_COLORS[report.severity] ?? '#8E8E93';
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([report.latitude, report.longitude], { icon })
          .addTo(map)
          .bindPopup(`<b>${report.title}</b><br>${report.category} · ${report.severity}`);
        marker.on('click', () => onSelectReport(report));
        if (report.radiusMeters) {
          L.circle([report.latitude, report.longitude], {
            radius: report.radiusMeters,
            color,
            fillColor: color,
            fillOpacity: 0.1,
            weight: 1,
          }).addTo(map);
        }
        markersRef.current.set(report.id, marker);
      });
    });
  }, [reports, onSelectReport]);

  return (
    <>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} className="w-full h-full rounded-xl" />
    </>
  );
}
