// ===========================================================================
// Atlante personale ("scratch map"): da viaggi, mezzi e segni a mano ricava lo
// stato di ogni paese. Logica pura, senza rete né React, così è verificabile
// da sola.
//
//   visited  — meta di un viaggio già iniziato (o concluso), oppure segnato a
//              mano (paese o una sua regione): SBLOCCATO
//   transit  — solo scalo (aeroporto/stazione/porto) di un viaggio iniziato:
//              si vede sulla mappa ma non conta come sbloccato
//   planned  — meta di un viaggio non ancora iniziato
//
// Priorità quando un paese ricade in più casi: visited > transit > planned.
// Le regioni si calcolano più tardi, quando servono, dai `points`.
// ===========================================================================

import type { Coordinates, Trip } from '@/lib/types';

export type CountryStatus = 'visited' | 'transit' | 'planned';

export interface AtlasTripRef {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  /** 'month' per i viaggi-ricordo di cui si sa solo il mese. */
  date_precision?: 'day' | 'month';
  /** Viaggio-ricordo: non ha il gestionale, quindi non è un link. */
  is_memory?: boolean;
  started: boolean;
  /** Il paese era una meta di questo viaggio (false = solo scalo). */
  asDestination: boolean;
}

export interface AtlasCountry {
  code: string;
  status: CountryStatus;
  trips: AtlasTripRef[];
  /** Segnato a mano dall'utente (il paese o almeno una sua regione). */
  manual: boolean;
  /** Prima data di viaggio iniziato in questo paese (per ordinare l'elenco). */
  firstVisit: string | null;
}

export interface AtlasCity {
  key: string;
  city: string;
  countryCode: string | null;
  lat: number;
  lon: number;
  visited: boolean;
  /** Solo scalo: si mostra sulla mappa ma non conta tra le città visitate. */
  transit?: boolean;
}

/** Luogo con coordinate (meta o scalo): serve a colorare le regioni. */
export interface AtlasPoint {
  code: string;
  lat: number;
  lon: number;
  status: CountryStatus;
  /** Viaggio da cui viene il punto (per dire quale viaggio ha sbloccato la regione). */
  tripId: string;
  tripName: string;
  tripIsMemory?: boolean;
  tripStart: string | null;
  tripEnd: string | null;
  tripPrecision?: 'day' | 'month';
}

export interface AtlasData {
  countries: Map<string, AtlasCountry>;
  cities: AtlasCity[];
  points: AtlasPoint[];
  startedTrips: number;
  plannedTrips: number;
}

export interface AtlasPlace {
  /** Codice del paese (alpha-2 maiuscolo o "X-..."), già risolto. */
  code: string;
  coords: Coordinates | null;
}

export interface AtlasTripInput {
  trip: Pick<Trip, 'id' | 'name' | 'start_date' | 'end_date'> & Partial<Pick<Trip, 'date_precision' | 'is_memory'>>;
  destinations: (AtlasPlace & { city: string })[];
  /** Scali; quelli che coincidono con una meta vengono ignorati. */
  transit: (AtlasPlace & { city?: string })[];
}

const STATUS_RANK: Record<CountryStatus, number> = { visited: 3, transit: 2, planned: 1 };

/** Un viaggio "conta" da quando inizia: senza date resta in programma. */
export const isTripStarted = (trip: Pick<Trip, 'start_date' | 'end_date'>, today: string): boolean => {
  const from = trip.start_date ?? trip.end_date;
  return !!from && from <= today;
};

/**
 * @param manualCountries codici dei paesi segnati a mano (o con almeno una regione segnata)
 */
