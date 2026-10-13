import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { geoAlbersUsa, geoBounds, geoConicEqualArea, geoPath, type GeoProjection } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import type { AtlasCity, CountryStatus } from '@/lib/atlas';
import type { GeoFeature } from '@/lib/atlasGeo';

export interface RegionState {
  status: CountryStatus;
  /** Segnata a mano (e non dai viaggi): si può togliere con un clic. */
  manual: boolean;
}

interface RegionMapProps {
  countryCode: string;
  regions: GeoFeature[];
  states: Map<string, RegionState>;
  cities: AtlasCity[];
  /** Segna/toglie a mano una regione; assente = sola lettura. */
  onToggle?: (region: string) => void;
}

const FILL: Record<CountryStatus, string> = {
  visited: 'var(--atlas-visited)',
  transit: 'url(#region-transit)',
  planned: 'var(--atlas-planned)',
};

/** Proiezione adatta al paese: Albers con riquadri per gli USA (Alaska e Hawaii),
 * conica equivalente centrata sul paese per tutti gli altri (anche quelli a
 * cavallo dell'antimeridiano, come Russia e Fiji). */
const projectionFor = (code: string, collection: FeatureCollection<Geometry>, w: number, h: number): GeoProjection => {
  const pad = 16;
  if (code === 'US') return geoAlbersUsa().fitExtent([[pad, pad], [w - pad, h - pad]], collection) as unknown as GeoProjection;
  const [[west, south], [east, north]] = geoBounds(collection);
  const lon = east < west ? (west + east + 360) / 2 : (west + east) / 2;
  const span = north - south;
  return geoConicEqualArea()
    .parallels([south + span / 6, north - span / 6])
    .rotate([-lon, 0])
    .fitExtent([[pad, pad], [w - pad, h - pad]], collection);
};

export const RegionMap: React.FC<RegionMapProps> = ({ countryCode, regions, states, cities, onToggle }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 500 });
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Occupa lo stesso riquadro della mappa del mondo (vi si sovrappone in dissolvenza).
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const { width, height } = size;
  const collection = useMemo<FeatureCollection<Geometry>>(() => ({ type: 'FeatureCollection', features: regions }), [regions]);
  const projection = useMemo(() => projectionFor(countryCode, collection, width, height), [countryCode, collection, width, height]);
  const path = useMemo(() => geoPath(projection), [projection]);

  const hoverState = hover ? states.get(hover.name) : undefined;

  return (
    <div ref={containerRef} className="absolute inset-0 select-none bg-[var(--surface-1)]">
      <svg width={width} height={height} role="img" aria-label={t('atlas.regions.mapLabel')} onPointerLeave={() => setHover(null)}>
        <defs>
          <pattern id="region-transit" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" style={{ fill: 'var(--atlas-land)' }} />
            <line x1="0" y1="0" x2="0" y2="5" strokeWidth="2.5" style={{ stroke: 'var(--atlas-visited)' }} />
          </pattern>
        </defs>
        {regions.map((r) => {
          const state = r.code ? states.get(r.code) : undefined;
          const d = path(r);
          if (!d || !r.code) return null;
          const name = r.code;
          // Le regioni sbloccate dai viaggi non si tolgono a mano.
          const toggleable = !!onToggle && (!state || state.manual || state.status !== 'visited');
          return (
            <path
              key={name}
              d={d}
              onClick={toggleable ? () => onToggle?.(name) : undefined}
              onPointerMove={(e) => {
                const box = containerRef.current?.getBoundingClientRect();
                if (box) setHover({ name, x: e.clientX - box.left, y: e.clientY - box.top });
              }}
              strokeWidth={0.8}
              className={`transition-[filter] duration-150 hover:brightness-110 ${toggleable ? 'cursor-pointer' : ''}`}
              style={{ fill: state ? FILL[state.status] : 'var(--atlas-land)', stroke: 'var(--atlas-border)' }}
            />
          );
        })}
        {cities
          .filter((c) => c.visited && c.countryCode === countryCode)
          .map((c) => {
            const pt = projection([c.lon, c.lat]);
            if (!pt) return null;
            return (
              <g key={c.key} className="pointer-events-none">
                <circle cx={pt[0]} cy={pt[1]} r={3} strokeWidth={1.2} className="fill-deep-blue dark:fill-white" style={{ stroke: 'var(--atlas-border)' }} />
                <text x={pt[0] + 6} y={pt[1] + 4} className="text-[11px] font-semibold fill-slate-700 dark:fill-slate-200" style={{ paintOrder: 'stroke', stroke: 'var(--surface-1)', strokeWidth: 3 }}>
                  {c.city}
                </text>
              </g>
            );
          })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-slate-900/90 text-white text-xs px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <span className="font-semibold">{hover.name}</span>
          <span className="text-white/70">
            {' · '}
            {hoverState
              ? `${t(`atlas.status.${hoverState.status}`)}${hoverState.manual ? ` (${t('atlas.regions.manual')})` : ''}`
              : t('atlas.notVisited')}
          </span>
        </div>
      )}
    </div>
  );
};
