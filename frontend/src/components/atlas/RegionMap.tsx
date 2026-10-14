import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { geoAlbersUsa, geoBounds, geoConicEqualArea, geoPath, type GeoProjection } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { House } from 'lucide-react';
import { CapitalMarker } from '@/components/atlas/CapitalMarker';
import type { TripRef } from '@/components/atlas/TripsBadge';
import type { AtlasCity, CountryStatus } from '@/lib/atlas';
import { nearCapital, type Capital } from '@/lib/capitals';
import { regionAt, type GeoFeature } from '@/lib/atlasGeo';
import { isShapedRegionFlag } from '@/lib/flags';
import type { Coordinates } from '@/lib/types';

export interface RegionState {
  status: CountryStatus;
  /** Segnata a mano (e non dai viaggi): si può togliere con un clic. */
  manual: boolean;
  /** Viaggi (già iniziati) che l'hanno sbloccata. */
  trips: TripRef[];
}

interface RegionMapProps {
  countryCode: string;
  regions: GeoFeature[];
  states: Map<string, RegionState>;
  cities: AtlasCity[];
  /** Segna/toglie a mano una regione; assente = sola lettura. */
  onToggle?: (region: string) => void;
  /** Città di casa dal profilo: si mostra solo se cade in questo paese. */
  homeCoords?: Coordinates | null;
  /** Nome della città di casa, accanto all'icona. */
  homeLabel?: string | null;
  /** Bandiere delle regioni, se il paese le ha tutte. */
  flags?: Record<string, string>;
  /** Nome da mostrare (tradotto) a partire dal nome originale della regione. */
  regionLabel?: (name: string) => string;
  /** Capitale del paese: segnata con una stella. */
  capital?: Capital | null;
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

export const RegionMap: React.FC<RegionMapProps> = ({ countryCode, regions, states, cities, onToggle, homeCoords = null, homeLabel = null, flags, regionLabel = (n) => n, capital = null }) => {
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

  const homeInCountry = useMemo(
    () => !!homeCoords && regionAt(regions, homeCoords.lat, homeCoords.lon) !== null,
    [homeCoords, regions]
  );
  const homePoint = homeInCountry && homeCoords ? projection([homeCoords.lon, homeCoords.lat]) : null;
  const capitalPoint = capital ? projection([capital.lon, capital.lat]) : null;

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
          .filter((c) => (c.visited || c.transit) && c.countryCode === countryCode)
          .map((c) => {
            const pt = projection([c.lon, c.lat]);
            if (!pt) return null;
            return (
              <g key={c.key} className="pointer-events-none">
                <circle cx={pt[0]} cy={pt[1]} r={3.4} strokeWidth={1.2} className="fill-deep-blue dark:fill-white" style={{ stroke: 'var(--atlas-border)' }} />
                {/* La città che è anche la capitale prende il nome dalla stella */}
                {!nearCapital(capital, c) && (
                  <text x={pt[0] + 6} y={pt[1] + 4} className="text-[11px] font-semibold fill-slate-700 dark:fill-slate-200" style={{ paintOrder: 'stroke', stroke: 'var(--surface-1)', strokeWidth: 3 }}>
                    {c.city}
                  </text>
                )}
              </g>
            );
          })}
        {capitalPoint && capital && (
          <g transform={`translate(${capitalPoint[0]} ${capitalPoint[1]})`} className="pointer-events-none">
            <CapitalMarker capital={capital} showLabel={!(homePoint && homeLabel && nearCapital(capital, homeCoords))} />
          </g>
        )}
        {homePoint && (
          <g transform={`translate(${homePoint[0]} ${homePoint[1]})`} className="pointer-events-none">
            <circle r={10} strokeWidth={1.5} style={{ fill: 'var(--atlas-home)', stroke: 'var(--atlas-border)' }} />
            <House x={-6} y={-6} width={12} height={12} strokeWidth={2.4} className="text-white" />
            {homeLabel && true && (
              <text
                x={15}
                y={4}
                className="text-[11px] font-semibold fill-slate-700 dark:fill-slate-100"
                style={{ paintOrder: 'stroke', stroke: 'var(--atlas-land)', strokeWidth: 3 }}
              >
                {homeLabel}
              </text>
            )}
          </g>
        )}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-slate-900/90 text-white text-xs px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={
            hover.x > width / 2
              ? { right: width - hover.x + 12, top: hover.y + 12 }
              : { left: hover.x + 12, top: hover.y + 12 }
          }
        >
          {flags?.[hover.name] && (
            <img
              src={flags[hover.name]}
              alt=""
              className={`inline-block h-[16px] w-auto mr-1.5 -mt-0.5 align-middle ${isShapedRegionFlag(hover.name) ? '' : 'rounded-[2px]'}`}
            />
          )}
          <span className="font-semibold">{regionLabel(hover.name)}</span>
        </div>
      )}
    </div>
  );
};
