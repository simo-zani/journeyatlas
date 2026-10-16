// ===========================================================================
// Statistiche di viaggio: distanze, tempo, mondo. Logica pura, senza rete né
// React. Contano solo i viaggi già iniziati (come l'atlante) e, dentro quelli,
// solo i mezzi già partiti.
//
// Le distanze sono in linea d'aria (ortodromia): per i viaggi con i mezzi
// tratta per tratta (voli, treni, traghetti con luogo riconosciuto); per gli
// altri un percorso stimato casa → scali → mete → scali → casa.
// ===========================================================================

import { isTripStarted, type AtlasData, type AtlasTripInput } from '@/lib/atlas';
import type { TransportPlaces } from '@/lib/atlasLoad';
import { wallClockDiffMinutes, wallClockFromIso } from '@/lib/flightTime';
import { portByNameOrCode } from '@/lib/ferryPorts';
import { airportByIata, distanceKm } from '@/lib/airports';
import { stationByNameOrCode } from '@/lib/trainStations';
import type { AccommodationRow, Coordinates, TransportRow } from '@/lib/types';

export const EARTH_CIRCUMFERENCE_KM = 40075;
export const EARTH_MOON_KM = 384400;

/** Mezzi conteggiati; 'estimated' = percorso ricostruito per i viaggi senza mezzi. */
export type LegMode = 'flight' | 'train' | 'ferry' | 'estimated';
export const LEG_MODES: LegMode[] = ['flight', 'train', 'ferry', 'estimated'];

export interface StatsPoint extends Coordinates {
  /** Nome da mostrare (città, o aeroporto per i voli). */
  label: string;
  /** Codice paese, alpha-2 maiuscolo o "X-...". */
  code: string;
  /** Fuso IANA, quando noto. */
  tz?: string;
}

export interface StatsLeg {
  mode: LegMode;
  from: StatsPoint;
  to: StatsPoint;
  km: number;
  /** Minuti di volo; solo per i voli. */
  minutes?: number;
  /** I minuti sono stimati dalla distanza (orari mancanti o incoerenti). */
  minutesEstimated?: boolean;
}

export interface StatsTripRef {
  id: string;
  name: string;
  isMemory: boolean;
  start: string;
  end: string;
  days: number;
}

export interface StatsPlace extends StatsPoint {
  tripId: string;
  tripName: string;
  tripIsMemory: boolean;
}

export interface TravelStats {
  trips: number;
  /** Giorni passati in viaggio (i viaggi sovrapposti contano una volta). */
  days: number;
  longestTrip: StatsTripRef | null;
  shortestTrip: StatsTripRef | null;
  farthest: (StatsPlace & { km: number }) | null;
  extremes: { north: StatsPlace; south: StatsPlace; east: StatsPlace; west: StatsPlace } | null;
  totalKm: number;
  kmByMode: Record<LegMode, number>;
  flights: number;
  flightMinutes: number;
  /** Almeno un volo ha la durata stimata. */
  flightMinutesEstimated: boolean;
  longestFlight: StatsLeg | null;
  /** Tratta fatta più volte (in entrambi i versi), solo se ripetuta. */
  topRoute: { a: StatsPoint; b: StatsPoint; count: number; mode: LegMode } | null;
  equatorCrossings: number;
  tripsByYear: { year: number; count: number }[];
  tripsByMonth: number[];
  hemispheres: { north: boolean; south: boolean; east: boolean; west: boolean };
  /** Scarto UTC (minuti) più a ovest e più a est tra i luoghi toccati. */
  utcRange: { min: number; max: number } | null;
  mostVisited: { code: string; trips: number } | null;
  firstCountry: { code: string; date: string } | null;
  latestCountry: { code: string; date: string } | null;
  nights: { hotel: number; apartment: number };
  cities: number;
}

const DAY_MS = 86400000;
const dayNumber = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY_MS;

/** Volo commerciale medio: ~800 km/h di crociera più mezz'ora tra decollo e atterraggio. */
const estimateFlightMinutes = (km: number) => Math.round((km / 800) * 60 + 30);

