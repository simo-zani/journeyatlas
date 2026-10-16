import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { House, Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import {
  geoContains,
  geoDistance,
  geoGraticule10,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
  type GeoProjection,
} from 'd3-geo';
import { CountryFlag } from '@/components/CountryFlag';
import { CapitalMarker } from '@/components/atlas/CapitalMarker';
import { nearCapital, type Capital } from '@/lib/capitals';
import { countryCenter, countryKind, mainPart, type GeoFeature, type WorldGeo } from '@/lib/atlasGeo';
import type { AtlasCity, AtlasCountry, CountryStatus } from '@/lib/atlas';
import type { Coordinates } from '@/lib/types';

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
  /** Città di casa dal profilo: segnata con l'icona di una casa. */
  homeCoords?: Coordinates | null;
  /** Nome della città di casa, mostrato accanto all'icona dentro il suo paese. */
  homeLabel?: string | null;
  /** Capitale del paese selezionato: segnata con una stella. */
  capital?: Capital | null;
}

/** Colori del lampeggio del paese selezionato: dal suo colore pieno a una
 * versione stemperata verso la terra (per i non visitati: dalla terra a un
 * tono più chiaro). Il tratteggio degli scali è un pattern e non si può
 * mescolare: lì lampeggia l'opacità. */
const pulseStyle = (status: MapStatus | null): React.CSSProperties => {
  if (status === 'transit') return { animationName: 'atlas-pulse-opacity' };
  const base = status ? FILL[status] : 'var(--atlas-land)';
  const soft = status
    ? `color-mix(in srgb, ${base} 45%, var(--atlas-land))`
    : 'color-mix(in srgb, var(--atlas-land) 65%, #ffffff)';
  return { ['--pulse-a' as string]: base, ['--pulse-b' as string]: soft } as React.CSSProperties;
};

