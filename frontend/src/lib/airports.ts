import { foldText } from '@/lib/countries';
import { CITY_AIRPORT_ALIASES } from '@/lib/airportAliases';
import type { Coordinates, Destination } from '@/lib/types';

/**
 * Dati e ricerca sugli aeroporti.
 *
 * L'elenco è in locale (`airportData.ts`, da OurAirports): la ricerca è
 * immediata, funziona senza rete e non consuma il rate limit di Nominatim, che
 * è già il motore del campo città. Un utente che digita "bergamo" vuole
 * l'aeroporto che serve Bergamo, e la ricerca sui nomi alternativi lo trova.
 */
export interface Airport {
  iata: string;
  name: string;
  /** Comune in cui si trova fisicamente l'aeroporto, non la città servita:
   *  Linate sta a Segrate. La città "vera" (Milano) è dentro `name`. */
  city: string;
  /** Codice ISO del Paese: da quello arriva la bandierina. */
  country: string;
  lat: number;
  lon: number;
  /** Fuso orario IANA (es. "Europe/Rome"), da lat/lon via `geo-tz` in fase di
   *  generazione dei dati. Serve a convertire gli orari dei voli. */
  tz: string;
  /** true = grande aeroporto di linea, false = medio. */
  large: boolean;
  /** true = ha voli di linea regolari. Esclude aviazione generale e basi
   *  militari che OurAirports classifica come "medium" pur avendo un IATA. */
  scheduled: boolean;
  /** Testi piegati (senza accenti, minuscole) per il confronto: si calcolano
   *  una volta sola al caricamento, non a ogni keystroke. */
  m: {
    iata: string;
    name: string;
    city: string;
    /** Parole di nome, comune e alias, piegate. */
    tokens: string[];
  };
}

/** Un aeroporto con la distanza dal punto di partenza (i "consigliati"). */
export interface AirportWithDistance {
  airport: Airport;
  km: number;
}

/** Un blocco di suggerimenti con un'intestazione: "Aeroporti vicino Roma". */
export interface AirportGroup {
  /** Città di riferimento, già pronta da mostrare. */
  label: string;
  items: AirportWithDistance[];
}

/** Oltre questa distanza l'aeroporto non è più "vicino": 100 km coprono
 *  l'hinterland (da Cologno Monzese Orio al Serio è a 25 km) senza infilare
 *  airports di altre regioni. */
export const NEAR_RADIUS_KM = 100;
/**
 * Quanti aeroporti consigliare. Tre sia per la casa sia per le mete: alcune
 * città hanno tre hub tutti usati (New York: JFK, Newark, LaGuardia; Milano:
 * Malpensa, Linate, Bergamo) e con due sparirebbe quello giusto.
 */
export const NEAR_HOME_LIMIT = 3;
export const NEAR_DESTINATION_LIMIT = 3;

/** Quante righe di suggerimenti mostra la ricerca. */
const SEARCH_LIMIT = 8;

// ─── Caricamento ─────────────────────────────────────────────────────────────

let cache: Airport[] | null = null;

const parseLine = (line: string): Airport => {
  const [iata, name, city, country, lat, lon, tz, size, service, keywords = ''] = line.split('|');
  const fName = foldText(name);
  const fCity = foldText(city);
  return {
    iata,
    name,
    city,
    country,
    lat: Number(lat),
    lon: Number(lon),
    tz,
    large: size === 'l',
    scheduled: service === 's',
    m: {
      iata: foldText(iata),
      name: fName,
      city: fCity,
      // Parole, non la stringa intera: senza questa divisione una ricerca come
      // "fco" trovava anche l'aeroporto di Denver, perché "Jeffco Airport"
      // contiene la sequenza "fco" a metà parola. Il taglio è su qualsiasi
      // carattere non alfanumerico perché i nomi del dataset usano trattini
      // lunghi: "Rome–Fiumicino" deve dare le parole "rome" e "fiumicino".
      tokens: [
        ...new Set(`${fName} ${fCity} ${foldText(keywords)}`.split(/[^a-z0-9]+/).filter(Boolean)),
      ],
    },
  };
};

/**
 * L'elenco sono 4568 righe: entra nel bundle come chunk separato, caricato alla
 * prima apertura di un campo aeroporto e non all'avvio dell'app.
 */
export const loadAirports = async (): Promise<Airport[]> => {
  if (cache) return cache;
  const { AIRPORT_DATA } = await import('@/lib/airportData');
  cache = AIRPORT_DATA.split('\n').map(parseLine);
  return cache;
};

/** Per codice IATA. Serve per riprendere il nome di un volo già salvato. */
export const airportByIata = (all: Airport[], iata: string): Airport | null => {
  const key = iata.trim().toUpperCase();
  return all.find((a) => a.iata === key) ?? null;
};

// ─── Distanza ────────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distanza in linea d'aria, abbastanza per ordinare gli aeroporti vicini. */
export const distanceKm = (from: Coordinates, to: Coordinates): number => {
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
};

/**
 * Criteri di utilità, dal più importante al meno: un aeroporto dove si prende
 * davvero un volo di linea batte uno più vicino ma riservato all'aviazione
 * generale. Senza questo, per New York finivano in cima Teterboro e per Parigi
 * Le Bourget, che sono più vicini del JFK e di Charles de Gaulle ma dove non
 * parte un aereo di linea.
 */
const byUsefulness = (x: AirportWithDistance, y: AirportWithDistance): number =>
  Number(y.airport.scheduled) - Number(x.airport.scheduled) ||
  Number(y.airport.large) - Number(x.airport.large) ||
  x.km - y.km;

