import { fetchMyTrips, fetchTransportsForTrips } from '@/lib/api';
import { isTripStarted, type AtlasTripInput } from '@/lib/atlas';
import { limitedEntityAt, loadWorldGeo, type WorldGeo } from '@/lib/atlasGeo';
import { resolveCountryFlags } from '@/lib/flags';
import { loadTransportPlaces, transitPlacesFromRows } from '@/lib/tripCountries';
import type { Coordinates, Trip, TransportRow } from '@/lib/types';

export type TransportPlaces = Awaited<ReturnType<typeof loadTransportPlaces>>;

export interface AtlasTrips {
  world: WorldGeo;
  trips: Trip[];
  /** Mete e scali di ogni viaggio, pronti per buildAtlas. */
  inputs: AtlasTripInput[];
  /** Mezzi dei soli viaggi già iniziati, per viaggio. */
  rowsByTrip: Map<string, TransportRow[]>;
  /** Anagrafiche di aeroporti, stazioni e porti; null se non caricabili. */
  places: TransportPlaces | null;
}

/**
 * Viaggi dell'utente con mete e scali già risolti in codici paese e coordinate.
 * Condiviso da atlante e statistiche, così contano gli stessi luoghi.
 */
export const loadAtlasTrips = async (
  userId: string,
  homeCoords: Coordinates | null | undefined,
  today: string
): Promise<AtlasTrips> => {
  const [world, trips] = await Promise.all([loadWorldGeo(), fetchMyTrips(userId)]);
  // Codice di un luogo: quello salvato (o ricavato dal nome), sostituito dall'entità
  // a riconoscimento limitato se le coordinate cadono lì dentro.
  const placeCode = (code: string, coords: { lat: number; lon: number } | null) =>
    (coords && limitedEntityAt(world, coords.lat, coords.lon)) || code.toUpperCase();

  const startedIds = trips.filter((tr) => isTripStarted(tr, today)).map((tr) => tr.id);
  let rowsByTrip = new Map<string, TransportRow[]>();
  let places: TransportPlaces | null = null;
  try {
    const [rows, p] = await Promise.all([fetchTransportsForTrips(startedIds), loadTransportPlaces()]);
    places = p;
    rowsByTrip = rows.reduce((m, r) => m.set(r.trip_id, [...(m.get(r.trip_id) ?? []), r]), new Map<string, TransportRow[]>());
  } catch {
    // senza anagrafiche dei mezzi restano solo le mete
  }

  const inputs: AtlasTripInput[] = await Promise.all(
    trips.map(async (trip) => {
      const destinations = (
        await Promise.all(
          (trip.destinations ?? []).map(async (d) => {
            const code = d.countryCode || (await resolveCountryFlags([d]))[0] || '';
            return code ? { code: placeCode(code, d.coords ?? null), city: d.city, coords: d.coords ?? null } : null;
          })
        )
      ).filter((d): d is NonNullable<typeof d> => d !== null);
      const transit =
        places && rowsByTrip.has(trip.id)
          ? transitPlacesFromRows(
              rowsByTrip.get(trip.id) ?? [],
              destinations.map((d) => d.code),
              homeCoords,
              places
            ).map((p) => ({ code: placeCode(p.code, p), city: p.city, coords: { lat: p.lat, lon: p.lon } }))
          : [];
      for (const s of trip.stopovers ?? []) {
        transit.push({ code: placeCode(s.countryCode, s), city: s.city, coords: { lat: s.lat, lon: s.lon } });
      }
      return { trip, destinations, transit };
    })
  );

  return { world, trips, inputs, rowsByTrip, places };
};
