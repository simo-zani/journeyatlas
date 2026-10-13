import { fetchTransports } from '@/lib/api';
import { airportByIata, distanceKm, loadAirports } from '@/lib/airports';
import { loadTrainStations, stationByNameOrCode } from '@/lib/trainStations';
import { loadFerryPorts, portByNameOrCode } from '@/lib/ferryPorts';
import type { Coordinates } from '@/lib/types';

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
  const [rows, airports, stations, ports] = await Promise.all([
    fetchTransports(tripId),
    loadAirports(),
    loadTrainStations(),
    loadFerryPorts(),
  ]);
  const countryOf = (type: string, value: string): string | null => {
    const code =
      type === 'flight'
        ? airportByIata(airports, value)?.country
        : type === 'train'
          ? stationByNameOrCode(stations, value)?.country
          : type === 'ferry'
            ? portByNameOrCode(ports, value)?.country
            : undefined;
    return code ? code.toUpperCase() : null;
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
    home = countryOf(rows[0].transport_type, rows[0].departure_airport);
  }

  const known = new Set([...knownCodes].map((c) => c.toUpperCase()));
  const found = new Set<string>();
  for (const r of rows) {
    for (const v of [r.departure_airport, r.arrival_airport]) {
      const code = countryOf(r.transport_type, v);
      if (code && code !== home && !known.has(code)) found.add(code);
    }
  }
  return [...found];
};
