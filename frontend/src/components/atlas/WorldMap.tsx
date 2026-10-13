import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import {
  geoDistance,
  geoGraticule10,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
  type GeoProjection,
} from 'd3-geo';
import { countryCenter, mainPart, type GeoFeature, type WorldGeo } from '@/lib/atlasGeo';
import type { AtlasCity, AtlasCountry, CountryStatus } from '@/lib/atlas';

export type MapView = 'globe' | 'flat';
type MapStatus = CountryStatus | 'home';

interface WorldMapProps {
  /** Confini già caricati dalla pagina (loadWorldGeo). */
  geo: WorldGeo;
  view: MapView;
  countries: Map<string, AtlasCountry>;
  cities: AtlasCity[];
  homeCode: string | null;
  selected: string | null;
  onSelect: (code: string | null) => void;
  countryName: (code: string) => string;
  /** Chiamata quando l'animazione verso il paese selezionato è finita. */
  onFocusSettled?: (code: string) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const SPHERE = { type: 'Sphere' } as const;

const FILL: Record<MapStatus, string> = {
  visited: 'var(--atlas-visited)',
  transit: 'url(#atlas-transit)',
  planned: 'var(--atlas-planned)',
  home: 'var(--atlas-home)',
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Distanza angolare (radianti) del vertice più lontano dal centro del paese. */
const angularRadius = (f: GeoFeature, center: [number, number]): number => {
  const g = f.geometry;
  const pts = g.type === 'Polygon' ? g.coordinates.flat() : g.type === 'MultiPolygon' ? g.coordinates.flat(2) : [];
  return pts.reduce((m, p) => Math.max(m, geoDistance(center, [p[0], p[1]])), 0) || 0.03;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const WorldMap: React.FC<WorldMapProps> = ({
  geo,
  view,
  countries,
  cities,
  homeCode,
  selected,
  onSelect,
  countryName,
  onFocusSettled,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  // Stato della vista: rotazione del globo, zoom e spostamento del planisfero.
  const [rotation, setRotation] = useState<[number, number]>([-12, -30]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<[number, number]>([0, 0]);
  const [spinning, setSpinning] = useState(() => !prefersReducedMotion());
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Cambiando vista si riparte dalla visuale d'insieme.
  useEffect(() => {
    setZoom(1);
    setPan([0, 0]);
  }, [view]);

  const height = view === 'globe' ? Math.min(width, 620) : Math.round(width * 0.52);

  const projection = useMemo<GeoProjection>(() => {
    if (view === 'globe') {
      const radius = (Math.min(width, height) / 2) * 0.92;
      return geoOrthographic()
        .scale(radius * zoom)
        .translate([width / 2, height / 2])
        .rotate([rotation[0], rotation[1], 0])
        .clipAngle(90)
        .precision(0.5);
    }
    const p = geoNaturalEarth1().fitSize([width, height], SPHERE);
    const [tx, ty] = p.translate();
    // Zoom attorno al centro della mappa, più lo spostamento trascinato.
    return p
      .scale(p.scale() * zoom)
      .translate([width / 2 + (tx - width / 2) * zoom + pan[0], height / 2 + (ty - height / 2) * zoom + pan[1]]);
  }, [view, width, height, zoom, pan, rotation]);

  const path = useMemo(() => geoPath(projection), [projection]);

  // Centro visibile del globo, per nascondere punti sul lato opposto.
  const center: [number, number] = [-rotation[0], -rotation[1]];
  const isVisible = useCallback(
    (lon: number, lat: number) => view === 'flat' || geoDistance([lon, lat], center) < Math.PI / 2 - 0.02,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, rotation[0], rotation[1]]
  );

  const statusOf = useCallback(
    (code: string | null): MapStatus | null => {
      if (!code) return null;
      const c = countries.get(code);
      if (c) return c.status;
      return code === homeCode ? 'home' : null;
    },
    [countries, homeCode]
  );

  // Rotazione lenta del globo finché l'utente non lo tocca.
  useEffect(() => {
    if (view !== 'globe' || !spinning) return;
    let frame = 0;
    const tick = () => {
      setRotation(([l, p]) => [l + 0.08, p]);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [view, spinning]);

  // Selezionando un paese (dalla mappa o dall'elenco) la vista vola fino a lui:
  // sul globo rotazione + zoom insieme, sul planisfero zoom + spostamento.
  // Deselezionando si torna alla vista d'insieme con la stessa animazione.
  // A fine corsa `onFocusSettled` avvisa la pagina (che poi mostra le regioni).
  const onFocusSettledRef = useRef(onFocusSettled);
  onFocusSettledRef.current = onFocusSettled;
  useEffect(() => {
    const fromRot = rotation;
    const fromZoom = zoom;
    const fromPan = pan;
    let toRot: [number, number] = fromRot;
    let toZoom = 1;
    let toPan: [number, number] = [0, 0];

    if (selected) {
      setSpinning(false);
      const found = geo.features.find((x) => x.code === selected);
      const f = found ? mainPart(found) : null;
      const c = countryCenter(geo, selected);
      if (!c) return;
      if (view === 'globe') {
        toRot = [-c[0], Math.max(-70, Math.min(70, -c[1]))];
        // Raggio angolare del paese: il più lontano dei suoi vertici dal centro.
        const a = f ? angularRadius(f, c) : 0.03;
        toZoom = clamp(0.85 / Math.sin(Math.min(a, Math.PI / 2)), MIN_ZOOM, MAX_ZOOM);
      } else {
        const base = geoNaturalEarth1().fitSize([width, height], SPHERE);
        const pt = base(c) ?? [width / 2, height / 2];
        const b = f ? geoPath(base).bounds(f) : [[pt[0] - 4, pt[1] - 4], [pt[0] + 4, pt[1] + 4]];
        const bw = Math.max(b[1][0] - b[0][0], 1);
        const bh = Math.max(b[1][1] - b[0][1], 1);
        toZoom = clamp(Math.min((0.7 * width) / bw, (0.7 * height) / bh), MIN_ZOOM, MAX_ZOOM);
        const cx = (b[0][0] + b[1][0]) / 2;
        const cy = (b[0][1] + b[1][1]) / 2;
        toPan = [-(cx - width / 2) * toZoom, -(cy - height / 2) * toZoom];
      }
    } else if (fromZoom === 1 && fromPan[0] === 0 && fromPan[1] === 0) {
      return;
    }

    // percorso più breve in longitudine
    const dl = ((toRot[0] - fromRot[0] + 540) % 360) - 180;
    const duration = prefersReducedMotion() ? 0 : 900;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const k = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // ease-in-out cubica
      setRotation([fromRot[0] + dl * e, fromRot[1] + (toRot[1] - fromRot[1]) * e]);
      // zoom interpolato in scala logaritmica: la velocità percepita resta costante
      setZoom(fromZoom * Math.pow(toZoom / fromZoom, e));
      setPan([fromPan[0] + (toPan[0] - fromPan[0]) * e, fromPan[1] + (toPan[1] - fromPan[1]) * e]);
      if (k < 1) frame = requestAnimationFrame(step);
      else if (selected) onFocusSettledRef.current?.(selected);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, geo, view]);

  // Zoom con pinch del trackpad / Ctrl+rotella: la rotella semplice continua a scorrere la pagina.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * Math.exp(-e.deltaY * 0.01))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
    setSpinning(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    if (view === 'globe') {
      const k = 0.25 / zoom;
      setRotation(([l, p]) => [l + dx * k, Math.max(-80, Math.min(80, p - dy * k))]);
    } else {
      setPan(([x, y]) => [x + dx, y + dy]);
    }
  };
  const onPointerUp = () => {
    // il click su un paese arriva comunque: `moved` dice se era un trascinamento
    setTimeout(() => (drag.current = null), 0);
  };
  const handleCountryClick = (code: string | null) => {
    if ((drag.current?.moved ?? 0) > 5) return;
    onSelect(code && code === selected ? null : code);
  };

  const resetView = () => {
    setZoom(1);
    setPan([0, 0]);
    setRotation([-12, -30]);
    onSelect(null);
  };

  // Paesi senza poligono a questa risoluzione (Malta, Singapore, Andorra...):
  // un puntino nel loro centro, solo se hanno uno stato da mostrare.
  const tinyCountries = useMemo(() => {
    const withShape = new Set(geo.features.map((f) => f.code).filter(Boolean));
    const codes = new Set([...countries.keys(), ...(homeCode ? [homeCode] : [])]);
    return [...codes]
      .filter((code) => !withShape.has(code))
      .map((code) => ({ code, latlng: geo.index.find((c) => c.code === code)?.latlng ?? null }))
      .filter((c): c is { code: string; latlng: [number, number] } => !!c.latlng);
  }, [geo, countries, homeCode]);

  const hoverStatus = hover ? statusOf(hover.code) : null;

  return (
    <div ref={containerRef} className="relative w-full select-none" style={{ height }}>
      <svg
        width={width}
        height={height}
        className="touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={t('atlas.mapLabel')}
      >
        <defs>
          {/* Tratteggio per i paesi di solo scalo: stesso oro dei visitati, ma "a righe" */}
          <pattern id="atlas-transit" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" style={{ fill: 'var(--atlas-land)' }} />
            <line x1="0" y1="0" x2="0" y2="5" strokeWidth="2.5" style={{ stroke: 'var(--atlas-visited)' }} />
          </pattern>
          <radialGradient id="atlas-shade" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </radialGradient>
        </defs>

        <path d={path(SPHERE) ?? undefined} style={{ fill: 'var(--atlas-ocean)' }} onClick={() => handleCountryClick(null)} />
        <path
          d={path(geoGraticule10()) ?? undefined}
          fill="none"
          strokeWidth={0.5}
          className="pointer-events-none"
          style={{ stroke: 'var(--border-subtle)' }}
        />

        {geo.features.map((f, i) => {
          const status = statusOf(f.code);
          const isSelected = !!f.code && f.code === selected;
          const d = path(f);
          if (!d) return null;
          return (
            <path
              key={`${f.id ?? f.properties.name}-${i}`}
              d={d}
              onClick={() => handleCountryClick(f.code)}
              onPointerMove={(e) => {
                if (!f.code || drag.current) return;
                const box = containerRef.current?.getBoundingClientRect();
                if (box) setHover({ code: f.code, x: e.clientX - box.left, y: e.clientY - box.top });
              }}
              onPointerLeave={() => setHover(null)}
              className="transition-[filter] duration-150 hover:brightness-110 cursor-pointer"
              strokeWidth={isSelected ? 1.8 : 0.5}
              style={{
                fill: status ? FILL[status] : 'var(--atlas-land)',
                stroke: isSelected ? '#003366' : 'var(--atlas-border)',
              }}
            />
          );
        })}

        {/* Paesi piccoli: anello nel colore del loro stato */}
        {tinyCountries.map(({ code, latlng }) => {
          const status = statusOf(code);
          if (!status || !isVisible(latlng[1], latlng[0])) return null;
          const pt = projection([latlng[1], latlng[0]]);
          if (!pt) return null;
          return (
            <circle
              key={code}
              cx={pt[0]}
              cy={pt[1]}
              r={code === selected ? 6 : 4.5}
              strokeWidth={1.5}
              onClick={() => handleCountryClick(code)}
              onPointerMove={(e) => {
                const box = containerRef.current?.getBoundingClientRect();
                if (box) setHover({ code, x: e.clientX - box.left, y: e.clientY - box.top });
              }}
              onPointerLeave={() => setHover(null)}
              className="cursor-pointer"
              style={{ fill: FILL[status], stroke: 'var(--atlas-border)' }}
            />
          );
        })}

        {/* Città visitate */}
        {cities
          .filter((c) => c.visited && isVisible(c.lon, c.lat))
          .map((c) => {
            const pt = projection([c.lon, c.lat]);
            if (!pt) return null;
            return (
              <circle
                key={c.key}
                cx={pt[0]}
                cy={pt[1]}
                r={2.2}
                strokeWidth={1}
                className="pointer-events-none fill-deep-blue dark:fill-white"
                style={{ stroke: 'var(--atlas-border)' }}
              />
            );
          })}

        {view === 'globe' && (
          <path d={path(SPHERE) ?? undefined} fill="url(#atlas-shade)" className="pointer-events-none" />
        )}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-slate-900/90 text-white text-xs px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <span className="font-semibold">{countryName(hover.code)}</span>
          {hoverStatus && <span className="text-white/70"> · {t(`atlas.status.${hoverStatus}`)}</span>}
        </div>
      )}

      {/* Controlli: zoom e ritorno alla vista iniziale */}
      <div className="absolute right-3 bottom-3 flex flex-col gap-1.5">
        {[
          { icon: Plus, label: t('atlas.zoomIn'), onClick: () => setZoom((z) => Math.min(MAX_ZOOM, z * 1.5)) },
          { icon: Minus, label: t('atlas.zoomOut'), onClick: () => setZoom((z) => Math.max(MIN_ZOOM, z / 1.5)) },
          { icon: RotateCcw, label: t('atlas.resetView'), onClick: resetView },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--surface-1)]/90 backdrop-blur border border-[var(--border-subtle)] text-slate-600 dark:text-slate-300 hover:text-gold hover:border-gold/50 shadow-md transition-colors cursor-pointer"
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
};
