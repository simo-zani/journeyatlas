import { foldText } from '@/lib/countries';

/**
 * Compagnie aeree: elenco e ricerca.
 *
 * I dati arrivano da `airlineData.ts`, generato da uno script a parte che ha
 * verificato ogni voce contro l'infobox di Wikipedia e risolto i loghi in URL
 * reali. Qui non c'è nessun codice IATA scritto a mano: se serve una compagnia
 * che non c'è, la si cerca in quel file e si rigenera.
 */

export interface Airline {
  /** Designatore IATA a due lettere. */
  iata: string;
  name: string;
  /** Codice paese a due lettere, per la bandierina. */
  country: string;
  /** URL del logo, null se non disponibile. */
  logo: string | null;
}

/** Quante righe mostra la ricerca. */
const SEARCH_LIMIT = 8;

let cache: Airline[] | null = null;

const parseLine = (line: string): Airline => {
  const [iata, name, country, logo] = line.split('|');
  return { iata, name, country, logo: logo || null };
};

/**
 * L'elenco è un chunk separato: entra nel bundle solo quando si apre un form
 * di trasporto, non all'avvio dell'app.
 */
export const loadAirlines = async (): Promise<Airline[]> => {
  if (cache) return cache;
  const { AIRLINE_DATA } = await import('@/lib/airlineData');
  cache = AIRLINE_DATA.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseLine);
  return cache;
};

/**
 * Individua la compagnia corrispondente a un testo già confermato.
 *
 * Serve per mostrare logo e codice nel campo: se il campo contiene solo una
 * compagnia scritta a mano non deve comparire nulla, quindi il confronto è
 * sull'intero nome e non su un "includes".
 */
export const airlineByName = (all: Airline[], value: string): Airline | null => {
  const name = foldText(value.trim());
  if (!name) return null;
  return all.find((a) => foldText(a.name) === name) ?? null;
};

const score = (airline: Airline, query: string): number => {
  const name = foldText(airline.name);
  if (name === query) return 100;
  if (airline.iata.toLowerCase() === query) return 95;
  // Iniziare per quello che è stato scritto batte contenerlo: con "ita" si
  // vuole ITA Airways, non ogni compagnia che ha "ita" dentro il nome.
  if (name.startsWith(query)) return 80;
  if (airline.iata.toLowerCase().startsWith(query)) return 70;
  if (name.includes(query)) return 50;
  return 0;
};

export const searchAirlines = (all: Airline[], query: string, limit = SEARCH_LIMIT): Airline[] => {
  const q = foldText(query);
  if (!q) return [];
  return all
    .map((airline) => ({ airline, s: score(airline, q) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || x.airline.name.localeCompare(y.airline.name))
    .slice(0, limit)
    .map((x) => x.airline);
};
