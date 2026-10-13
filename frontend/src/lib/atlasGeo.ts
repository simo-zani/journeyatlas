// ===========================================================================
// Geografia dell'atlante: confini del mondo, stati a riconoscimento limitato e
// regioni. Tutto si scarica una volta per sessione (e poi dalla cache HTTP).
//
// Codici: ISO alpha-2 per i paesi; "X-..." per le entità senza codice ISO
// (Cipro del Nord, Somaliland, Abcasia, Ossezia del Sud, Transnistria).
// ===========================================================================

import { geoCentroid, geoContains, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import worldUrl from 'world-atlas/countries-110m.json?url';
import { loadCountryIndex, type CountryIndexEntry } from '@/lib/countryInfo';

export type GeoFeature = Feature<Geometry, { name: string }> & { code: string | null };
export type CountryKind = 'sovereign' | 'limited' | 'territory';

export interface WorldGeo {
  /** Paesi della mappa del mondo, più le aree "breakaway" disegnate sopra. */
  features: GeoFeature[];
  index: CountryIndexEntry[];
}

/** Nel dataset del mondo tre territori non hanno codice numerico ISO. */
const UNCODED_FEATURES: Record<string, string> = { Kosovo: 'XK', Somaliland: 'X-SOL', 'N. Cyprus': 'X-NCY' };

/** Stati a riconoscimento limitato: contati a parte, fuori dai 195. */
const LIMITED = new Set(['XK', 'TW', 'EH', 'X-NCY', 'X-SOL', 'X-ABK', 'X-SOS', 'X-TRN']);

/** Paese da cui l'entità senza ISO si è separata (continente, nomi di riserva). */
export const BREAKAWAY_PARENT: Record<string, string> = {
  'X-NCY': 'CY',
  'X-SOL': 'SO',
  'X-ABK': 'GE',
  'X-SOS': 'GE',
  'X-TRN': 'MD',
};

/** Osservatori ONU contati tra i paesi sovrani: 193 membri + questi due = 195. */
const UN_OBSERVERS = new Set(['VA', 'PS']);

const asCollection = <P extends Record<string, unknown>>(topology: Topology, key?: string) => {
  const name = key ?? Object.keys(topology.objects)[0];
  return feature(topology, topology.objects[name] as GeometryCollection<P>) as unknown as FeatureCollection<Geometry, P>;
};

let worldRequest: Promise<WorldGeo> | null = null;

export const loadWorldGeo = (): Promise<WorldGeo> => {
  worldRequest ??= Promise.all([
    fetch(worldUrl).then((r) => r.json() as Promise<Topology>),
    fetch('/regions/breakaway.json')
      .then((r) => (r.ok ? (r.json() as Promise<Topology>) : null))
      .catch(() => null),
    loadCountryIndex(),
  ])
    .then(([world, breakaway, index]) => {
      const byNumeric = new Map(index.filter((c) => c.numeric).map((c) => [c.numeric.padStart(3, '0'), c.code]));
      const countries: GeoFeature[] = asCollection<{ name: string }>(world, 'countries').features.map((f) => ({
        ...f,
        code:
          UNCODED_FEATURES[f.properties.name] ??
          (f.id != null ? byNumeric.get(String(f.id).padStart(3, '0')) : undefined) ??
          null,
      }));
      const extra: GeoFeature[] = breakaway
        ? asCollection<{ code: string }>(breakaway).features.map((f) => ({
            ...f,
            properties: { name: f.properties.code },
            code: f.properties.code,
          }))
        : [];
      return { features: [...countries, ...extra], index };
    })
    .catch((err) => {
      worldRequest = null;
      throw err;
    });
  return worldRequest;
};

export const countryKind = (code: string, index: CountryIndexEntry[]): CountryKind => {
  if (LIMITED.has(code)) return 'limited';
  if (UN_OBSERVERS.has(code)) return 'sovereign';
  return index.find((c) => c.code === code)?.unMember ? 'sovereign' : 'territory';
};

/** Se il punto cade in un'entità a riconoscimento limitato (es. Pristina → Kosovo,
 * Kyrenia → Cipro del Nord) ne restituisce il codice: i geocoder la attribuiscono
 * al paese da cui si è separata. */
export const limitedEntityAt = (geo: WorldGeo, lat: number, lon: number): string | null => {
  for (const f of geo.features) {
    if (f.code && LIMITED.has(f.code) && geoContains(f, [lon, lat])) return f.code;
  }
  return null;
};

/** Centro di un paese: dal poligono se c'è, altrimenti dal dataset dei paesi. */
export const countryCenter = (geo: WorldGeo, code: string): [number, number] | null => {
  const f = geo.features.find((x) => x.code === code);
  if (f) return geoCentroid(f) as [number, number];
  const ll = geo.index.find((c) => c.code === code)?.latlng;
  return ll ? [ll[1], ll[0]] : null;
};

// ---------------------------------------------------------------------------
// Regioni (generate da scripts/build-regions.mjs in public/regions)
// ---------------------------------------------------------------------------

export interface RegionIndexEntry {
  level: string;
  count: number;
  license: string;
  source: string;
}

let regionIndexRequest: Promise<Record<string, RegionIndexEntry>> | null = null;
export const loadRegionIndex = (): Promise<Record<string, RegionIndexEntry>> => {
  regionIndexRequest ??= fetch('/regions/index.json')
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, RegionIndexEntry>>) : {}))
    .catch(() => {
      regionIndexRequest = null;
      return {};
    });
  return regionIndexRequest;
};

const regionCache = new Map<string, Promise<GeoFeature[]>>();
/** Regioni di un paese (per codice ISO alpha-3); il codice è il nome della regione. */
export const loadRegions = (cca3: string): Promise<GeoFeature[]> => {
  let req = regionCache.get(cca3);
  if (!req) {
    req = fetch(`/regions/${cca3}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`regions ${cca3} ${r.status}`);
        return r.json() as Promise<Topology>;
      })
      .then((topo) =>
        asCollection<{ shapeName: string }>(topo).features.map((f) => ({
          ...f,
          properties: { name: f.properties.shapeName },
          code: f.properties.shapeName,
        }))
      );
    req.catch(() => regionCache.delete(cca3));
    regionCache.set(cca3, req);
  }
  return req;
};

/** Tutti i vertici di una geometria (poligoni e multipoligoni). */
const verticesOf = (g: Geometry): number[][] =>
  g.type === 'Polygon'
    ? g.coordinates.flat()
    : g.type === 'MultiPolygon'
      ? g.coordinates.flat(2)
      : [];

/** Regione che contiene il punto. I confini sono semplificati: un punto sulla
 * costa (Venezia, New York) può cadere appena in mare, e allora vale la regione
 * con il confine più vicino, entro ~30 km. */
export const regionAt = (regions: GeoFeature[], lat: number, lon: number): string | null => {
  const inside = regions.find((r) => geoContains(r, [lon, lat]));
  if (inside) return inside.code;
  let best: { code: string | null; d: number } = { code: null, d: Infinity };
  for (const r of regions) {
    for (const v of verticesOf(r.geometry)) {
      const d = geoDistance([lon, lat], [v[0], v[1]]);
      if (d < best.d) best = { code: r.code, d };
    }
  }
  // 30 km in radianti sulla sfera terrestre (raggio ~6371 km)
  return best.d < 30 / 6371 ? best.code : null;
};
