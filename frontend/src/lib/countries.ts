import type { Destination } from '@/lib/types';

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export interface DestinationSuggestion {
  city: string;
  country: string;
  countryCode: string | null;
  coords: { lat: number; lon: number } | null;
  /** Nominatim `importance`: serve a ordinare i risultati per rilevanza. */
  importance: number;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  hamlet?: string;
  locality?: string;
  country?: string;
  country_code?: string;
}

interface NominatimResult {
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
  importance?: number;
  category?: string;
  type?: string;
  namedetails?: { name?: string };
  address?: NominatimAddress;
}

/**
 * Categorie OSM che NON sono insediamenti. Nominatim risponde a "BOS" con
 * l'aeroporto di Boston, una stazione ferroviaria in Pakistan, un paese
 * olandese: in un campo "cerca città" non hanno senso. `place` (città,
 * paesi, frazioni) e `boundary` (i confini comunali, con cui le città sono
 * taggate in OSM) sono invece quelli che ci servono.
 */
const PLACE_CATEGORIES = new Set(['place', 'boundary']);

/** Etichetta leggibile per una località, se l'utente ha scritto qualcosa. */
const placeLabel = (address: NominatimAddress | undefined): string => {
  const found = ['city', 'town', 'village', 'municipality', 'hamlet', 'locality'].find(
    (key) => {
      const v = address?.[key as keyof NominatimAddress];
      return typeof v === 'string' && v.length > 0;
    }
  );
  return found ? (address![found as keyof NominatimAddress] as string) : '';
};

/** Minuscole e senza accenti: "citta" deve trovare "Città", "sao" deve trovare "São". */
export const foldText = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const toSuggestion = (result: NominatimResult): DestinationSuggestion | null => {
  // Il nome trovato ("Roma", "Lisboa") è l'etichetta; l'indirizzo serve solo come
  // appoggio quando il match non ha un nome proprio leggibile.
  const matched = result.namedetails?.name || result.name || '';
  const city =
    matched || placeLabel(result.address) || result.display_name?.split(',')[0]?.trim() || '';
  const country = result.address?.country ?? '';
  if (!city || !country) return null;

  const lat = Number(result.lat);
  const lon = Number(result.lon);
  const countryCode = result.address?.country_code ?? '';

  return {
    city,
    country,
    countryCode: countryCode || null,
    coords: Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null,
    importance: typeof result.importance === 'number' ? result.importance : 0,
  };
};

const fetchNominatim = async (
  query: string,
  acceptLanguage: string,
  signal?: AbortSignal
): Promise<NominatimResult[]> => {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  // `namedetails` espone `name` = il nome reale di ciò che è stato trovato.
  // Senza, l'unico nome disponibile è `address.city`, che è la città *contenente*
  // il match: cercando "BOS" (un quartiere della provincia di Varese) il
  // suggerimento diceva "Varese", cioè il posto in cui sta la strada trovata.
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('accept-language', acceptLanguage);
  url.searchParams.set('dedupe', '1');
  url.searchParams.set('limit', '20');

  const res = await fetch(url.toString(), {
    signal,
    headers: { 'Accept-Language': acceptLanguage },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as NominatimResult[];
};

/**
 * Nominatim NON fa prefix matching sul testo libero: ogni token della query deve
 * corrispondere a un token *esatto* del nome. Per questo "cologno" trova
 * "Cologno Monzese" ma "cologno mon" non trova nulla — il token cercato è "mon",
 * mentre nel nome il token è "monzese". Non è un limite di lunghezza minima
 * ("cologno al" funziona, perché "al" è un token esatto).
 *
 * Non essendoci un parametro lato client per allentare la regola, qui si
 * compensa in due tempi: si accorcia la query togliendo l'ultimo token finché
 * non esce qualcosa, poi si riordina in locale premiando chi inizia davvero con
 * la query digitata, così "cologno mon" mette in cima "Cologno Monzese".
 */
const localScore = (name: string, query: string, importance: number): number => {
  const n = foldText(name);
  const q = foldText(query);
  if (!q) return importance;
  if (n.startsWith(q)) return importance + 100;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => n.includes(t))) return importance + 10;
  return importance;
};

/** Oltre la query intera, quante accorciature provare prima di arrendersi. */
const MAX_QUERY_FALLBACKS = 2;

export const searchDestinations = async (
  query: string,
  signal?: AbortSignal,
  language?: string
): Promise<DestinationSuggestion[]> => {
  const acceptLanguage = language && language !== 'cimode' ? language : 'it';
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const variants = [
    query,
    ...Array.from({ length: Math.min(MAX_QUERY_FALLBACKS, tokens.length - 1) }, (_, i) =>
      tokens.slice(0, tokens.length - 1 - i).join(' ')
    ),
  ];

  let results: NominatimResult[] = [];
  for (const variant of variants) {
    results = await fetchNominatim(variant, acceptLanguage, signal);
    if (results.length > 0) break;
    if (signal?.aborted) return [];
  }

  return results
    .filter((r) => !r.category || PLACE_CATEGORIES.has(r.category))
    .map(toSuggestion)
    .filter((s): s is DestinationSuggestion => s !== null)
    .sort(
      (a, b) => localScore(b.city, query, b.importance) - localScore(a.city, query, a.importance)
    )
    // "Boston" arriva più volte (città, frazione, comune): tieni la più rilevante.
    .filter((s, i, list) => list.findIndex((o) => o.city === s.city && o.country === s.country) === i)
    .slice(0, 8);
};

export const toDestination = (s: DestinationSuggestion): Destination => ({
  city: s.city || s.country,
  country: s.country,
  countryCode: s.countryCode,
  coords: s.coords,
});

export const toManualDestination = (city: string): Destination => ({
  city,
  country: '',
  coords: null,
});