/** Inquadratura: rotazione del globo, zoom, spostamento del planisfero. */
interface Camera {
  rotation: [number, number];
  zoom: number;
  pan: [number, number];
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
/** Zoom massimo quando è aperto un paese piccolo (Maldive, Seychelles...): le isole si vedono. */
const MAX_ZOOM_SMALL = 28;
const SPHERE = { type: 'Sphere' } as const;
const GRATICULE = geoGraticule10();
const INITIAL_ROTATION: [number, number] = [-12, -30];
/** Velocità della rotazione automatica, legata al giro vero della Terra (15° = un
 * fuso orario all'ora): qui 10 secondi = 1 ora reale, quindi un fuso ogni 10
 * secondi e un giro completo in 4 minuti. Il verso è quello reale, da ovest verso est. */
const SECONDS_PER_TIME_ZONE = 10;
const SPIN_DEG_PER_MS = 15 / (SECONDS_PER_TIME_ZONE * 1000);

/** Sotto questo ingombro (px) la forma di un paese piccolo si segna anche con un puntino. */
const TINY_SHAPE_PX = 10;
/** Contorno (px) dei paesi piccoli nel loro stesso colore: le isole minuscole restano visibili. */
const SMALL_OUTLINE_PX = 2.5;

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

const makeProjection = (view: MapView, width: number, height: number, cam: Camera): GeoProjection => {
  if (view === 'globe') {
    const radius = (Math.min(width, height) / 2) * 0.92;
    return geoOrthographic()
      .scale(radius * cam.zoom)
      .translate([width / 2, height / 2])
      .rotate([cam.rotation[0], cam.rotation[1], 0])
      .clipAngle(90)
      .precision(0.5);
  }
  const p = geoNaturalEarth1().fitSize([width, height], SPHERE);
  const [tx, ty] = p.translate();
  // Zoom attorno al centro della mappa, più lo spostamento trascinato.
  return p
    .scale(p.scale() * cam.zoom)
    .translate([
      width / 2 + (tx - width / 2) * cam.zoom + cam.pan[0],
      height / 2 + (ty - height / 2) * cam.zoom + cam.pan[1],
    ]);
};

/**
 * Mappa del mondo (globo o planisfero).
 *
 * Le animazioni (rotazione automatica, volo verso un paese, trascinamento, zoom)
 * NON passano dallo stato di React: l'inquadratura vive in una ref e `draw()`
 * aggiorna direttamente gli attributi dell'SVG a ogni fotogramma. Con uno
 * setState per fotogramma la pagina restava sempre "occupata" e le navigazioni
 * di React Router (che sono transizioni a bassa priorità) non arrivavano mai a
 * compimento: cliccando "I miei viaggi" cambiava l'URL ma non la pagina.
 * React ridisegna solo quando cambiano i dati (stati, selezione, hover).
 */
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
  homeCoords = null,
  homeLabel = null,
  capital = null,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);

  const cam = useRef<Camera>({ rotation: INITIAL_ROTATION, zoom: 1, pan: [0, 0] });
  // La rotazione automatica vive in una ref (letta a ogni fotogramma); lo stato serve
  // solo all'icona del pulsante pausa/riprendi.
  const spinning = useRef(!prefersReducedMotion());
  const [spinOn, setSpinOn] = useState(spinning.current);
  const setSpin = useCallback((on: boolean) => {
    spinning.current = on;
    setSpinOn(on);
  }, []);

  // Elementi SVG aggiornati da draw()
  const sphereEl = useRef<SVGPathElement>(null);
  const graticuleEl = useRef<SVGPathElement>(null);
  const shadeEl = useRef<SVGPathElement>(null);
  const countryEls = useRef<(SVGPathElement | null)[]>([]);
  const tinyEls = useRef(new Map<string, SVGCircleElement>());
  const cityEls = useRef(new Map<string, SVGCircleElement>());
  const labelEls = useRef(new Map<string, SVGTextElement>());
  const homeEl = useRef<SVGGElement>(null);
  const capitalEl = useRef<SVGGElement>(null);

  const height = view === 'globe' ? Math.min(width, 620) : Math.round(width * 0.52);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const statusOf = useCallback(
    (code: string | null): MapStatus | null => {
      if (!code) return null;
      const c = countries.get(code);
      if (c) return c.status;
      return code === homeCode ? 'home' : null;
    },
    [countries, homeCode]
  );

  // Paesi piccoli (Malta, Maldive, Seychelles, Capo Verde...): da lontano la loro forma
  // è più piccola di un pixel, quindi un puntino nel loro centro, che sparisce quando,
  // zoomando, la forma si vede (draw). Chi non ha proprio una forma tiene sempre il puntino.
  // Gli stati sovrani si segnano sempre, i territori minori solo se hanno uno stato.
  const tinyCountries = useMemo(() => {
    const withShape = new Set(geo.features.filter((f) => !f.small).map((f) => f.code).filter(Boolean));
    const smallShape = new Map<string, number>();
    geo.features.forEach((f, i) => f.small && f.code && smallShape.set(f.code, i));
    const sovereign = geo.index.filter((c) => countryKind(c.code, geo.index) === 'sovereign').map((c) => c.code);
    const codes = new Set([...sovereign, ...countries.keys(), ...(homeCode ? [homeCode] : [])]);
    return [...codes]
      .filter((code) => !withShape.has(code))
      .map((code) => ({
        code,
        latlng: geo.index.find((c) => c.code === code)?.latlng ?? null,
        shape: smallShape.get(code) ?? null,
      }))
      .filter((c): c is { code: string; latlng: [number, number]; shape: number | null } => !!c.latlng);
  }, [geo, countries, homeCode]);

  // Città visitate e di scalo (queste solo come pallino sulla mappa)
  const visitedCities = useMemo(() => cities.filter((c) => c.visited || c.transit), [cities]);
  // Paese in cui si trova casa: il suo nome compare (come per le mete) quando ci si entra.
  const homeCountry = useMemo(
    () =>
      homeCoords
        ? (geo.features.find((f) => f.code && geoContains(f, [homeCoords.lon, homeCoords.lat]))?.code ?? null)
        : null,
    [geo, homeCoords]
  );
  // Entrando in un paese se ne mostrano i nomi delle città visitate.
  const labeledCities = useMemo(
    // La città che è anche la capitale prende il nome dalla stella.
    () => (selected ? visitedCities.filter((c) => c.countryCode === selected && !nearCapital(capital, c)) : []),
    [visitedCities, selected, capital]
  );

  // Valori correnti letti da draw(), che resta stabile (nessuna dipendenza).
  const latest = useRef({ view, width, height, tinyCountries, visitedCities, labeledCities, homeCoords, capital, features: geo.features });
  latest.current = { view, width, height, tinyCountries, visitedCities, labeledCities, homeCoords, capital, features: geo.features };

  const draw = useCallback(() => {
    const { view: v, width: w, height: h, tinyCountries: tiny, visitedCities: vc, labeledCities: lc, homeCoords: home, capital: cap, features } =
      latest.current;
    const projection = makeProjection(v, w, h, cam.current);
    const path = geoPath(projection);
    sphereEl.current?.setAttribute('d', path(SPHERE) ?? '');
    graticuleEl.current?.setAttribute('d', path(GRATICULE) ?? '');
    shadeEl.current?.setAttribute('d', path(SPHERE) ?? '');
    features.forEach((f, i) => countryEls.current[i]?.setAttribute('d', path(f) ?? ''));

    // Sul globo i punti sul lato nascosto non si disegnano.
    const center: [number, number] = [-cam.current.rotation[0], -cam.current.rotation[1]];
    const pointAt = (lon: number, lat: number) => {
      const visible = v === 'flat' || geoDistance([lon, lat], center) < Math.PI / 2 - 0.02;
      return visible ? projection([lon, lat]) : null;
    };
    const place = (el: SVGCircleElement | undefined, lon: number, lat: number) => {
      if (!el) return;
      const pt = pointAt(lon, lat);
      if (!pt) {
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      el.setAttribute('cx', String(pt[0]));
      el.setAttribute('cy', String(pt[1]));
    };
    tiny.forEach(({ code, latlng, shape }) => {
      const el = tinyEls.current.get(code);
      if (!el) return;
      if (shape !== null) {
        // La forma si vede già (le isole hanno un contorno che le ingrandisce): il puntino non serve più.
        const [[x0, y0], [x1, y1]] = path.bounds(features[shape]);
        if (Math.max(x1 - x0, y1 - y0) >= TINY_SHAPE_PX) {
          el.style.display = 'none';
          return;
        }
      }
      place(el, latlng[1], latlng[0]);
    });
    vc.forEach((c) => place(cityEls.current.get(c.key), c.lon, c.lat));
    lc.forEach((c) => {
      const el = labelEls.current.get(c.key);
      if (!el) return;
      const pt = pointAt(c.lon, c.lat);
      el.style.display = pt ? '' : 'none';
      if (pt) {
        el.setAttribute('x', String(pt[0] + 7));
        el.setAttribute('y', String(pt[1] + 4));
      }
    });
    if (homeEl.current) {
      const pt = home ? pointAt(home.lon, home.lat) : null;
      homeEl.current.style.display = pt ? '' : 'none';
      if (pt) homeEl.current.setAttribute('transform', `translate(${pt[0]} ${pt[1]})`);
    }
    if (capitalEl.current) {
      const pt = cap ? pointAt(cap.lon, cap.lat) : null;
      capitalEl.current.style.display = pt ? '' : 'none';
      if (pt) capitalEl.current.setAttribute('transform', `translate(${pt[0]} ${pt[1]})`);
    }
  }, []);

  // Zoom fluido in corso (vedi zoomBy): obiettivo, punto d'ancoraggio e fotogramma.
  const zoomGoal = useRef<number | null>(null);
  const zoomAnchor = useRef<[number, number] | null>(null);
  const zoomFrame = useRef(0);
  const cancelZoom = useCallback(() => {
    cancelAnimationFrame(zoomFrame.current);
    zoomFrame.current = 0;
    zoomGoal.current = null;
  }, []);

  // Dopo ogni render (dati, dimensioni, selezione) si ridisegna con l'inquadratura corrente.
  useLayoutEffect(() => {
    draw();
  });

  // Cambiando vista si riparte dalla visuale d'insieme.
  useEffect(() => {
    cancelZoom();
    cam.current = { ...cam.current, zoom: 1, pan: [0, 0] };
    draw();
  }, [view, draw, cancelZoom]);

  // Rotazione lenta del globo finché l'utente non lo tocca.
  useEffect(() => {
    if (view !== 'globe') return;
    let frame = 0;
    let last: number | null = null;
    // Avanza in base al tempo trascorso, non ai fotogrammi: stessa velocità a 60, 120 o 144 Hz.
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min(now - last, 100);
      last = now;
      if (spinning.current) {
        const [l, p] = cam.current.rotation;
        cam.current = { ...cam.current, rotation: [l + dt * SPIN_DEG_PER_MS, p] };
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [view, draw]);

  // Selezionando un paese (dalla mappa o dall'elenco) la vista vola fino a lui:
  // sul globo rotazione + zoom insieme, sul planisfero zoom + spostamento.
  // Deselezionando si torna alla vista d'insieme con la stessa animazione.
  // A fine corsa `onFocusSettled` avvisa la pagina.
  const selectedSmall = !!selected && geo.features.some((f) => f.small && f.code === selected);
  const maxZoom = useRef(MAX_ZOOM);
  maxZoom.current = selectedSmall ? MAX_ZOOM_SMALL : MAX_ZOOM;
  const onFocusSettledRef = useRef(onFocusSettled);
  onFocusSettledRef.current = onFocusSettled;
  useEffect(() => {
    cancelZoom();
    const from = cam.current;
    let toRot: [number, number] = from.rotation;
    let toZoom = 1;
    let toPan: [number, number] = [0, 0];
    const { width: w, height: h } = latest.current;

    if (selected) {
      setSpin(false);
      const found = geo.features.find((x) => x.code === selected);
      const f = found ? mainPart(found) : null;
      const c = countryCenter(geo, selected);
      if (!c) return;
      if (view === 'globe') {
        toRot = [-c[0], clamp(-c[1], -70, 70)];
        const a = f ? angularRadius(f, c) : 0.03;
        toZoom = clamp(0.85 / Math.sin(Math.min(a, Math.PI / 2)), MIN_ZOOM, maxZoom.current);
      } else {
        const base = geoNaturalEarth1().fitSize([w, h], SPHERE);
        const pt = base(c) ?? [w / 2, h / 2];
        const b = f ? geoPath(base).bounds(f) : [[pt[0] - 4, pt[1] - 4], [pt[0] + 4, pt[1] + 4]];
        const bw = Math.max(b[1][0] - b[0][0], 1);
        const bh = Math.max(b[1][1] - b[0][1], 1);
        toZoom = clamp(Math.min((0.7 * w) / bw, (0.7 * h) / bh), MIN_ZOOM, maxZoom.current);
        const cx = (b[0][0] + b[1][0]) / 2;
        const cy = (b[0][1] + b[1][1]) / 2;
        toPan = [-(cx - w / 2) * toZoom, -(cy - h / 2) * toZoom];
      }
    } else if (from.zoom === 1 && from.pan[0] === 0 && from.pan[1] === 0) {
      return;
    }

    // percorso più breve in longitudine
    const dl = ((toRot[0] - from.rotation[0] + 540) % 360) - 180;
    const duration = prefersReducedMotion() ? 0 : 900;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const k = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // ease-in-out cubica
      cam.current = {
        rotation: [from.rotation[0] + dl * e, from.rotation[1] + (toRot[1] - from.rotation[1]) * e],
        // zoom interpolato in scala logaritmica: la velocità percepita resta costante
        zoom: from.zoom * Math.pow(toZoom / from.zoom, e),
        pan: [from.pan[0] + (toPan[0] - from.pan[0]) * e, from.pan[1] + (toPan[1] - from.pan[1]) * e],
      };
      draw();
      if (k < 1) frame = requestAnimationFrame(step);
      else if (selected) onFocusSettledRef.current?.(selected);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [selected, geo, view, draw, setSpin, cancelZoom]);

  // Zoom fluido: rotella, pinch e pulsanti spostano solo l'obiettivo (zoomGoal);
  // a ogni fotogramma l'inquadratura ci si avvicina un po' (smorzamento esponenziale),
  // quindi tanti piccoli scatti della rotella diventano un unico movimento continuo.
  // Sul planisfero lo zoom resta ancorato al punto sotto il cursore (o al centro).
  const applyZoom = useCallback((next: number) => {
    const c = cam.current;
    const { view: v, width: w, height: h } = latest.current;
    let pan = c.pan;
    if (v === 'flat') {
      // il punto sotto l'ancora resta fermo sullo schermo mentre la scala cambia
      const [ax, ay] = zoomAnchor.current ?? [w / 2, h / 2];
      const r = next / c.zoom;
      pan = [ax - w / 2 - (ax - w / 2 - c.pan[0]) * r, ay - h / 2 - (ay - h / 2 - c.pan[1]) * r];
    }
    cam.current = { ...c, zoom: next, pan };
  }, []);
  const zoomBy = useCallback(
    (factor: number, anchor: [number, number] | null = null) => {
      const goal = clamp((zoomGoal.current ?? cam.current.zoom) * factor, MIN_ZOOM, maxZoom.current);
      zoomGoal.current = goal;
      zoomAnchor.current = anchor;
      if (prefersReducedMotion()) {
        applyZoom(goal);
        cancelZoom();
        draw();
        return;
      }
      if (zoomFrame.current) return;
      let last = performance.now();
      const step = (now: number) => {
        const target = zoomGoal.current;
        if (target === null) return;
        const dt = Math.min(now - last, 64);
        last = now;
        const z = cam.current.zoom;
        // ~90 ms di costante di tempo, in scala logaritmica: stessa sensazione a ogni livello di zoom
        const k = 1 - Math.exp(-dt / 90);
        const done = Math.abs(Math.log(target / z)) < 0.002;
        applyZoom(done ? target : z * Math.pow(target / z, k));
        draw();
        if (done) {
          zoomFrame.current = 0;
          zoomGoal.current = null;
        } else zoomFrame.current = requestAnimationFrame(step);
      };
      zoomFrame.current = requestAnimationFrame(step);
    },
    [draw, applyZoom, cancelZoom]
  );
  useEffect(() => cancelZoom, [cancelZoom]);

  // Zoom con pinch del trackpad / Ctrl+rotella: la rotella semplice continua a scorrere la pagina.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      // Delta in pixel (le righe valgono ~16 px). Uno scatto della rotella (~100 px)
      // vale circa ×1.3; il pinch, a piccoli passi, resta proporzionale al gesto.
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      const box = el.getBoundingClientRect();
      zoomBy(Math.exp(-clamp(delta, -30, 30) * 0.009), [e.clientX - box.left, e.clientY - box.top]);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
    setSpin(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    const c = cam.current;
    if (view === 'globe') {
      const k = 0.25 / c.zoom;
      cam.current = { ...c, rotation: [c.rotation[0] + dx * k, clamp(c.rotation[1] - dy * k, -80, 80)] };
    } else {
      cam.current = { ...c, pan: [c.pan[0] + dx, c.pan[1] + dy] };
    }
    draw();
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
    cancelZoom();
    cam.current = { rotation: INITIAL_ROTATION, zoom: 1, pan: [0, 0] };
    draw();
    onSelect(null);
  };

  const showHover = (code: string) => (e: React.PointerEvent) => {
    if (drag.current) return;
    const box = containerRef.current?.getBoundingClientRect();
    if (box) setHover({ code, x: e.clientX - box.left, y: e.clientY - box.top });
  };


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

        <path ref={sphereEl} style={{ fill: 'var(--atlas-ocean)' }} onClick={() => handleCountryClick(null)} />
        <path
          ref={graticuleEl}
          fill="none"
          strokeWidth={0.5}
          className="pointer-events-none"
          style={{ stroke: 'var(--border-subtle)' }}
        />

        {geo.features.map((f, i) => {
          const status = statusOf(f.code);
          const isSelected = !!f.code && f.code === selected;
          return (
            <path
              key={`${f.id ?? f.properties.name}-${i}`}
              ref={(el) => {
                countryEls.current[i] = el;
              }}
              onClick={() => handleCountryClick(f.code)}
              onPointerMove={f.code ? showHover(f.code) : undefined}
              onPointerLeave={() => setHover(null)}
              className={`transition-[filter] duration-150 hover:brightness-110 cursor-pointer ${isSelected ? 'atlas-pulse' : ''}`}
              strokeWidth={isSelected ? (f.small || f.islets ? 2 : 1.5) : f.small || f.islets ? SMALL_OUTLINE_PX : 0.5}
              strokeLinejoin="round"
              style={{
                fill: status ? FILL[status] : 'var(--atlas-land)',
                // Paesi piccoli e isole: contorno nel loro colore, così anche gli atolli si vedono.
                stroke: isSelected
                  ? 'var(--atlas-selected-stroke)'
                  : f.small || f.islets
                    ? status
                      ? FILL[status]
                      : 'var(--atlas-land)'
                    : 'var(--atlas-border)',
                ...(isSelected ? pulseStyle(status) : null),
              }}
            />
          );
        })}

        {/* Paesi piccoli: pallino nel colore del loro stato */}
        {tinyCountries.map(({ code }) => {
          const status = statusOf(code);
          return (
            <circle
              key={code}
              ref={(el) => {
                if (el) tinyEls.current.set(code, el);
                else tinyEls.current.delete(code);
              }}
              r={code === selected ? 6 : status ? 4.5 : 3.5}
              strokeWidth={1.5}
              onClick={() => handleCountryClick(code)}
              onPointerMove={showHover(code)}
              onPointerLeave={() => setHover(null)}
              className={`cursor-pointer ${code === selected ? 'atlas-pulse' : ''}`}
              style={{
                fill: status ? FILL[status] : 'var(--atlas-land)',
                stroke: 'var(--atlas-border)',
                ...(code === selected ? pulseStyle(status) : null),
              }}
            />
          );
        })}

        {/* Città visitate */}
        {visitedCities.map((c) => (
          <circle
            key={c.key}
            ref={(el) => {
              if (el) cityEls.current.set(c.key, el);
              else cityEls.current.delete(c.key);
            }}
            r={3.4}
            strokeWidth={1.2}
            className="pointer-events-none fill-deep-blue dark:fill-white"
            style={{ stroke: 'var(--atlas-border)' }}
          />
        ))}

        {/* Nomi delle città del paese in cui si è entrati */}
        {labeledCities.map((c) => (
          <text
            key={c.key}
            ref={(el) => {
              if (el) labelEls.current.set(c.key, el);
              else labelEls.current.delete(c.key);
            }}
            className="pointer-events-none text-[11px] font-semibold fill-slate-700 dark:fill-slate-100"
            style={{ paintOrder: 'stroke', stroke: 'var(--atlas-land)', strokeWidth: 3 }}
          >
            {c.city}
          </text>
        ))}

        {/* Capitale del paese selezionato */}
        {capital && selected && (
          <g ref={capitalEl} className="pointer-events-none">
            <CapitalMarker capital={capital} showLabel={!(homeLabel && nearCapital(capital, homeCoords))} />
          </g>
        )}

        {/* Casa (città di casa dal profilo) */}
        {homeCoords && (
          <g ref={homeEl} className="pointer-events-none">
            <circle r={10} strokeWidth={1.5} style={{ fill: 'var(--atlas-home)', stroke: 'var(--atlas-border)' }} />
            <House x={-6} y={-6} width={12} height={12} strokeWidth={2.4} className="text-white" />
            {homeLabel && !!selected && selected === homeCountry && (
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

        {view === 'globe' && <path ref={shadeEl} fill="url(#atlas-shade)" className="pointer-events-none" />}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 flex items-center gap-2 rounded-lg bg-slate-900/90 text-white text-xs px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={
            hover.x > width / 2
              ? { right: width - hover.x + 12, top: hover.y + 12 }
              : { left: hover.x + 12, top: hover.y + 12 }
          }
        >
          <CountryFlag code={hover.code} size="xs" />
          <span className="font-semibold">{countryName(hover.code)}</span>
        </div>
      )}

      {/* Controlli: zoom e ritorno alla vista iniziale */}
      <div className="absolute right-3 bottom-3 flex flex-col gap-1.5">
        {[
          { icon: Plus, label: t('atlas.zoomIn'), onClick: () => zoomBy(1.5) },
          { icon: Minus, label: t('atlas.zoomOut'), onClick: () => zoomBy(1 / 1.5) },
          { icon: RotateCcw, label: t('atlas.resetView'), onClick: resetView },
          ...(view === 'globe'
            ? [
                spinOn
                  ? { icon: Pause, label: t('atlas.pauseRotation'), onClick: () => setSpin(false) }
                  : { icon: Play, label: t('atlas.resumeRotation'), onClick: () => setSpin(true) },
              ]
            : []),
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
