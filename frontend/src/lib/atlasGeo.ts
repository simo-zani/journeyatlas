// ===========================================================================
// Geografia dell'atlante: confini del mondo, stati a riconoscimento limitato e
// regioni. Tutto si scarica una volta per sessione (e poi dalla cache HTTP).
//
// Codici: ISO alpha-2 per i paesi; "X-..." per le entità senza codice ISO
// (Cipro del Nord, Somaliland, Abcasia, Ossezia del Sud, Transnistria).
// ===========================================================================

import { geoArea, geoCentroid, geoContains, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import worldUrl from 'world-atlas/countries-110m.json?url';
import { loadCountryIndex, type CountryIndexEntry } from '@/lib/countryInfo';

export type GeoFeature = Feature<Geometry, { name: string }> & {
  code: string | null;
  /** Paese piccolo (da islands.json): da lontano si segna anche con un puntino. */
  small?: boolean;
  /** Isole lontane dalla costa di un paese già disegnato (Canarie, Azzorre...). */
  islets?: boolean;
};
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

/** Stato da cui dipende ogni territorio (dipendenze, territori d'oltremare, regioni
 * d'oltremare, stati in libera associazione). L'Antartide non dipende da nessuno. */
export const SOVEREIGN_OF: Record<string, string> = {
  // Regno Unito
  AI: 'GB', BM: 'GB', FK: 'GB', GG: 'GB', GI: 'GB', GS: 'GB', IM: 'GB', IO: 'GB', JE: 'GB',
  KY: 'GB', MS: 'GB', PN: 'GB', SH: 'GB', TC: 'GB', VG: 'GB',
  // Francia
  BL: 'FR', GF: 'FR', GP: 'FR', MF: 'FR', MQ: 'FR', NC: 'FR', PF: 'FR', PM: 'FR', RE: 'FR', TF: 'FR', WF: 'FR', YT: 'FR',
  // Stati Uniti
  AS: 'US', GU: 'US', MP: 'US', PR: 'US', UM: 'US', VI: 'US',
  // Paesi Bassi (Regno dei Paesi Bassi)
  AW: 'NL', BQ: 'NL', CW: 'NL', SX: 'NL',
  // Danimarca (Regno di Danimarca)
  FO: 'DK', GL: 'DK',
  // Australia
  CC: 'AU', CX: 'AU', HM: 'AU', NF: 'AU',
  // Nuova Zelanda (Isole Cook e Niue in libera associazione)
  CK: 'NZ', NU: 'NZ', TK: 'NZ',
  // Norvegia
  BV: 'NO', SJ: 'NO',
  // Cina (regioni amministrative speciali)
  HK: 'CN', MO: 'CN',
  // Finlandia
  AX: 'FI',
};

/** Osservatori ONU contati tra i paesi sovrani: 193 membri + questi due = 195. */
const UN_OBSERVERS = new Set(['VA', 'PS']);

const asCollection = <P extends Record<string, unknown>>(topology: Topology, key?: string) => {
  const name = key ?? Object.keys(topology.objects)[0];
  return feature(topology, topology.objects[name] as GeometryCollection<P>) as unknown as FeatureCollection<Geometry, P>;
};

/** Da cambiare quando si rigenera islands.json, così il browser non usa la copia vecchia. */
const ISLANDS_VERSION = 3;

let worldRequest: Promise<WorldGeo> | null = null;

export const loadWorldGeo = (): Promise<WorldGeo> => {
  worldRequest ??= Promise.all([
    fetch(worldUrl).then((r) => r.json() as Promise<Topology>),
    fetch('/regions/breakaway.json')
      .then((r) => (r.ok ? (r.json() as Promise<Topology>) : null))
      .catch(() => null),
    // Paesi senza poligono a 110m (Maldive, Seychelles, Malta...), presi dai 10m.
    fetch(`/regions/islands.json?v=${ISLANDS_VERSION}`)
      .then((r) => (r.ok ? (r.json() as Promise<Topology>) : null))
      .catch(() => null),
    loadCountryIndex(),
  ])
    .then(([world, breakaway, islands, index]) => {
      const byNumeric = new Map(index.filter((c) => c.numeric).map((c) => [c.numeric.padStart(3, '0'), c.code]));
      const countries: GeoFeature[] = asCollection<{ name: string }>(world, 'countries').features.map((f) => ({
        ...f,
        code:
          UNCODED_FEATURES[f.properties.name] ??
          (f.id != null ? byNumeric.get(String(f.id).padStart(3, '0')) : undefined) ??
          null,
      }));
      const small: GeoFeature[] = islands
        ? asCollection<{ id: string; name: string; kind: 'country' | 'islets' }>(islands).features.map((f) => ({
            ...f,
            properties: { name: f.properties.name },
            code: byNumeric.get(f.properties.id) ?? null,
            ...(f.properties.kind === 'islets' ? { islets: true } : { small: true }),
          }))
        : [];
      const extra: GeoFeature[] = breakaway
        ? asCollection<{ code: string }>(breakaway).features.map((f) => ({
            ...f,
            properties: { name: f.properties.code },
            code: f.properties.code,
          }))
        : [];
      return { features: [...countries, ...small, ...extra], index };
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

/** Parte principale di un paese: il poligono più grande. Francia con la Guyana,
 * USA con Alaska e Hawaii: centrare e zoomare sull'insieme finirebbe in mezzo
 * all'oceano. */
export const mainPart = (f: GeoFeature): GeoFeature => {
  if (f.geometry.type !== 'MultiPolygon') return f;
  const parts = f.geometry.coordinates.map((coordinates) => ({
    ...f,
    geometry: { type: 'Polygon' as const, coordinates },
  }));
  return parts.reduce((best, p) => (geoArea(p) > geoArea(best) ? p : best), parts[0]);
};

/** Centro di un paese: dal poligono principale se c'è, altrimenti dal dataset dei paesi. */
export const countryCenter = (geo: WorldGeo, code: string): [number, number] | null => {
  const f = geo.features.find((x) => x.code === code);
  if (f) return geoCentroid(mainPart(f)) as [number, number];
  const ll = geo.index.find((c) => c.code === code)?.latlng;
  return ll ? [ll[1], ll[0]] : null;
};

// ---------------------------------------------------------------------------
// Regioni (generate da scripts/build-regions.mjs in public/regions)
// ---------------------------------------------------------------------------

export interface RegionIndexEntry {
  /** Nome regione → miniatura della bandiera (solo se TUTTE le regioni ne hanno una). */
  flags?: Record<string, string>;
  /** Nomi tradotti per lingua dell'app: { it: { nome originale: nome tradotto } }. */
  names?: Record<string, Record<string, string>>;
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