/**
 * Fuso orario approssimato di un punto qualsiasi (es. la città di casa nel
 * profilo, che non è un aeroporto e non ha un fuso proprio nei dati): quello
 * dell'aeroporto più vicino, senza limite di raggio. I fusi cambiano su aree
 * enormi rispetto alla distanza dall'aeroporto più vicino, quindi l'errore è
 * trascurabile tranne per una città esattamente a cavallo di un confine.
 */
export const nearestAirportTz = (all: Airport[], origin: Coordinates): string | null => {
  let best: Airport | null = null;
  let bestKm = Infinity;
  for (const airport of all) {
    const km = distanceKm(origin, airport);
    if (km < bestKm) {
      bestKm = km;
      best = airport;
    }
  }
  return best?.tz ?? null;
};

/**
 * Aeroporti più vicini a un punto, entro il raggio. È il cuore dei consigliati:
 * la città non basta ("Cologno Monzese" non è "Milano"), contano i km.
 */
export const nearestAirports = (
  all: Airport[],
  origin: Coordinates,
  limit: number,
  radiusKm: number = NEAR_RADIUS_KM
): AirportWithDistance[] =>
  all
    .map((airport) => ({ airport, km: distanceKm(origin, airport) }))
    .filter((x) => x.km <= radiusKm)
    .sort(byUsefulness)
    .slice(0, limit);

// ─── Ricerca ─────────────────────────────────────────────────────────────────

/** Il testo cercato corrisponde all'inizio di una parola del record? */
const startsToken = (a: Airport, q: string): boolean =>
  a.m.tokens.some((token) => token.startsWith(q));

/** Il testo cercato corrisponde a una parola intera del record? */
const hasToken = (a: Airport, q: string): boolean => a.m.tokens.includes(q);

/**
 * Punteggio di un aeroporto rispetto a cosa ha digitato l'utente.
 * 0 = nessun match. L'ordine dei casi è l'ordine di importanza: il codice
 * IATA esatto batte tutto, poi un nome che inizia per la query, poi la città.
 */
const score = (a: Airport, q: string): number => {
  if (a.m.iata === q) return 1000;
  if (a.m.iata.startsWith(q)) return 700;
  if (a.m.name.startsWith(q)) return 600;
  if (a.m.city.startsWith(q)) return 500;
  if (startsToken(a, q)) return 300;
  // Frase intera: "Charles de Gaulle" o "Venezia Marco Polo" si cercano così.
  // Si controlla che ogni parola corrisponda a una parola del record, altrimenti
  // qualunque aeroporto con una parola in comune entra nei risultati.
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => hasToken(a, w))) return 200;
  return 0;
};

/** Aeroporti che matchano la query, i migliori in cima. */
export const searchAirports = (all: Airport[], query: string, limit = SEARCH_LIMIT): Airport[] => {
  const q = foldText(query);
  if (q.length === 0) return [];

  // La città è il caso più comune ("Milano", "Roma", "Londra") e l'unico in cui
  // l'elenco non basta: i nomi sono in inglese. Gli alias restituiscono gli
  // aeroporti nell'ordine deciso a mano (l'hub grande prima del piccolo), quindi
  // non passano dallo score: se l'utente scrive "Milano" va visto Malpensa, non
  // un aeroporto qualsiasi che contiene la parola.
  const alias = CITY_AIRPORT_ALIASES[q];
  if (alias) {
    const byIata = new Map(all.map((a) => [a.iata, a]));
    const resolved = alias
      .split(/\s+/)
      .map((code) => byIata.get(code))
      .filter((a): a is Airport => a !== undefined);
    if (resolved.length > 0) return resolved.slice(0, limit);
  }

  const run = (text: string): Airport[] =>
    all
      .map((airport) => ({ airport, s: score(airport, text) }))
      .filter((x) => x.s > 0)
    .sort(
      (x, y) =>
        y.s - x.s ||
        Number(y.airport.scheduled) - Number(x.airport.scheduled) ||
        Number(y.airport.large) - Number(x.airport.large) ||
        x.airport.name.localeCompare(y.airport.name)
    )
      .slice(0, limit)
      .map((x) => x.airport);

  const direct = run(q);
  if (direct.length > 0) return direct;

  // Frase in cui una parola è in italiano e l'altra in inglese, o viceversa:
  // "Fiumicino Roma" non può combaciare perché nel record c'è "Rome". Meglio
  // mostrare l'aeroporto trovato dalla parola più discriminante che ignorare
  // la ricerca, quindi si riprova parola per parola.
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    for (const word of words) {
      const partial = run(word);
      if (partial.length > 0) return partial;
    }
  }
  return [];
};

// ─── Consigliati ─────────────────────────────────────────────────────────────

/**
 * I gruppi che stanno in cima ai suggerimenti: prima la città di casa (se
 * impostata), poi le mete del viaggio nell'ordine in cui sono state scelte.
 * Un aeroporto compare una volta sola: se la meta è la città di casa, la
 * ripetizione è solo rumore.
 */
export const recommendedAirportGroups = (
  all: Airport[],
  opts: {
    homeCity: { city: string; coords: Coordinates | null } | null;
    destinations: Destination[];
  }
): AirportGroup[] => {
  const groups: AirportGroup[] = [];
  const seen = new Set<string>();

  const add = (label: string, coords: Coordinates | null, limit: number) => {
    if (!label || !coords) return;
    const items = nearestAirports(all, coords, limit).filter((x) => {
      if (seen.has(x.airport.iata)) return false;
      seen.add(x.airport.iata);
      return true;
    });
    if (items.length > 0) groups.push({ label, items });
  };

  add(opts.homeCity?.city ?? '', opts.homeCity?.coords ?? null, NEAR_HOME_LIMIT);
  for (const d of opts.destinations) {
    add(d.city, d.coords ?? null, NEAR_DESTINATION_LIMIT);
  }
  return groups;
};