/** Scarto da UTC (minuti) di un fuso IANA, oggi. */
const utcOffsetMinutes = (timeZone: string): number | null => {
  try {
    const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value;
    const m = name?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    if (!m) return name === 'GMT' ? 0 : null;
    return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
  } catch {
    return null;
  }
};

const nearestTz = (places: TransportPlaces | null, c: Coordinates): string | undefined => {
  if (!places) return undefined;
  let best: { tz: string; km: number } | null = null;
  for (const a of places.airports) {
    const km = distanceKm(c, a);
    if (!best || km < best.km) best = { tz: a.tz, km };
  }
  return best?.tz;
};

export interface StatsInput {
  inputs: AtlasTripInput[];
  rowsByTrip: Map<string, TransportRow[]>;
  places: TransportPlaces | null;
  atlas: AtlasData;
  accommodations: AccommodationRow[];
  home: (Coordinates & { label: string }) | null;
  homeCode: string | null;
  today: string;
}

export const computeStats = ({ inputs, rowsByTrip, places, atlas, accommodations, home, homeCode, today }: StatsInput): TravelStats => {
  const started = inputs.filter((i) => isTripStarted(i.trip, today));
  const homePoint: StatsPoint | null = home
    ? { lat: home.lat, lon: home.lon, label: home.label, code: homeCode ?? '', tz: nearestTz(places, home) }
    : null;

  // ------------------------------------------------------------ tratte
  const legs: StatsLeg[] = [];
  const pointOf = (type: TransportRow['transport_type'], value: string): StatsPoint | null => {
    if (!places) return null;
    if (type === 'flight') {
      const a = airportByIata(places.airports, value);
      return a ? { lat: a.lat, lon: a.lon, label: a.iata, code: a.country.toUpperCase(), tz: a.tz } : null;
    }
    const p =
      type === 'train' ? stationByNameOrCode(places.stations, value) : type === 'ferry' ? portByNameOrCode(places.ports, value) : null;
    return p ? { lat: p.lat, lon: p.lon, label: p.city, code: p.country.toUpperCase(), tz: p.tz } : null;
  };

  for (const { trip, destinations, transit } of started) {
    const rows = (rowsByTrip.get(trip.id) ?? []).filter(
      (r) => !r.departure_datetime || r.departure_datetime.slice(0, 10) <= today
    );
    const tripLegs: StatsLeg[] = [];
    for (const r of rows) {
      if (r.transport_type !== 'flight' && r.transport_type !== 'train' && r.transport_type !== 'ferry') continue;
      const from = pointOf(r.transport_type, r.departure_airport);
      const to = pointOf(r.transport_type, r.arrival_airport);
      if (!from || !to) continue;
      const km = distanceKm(from, to);
      const leg: StatsLeg = { mode: r.transport_type, from, to, km };
      if (r.transport_type === 'flight') {
        let minutes: number | null = null;
        if (r.departure_datetime && r.arrival_datetime && from.tz && to.tz) {
          const m = wallClockDiffMinutes(wallClockFromIso(r.departure_datetime), from.tz, wallClockFromIso(r.arrival_datetime), to.tz);
          if (m > 0 && m < 24 * 60) minutes = m;
        }
        leg.minutes = minutes ?? estimateFlightMinutes(km);
        leg.minutesEstimated = minutes === null;
      }
      tripLegs.push(leg);
    }
    // Nessun mezzo riconosciuto: percorso stimato da casa, passando per gli scali.
    if (tripLegs.length === 0 && homePoint) {
      const stops: StatsPoint[] = transit
        .filter((s) => s.coords)
        .map((s) => ({ lat: s.coords!.lat, lon: s.coords!.lon, label: s.city ?? '', code: s.code }));
      const dests: StatsPoint[] = destinations
        .filter((d) => d.coords)
        .map((d) => ({ lat: d.coords!.lat, lon: d.coords!.lon, label: d.city, code: d.code }));
      if (dests.length > 0) {
        const route = [homePoint, ...stops, ...dests, ...[...stops].reverse(), homePoint];
        for (let i = 1; i < route.length; i++) {
          const km = distanceKm(route[i - 1], route[i]);
          if (km > 1) tripLegs.push({ mode: 'estimated', from: route[i - 1], to: route[i], km });
        }
      }
    }
    legs.push(...tripLegs);
  }

  const kmByMode: Record<LegMode, number> = { flight: 0, train: 0, ferry: 0, estimated: 0 };
  legs.forEach((l) => (kmByMode[l.mode] += l.km));
  const flightLegs = legs.filter((l) => l.mode === 'flight');
  const longestFlight = flightLegs.reduce<StatsLeg | null>((m, l) => (!m || l.km > m.km ? l : m), null);

  const routes = new Map<string, { a: StatsPoint; b: StatsPoint; count: number; mode: LegMode }>();
  for (const l of legs) {
    if (l.mode === 'estimated') continue;
    const [a, b] = [l.from, l.to].sort((x, y) => x.label.localeCompare(y.label));
    const key = `${l.mode}|${a.label}|${b.label}`;
    const r = routes.get(key) ?? { a, b, count: 0, mode: l.mode };
    r.count++;
    routes.set(key, r);
  }
  const topRoute = [...routes.values()].filter((r) => r.count > 1).sort((x, y) => y.count - x.count)[0] ?? null;

  // ------------------------------------------------------------ tempo
  const tripRefs: StatsTripRef[] = started.map(({ trip }) => {
    const start = trip.start_date ?? trip.end_date ?? today;
    const rawEnd = trip.end_date ?? start;
    const end = rawEnd > today ? today : rawEnd;
    return {
      id: trip.id,
      name: trip.name,
      isMemory: !!trip.is_memory,
      start,
      end,
      days: Math.max(1, dayNumber(end) - dayNumber(start) + 1),
    };
  });
  // Unione degli intervalli: due viaggi sovrapposti non raddoppiano i giorni.
  let days = 0;
  let cursor = -Infinity;
  for (const r of [...tripRefs].sort((a, b) => a.start.localeCompare(b.start))) {
    const s = Math.max(dayNumber(r.start), cursor + 1);
    const e = dayNumber(r.end);
    if (e >= s) days += e - s + 1;
    cursor = Math.max(cursor, e);
  }
  // Il viaggio più breve si cerca tra quelli con date precise: un ricordo "a mesi" non dice quanto è durato.
  const byDays = (list: StatsTripRef[], longest: boolean) =>
    list.reduce<StatsTripRef | null>((m, r) => (!m || (longest ? r.days > m.days : r.days < m.days) ? r : m), null);
  const monthOnly = new Set(started.filter((s) => s.trip.date_precision === 'month').map((s) => s.trip.id));
  const precise = tripRefs.filter((r) => !monthOnly.has(r.id));

  const tripsByMonth = Array.from({ length: 12 }, () => 0);
  const years = new Map<number, number>();
  for (const r of tripRefs) {
    tripsByMonth[+r.start.slice(5, 7) - 1]++;
    const y = +r.start.slice(0, 4);
    years.set(y, (years.get(y) ?? 0) + 1);
  }
  const tripsByYear: { year: number; count: number }[] = [];
  if (years.size > 0) {
    const first = Math.min(...years.keys());
    const last = Math.max(+today.slice(0, 4), ...years.keys());
    for (let y = first; y <= last; y++) tripsByYear.push({ year: y, count: years.get(y) ?? 0 });
  }

  // ------------------------------------------------------------ mondo
  const placesVisited: StatsPlace[] = [];
  for (const { trip, destinations } of started) {
    for (const d of destinations) {
      if (!d.coords) continue;
      placesVisited.push({
        lat: d.coords.lat,
        lon: d.coords.lon,
        label: d.city,
        code: d.code,
        tripId: trip.id,
        tripName: trip.name,
        tripIsMemory: !!trip.is_memory,
      });
    }
  }
  const pick = (better: (a: StatsPlace, b: StatsPlace) => boolean) =>
    placesVisited.reduce<StatsPlace | null>((m, p) => (!m || better(p, m) ? p : m), null);
  const extremes =
    placesVisited.length > 0
      ? {
          north: pick((a, b) => a.lat > b.lat)!,
          south: pick((a, b) => a.lat < b.lat)!,
          east: pick((a, b) => a.lon > b.lon)!,
          west: pick((a, b) => a.lon < b.lon)!,
        }
      : null;
  const farthest = home
    ? placesVisited.reduce<(StatsPlace & { km: number }) | null>((m, p) => {
        const km = distanceKm(home, p);
        return !m || km > m.km ? { ...p, km } : m;
      }, null)
    : null;

  // Dove si è messo piede: mete, luoghi dei mezzi, casa.
  const touched: StatsPoint[] = [
    ...placesVisited,
    ...legs.filter((l) => l.mode !== 'estimated').flatMap((l) => [l.from, l.to]),
    ...(homePoint ? [homePoint] : []),
  ];
  const hemispheres = {
    north: touched.some((p) => p.lat > 0),
    south: touched.some((p) => p.lat < 0),
    east: touched.some((p) => p.lon > 0),
    west: touched.some((p) => p.lon < 0),
  };
  const equatorCrossings = legs.filter((l) => Math.sign(l.from.lat) !== Math.sign(l.to.lat) && l.from.lat * l.to.lat !== 0).length;

  const tzCache = new Map<string, number | null>();
  const offsets: number[] = [];
  for (const p of touched) {
    const tz = p.tz ?? nearestTz(places, p);
    if (!tz) continue;
    if (!tzCache.has(tz)) tzCache.set(tz, utcOffsetMinutes(tz));
    const o = tzCache.get(tz);
    if (o != null) offsets.push(o);
  }
  const utcRange = offsets.length > 0 ? { min: Math.min(...offsets), max: Math.max(...offsets) } : null;

  const visitedCountries = [...atlas.countries.values()].filter((c) => c.status === 'visited');
  const destTrips = (c: (typeof visitedCountries)[number]) => c.trips.filter((t) => t.started && t.asDestination).length;
  const mostVisitedEntry = visitedCountries.reduce<(typeof visitedCountries)[number] | null>(
    (m, c) => (destTrips(c) > 0 && (!m || destTrips(c) > destTrips(m)) ? c : m),
    null
  );
  const dated = visitedCountries.filter((c) => c.firstVisit).sort((a, b) => a.firstVisit!.localeCompare(b.firstVisit!));

  const nights = { hotel: 0, apartment: 0 };
  const startedIds = new Set(started.map((s) => s.trip.id));
  for (const a of accommodations) {
    if (!startedIds.has(a.trip_id) || !a.check_in_date || !a.check_out_date || a.check_in_date > today) continue;
    const n = dayNumber(a.check_out_date) - dayNumber(a.check_in_date);
    if (n > 0) nights[a.type] += n;
  }

  return {
    trips: started.length,
    days,
    longestTrip: byDays(tripRefs, true),
    shortestTrip: byDays(precise, false),
    farthest,
    extremes,
    totalKm: legs.reduce((s, l) => s + l.km, 0),
    kmByMode,
    flights: flightLegs.length,
    flightMinutes: flightLegs.reduce((s, l) => s + (l.minutes ?? 0), 0),
    flightMinutesEstimated: flightLegs.some((l) => l.minutesEstimated),
    longestFlight,
    topRoute,
    equatorCrossings,
    tripsByYear,
    tripsByMonth,
    hemispheres,
    utcRange,
    mostVisited: mostVisitedEntry ? { code: mostVisitedEntry.code, trips: destTrips(mostVisitedEntry) } : null,
    firstCountry: dated[0] ? { code: dated[0].code, date: dated[0].firstVisit! } : null,
    latestCountry: dated.length > 1 ? { code: dated[dated.length - 1].code, date: dated[dated.length - 1].firstVisit! } : null,
    nights,
    cities: atlas.cities.filter((c) => c.visited).length,
  };
};
