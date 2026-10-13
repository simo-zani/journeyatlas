import { fetchTransports } from '@/lib/api';
import { airportByIata, distanceKm, loadAirports } from '@/lib/airports';
import { loadTrainStations, stationByNameOrCode } from '@/lib/trainStations';
import { loadFerryPorts, portByNameOrCode } from '@/lib/ferryPorts';
import type { Coordinates, TransportRow } from '@/lib/types';

type Places = {
  airports: Awaited<ReturnType<typeof loadAirports>>;
  stations: Awaited<ReturnType<typeof loadTrainStations>>;
  ports: Awaited<ReturnType<typeof loadFerryPorts>>;
};

/** Anagrafiche di aeroporti, stazioni e porti (ognuna con la sua cache). */
export const loadTransportPlaces = async (): Promise<Places> => {
  const [airports, stations, ports] = await Promise.all([loadAirports(), loadTrainStations(), loadFerryPorts()]);
  return { airports, stations, ports };
};

export interface TransitPlace {
  /** Alpha-2 maiuscolo. */
  code: string;
  lat: number;
  lon: number;
}

/** Scali (con coordinate) di un insieme di mezzi già caricati, esclusi casa e
 * `knownCodes`. Un solo luogo per paese: il primo incontrato. */
export const transitPlacesFromRows = (
  rows: Pick<TransportRow, 'transport_type' | 'departure_airport' | 'arrival_airport'>[],
  knownCodes: Iterable<string>,
  homeCoords: Coordinates | null | undefined,
  { airports, stations, ports }: Places
): TransitPlace[] => {
  const placeOf = (type: string, value: string): TransitPlace | null => {
    const p =
      type === 'flight'
        ? airportByIata(airports, value)
        : type === 'train'
          ? stationByNameOrCode(stations, value)
          : type === 'ferry'
            ? portByNameOrCode(ports, value)
            : undefined;
    return p ? { code: p.country.toUpperCase(), lat: p.lat, lon: p.lon } : null;
  };

  let home: string | null = null;
  if (homeCoords) {
    let best = Infinity;
    for (const a of airports) {
      const km = distanceKm(homeCoords, a);
      if (km < best) {
        best = km;
        home = a.country.toUpperCase();
      }
    }
  } else if (rows[0]) {
    home = placeOf(rows[0].transport_type, rows[0].departure_airport)?.code ?? null;
  }

  const known = new Set([...knownCodes].map((c) => c.toUpperCase()));
  const found = new Map<string, TransitPlace>();
  for (const r of rows) {
    for (const v of [r.departure_airport, r.arrival_airport]) {
      const place = placeOf(r.transport_type, v);
      if (place && place.code !== home && !known.has(place.code) && !found.has(place.code)) found.set(place.code, place);
    }
  }
  return [...found.values()];
};

/** Versione sincrona di findTransitCountryCodes, per chi ha già mezzi e anagrafiche. */
export const transitCountryCodesFromRows = (
  rows: Pick<TransportRow, 'transport_type' | 'departure_airport' | 'arrival_airport'>[],
  knownCodes: Iterable<string>,
  homeCoords: Coordinates | null | undefined,
  places: Places
): string[] => transitPlacesFromRows(rows, knownCodes, homeCoords, places).map((p) => p.code);

/**
 * Paesi di passaggio di un viaggio: quelli degli scali (aeroporti, stazioni,
 * porti dei mezzi) che non sono già tra `knownCodes` (le mete). Il paese di
 * casa non conta: non è un passaggio, è la partenza. Lo si ricava
 * dall'aeroporto più vicino alla città di casa, altrimenti dalla partenza del
 * primo mezzo. Usato da Info Paese (schede dei paesi) e da Spese (valute).
 *
 * Restituisce codici ISO alpha-2 MAIUSCOLI.
 */
export const findTransitCountryCodes = async (
  tripId: string,
  knownCodes: Iterable<string>,
  homeCoords: Coordinates | null | undefined
): Promise<string[]> => {
  const [rows, places] = await Promise.all([fetchTransports(tripId), loadTransportPlaces()]);
  return transitCountryCodesFromRows(rows, knownCodes, homeCoords, places);
};