export const buildAtlas = (inputs: AtlasTripInput[], today: string, manualCountries: Iterable<string> = []): AtlasData => {
  const countries = new Map<string, AtlasCountry>();
  const cities = new Map<string, AtlasCity>();
  const points: AtlasPoint[] = [];
  let startedTrips = 0;
  let plannedTrips = 0;

  const entry = (code: string, status: CountryStatus) => {
    const key = code.toUpperCase();
    const e = countries.get(key) ?? { code: key, status, trips: [], manual: false, firstVisit: null };
    if (STATUS_RANK[status] > STATUS_RANK[e.status]) e.status = status;
    countries.set(key, e);
    return e;
  };

  const touch = (code: string, status: CountryStatus, ref: AtlasTripRef) => {
    const e = entry(code, status);
    const existing = e.trips.findIndex((t) => t.id === ref.id);
    if (existing === -1) e.trips.push(ref);
    else if (ref.asDestination) e.trips[existing] = ref;
    if (ref.started && ref.start_date && (!e.firstVisit || ref.start_date < e.firstVisit)) {
      e.firstVisit = ref.start_date;
    }
  };

  for (const { trip, destinations, transit } of inputs) {
    const started = isTripStarted(trip, today);
    if (started) startedTrips++;
    else plannedTrips++;
    const ref = (asDestination: boolean): AtlasTripRef => ({
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      date_precision: trip.date_precision,
      is_memory: trip.is_memory,
      started,
      asDestination,
    });

    const destStatus: CountryStatus = started ? 'visited' : 'planned';
    for (const d of destinations) {
      touch(d.code, destStatus, ref(true));
      if (!d.coords) continue;
      points.push({
        code: d.code.toUpperCase(),
        lat: d.coords.lat,
        lon: d.coords.lon,
        status: destStatus,
        tripId: trip.id,
        tripName: trip.name,
        tripIsMemory: trip.is_memory,
        tripStart: trip.start_date,
        tripEnd: trip.end_date,
        tripPrecision: trip.date_precision,
      });
      const key = `${d.city.trim().toLowerCase()}|${d.code.toLowerCase()}`;
      const prev = cities.get(key);
      cities.set(key, {
        key,
        city: d.city,
        countryCode: d.code.toUpperCase(),
        lat: d.coords.lat,
        lon: d.coords.lon,
        visited: (prev?.visited ?? false) || started,
        transit: prev?.transit,
      });
    }

    // Gli scali di un viaggio futuro non dicono nulla: non si è ancora passati di lì.
    if (started) {
      const dest = new Set(destinations.map((d) => d.code.toUpperCase()));
      for (const s of transit) {
        if (dest.has(s.code.toUpperCase())) continue;
        touch(s.code, 'transit', ref(false));
        if (s.coords) {
          points.push({
            code: s.code.toUpperCase(),
            lat: s.coords.lat,
            lon: s.coords.lon,
            status: 'transit',
            tripId: trip.id,
            tripName: trip.name,
            tripIsMemory: trip.is_memory,
        tripStart: trip.start_date,
        tripEnd: trip.end_date,
        tripPrecision: trip.date_precision,
          });
          // Pallino della città di scalo (una meta nella stessa città ha la precedenza).
          const name = s.city?.trim();
          const key = name ? `${name.toLowerCase()}|${s.code.toLowerCase()}` : '';
          if (name && !cities.has(key)) {
            cities.set(key, {
              key,
              city: name,
              countryCode: s.code.toUpperCase(),
              lat: s.coords.lat,
              lon: s.coords.lon,
              visited: false,
              transit: true,
            });
          }
        }
      }
    }
  }

  for (const code of manualCountries) {
    const e = entry(code, 'visited');
    e.status = 'visited';
    e.manual = true;
  }

  countries.forEach((c) => c.trips.sort((a, b) => (b.start_date ?? '').localeCompare(a.start_date ?? '')));

  return { countries, cities: [...cities.values()], points, startedTrips, plannedTrips };
};

/** Paesi sovrani usati come denominatore della percentuale "mondo visitato"
 * (193 membri ONU + Città del Vaticano e Palestina, osservatori). */
export const WORLD_COUNTRY_COUNT = 195;
