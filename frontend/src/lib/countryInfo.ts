const COUNTRY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RATES_TTL_MS = 60 * 60 * 1000;
const CACHE_PREFIX = 'ja-country-info:';

/**
 * REST Countries v3 è stato dismesso (la v5 richiede una chiave API, che in
 * un'app frontend sarebbe pubblica): i dati statici dei paesi vengono dal
 * pacchetto open-source `world-countries`, servito da jsDelivr senza chiave.
 */
const COUNTRIES_URL = 'https://cdn.jsdelivr.net/npm/world-countries@5/countries.json';

export interface CountryInfo {
  code: string;
  cca3: string;
  nameEn: string;
  nameIt: string;
  capital: string[];
  region: string;
  subregion: string;
  /** Nomi in inglese, dal dataset: fallback se il browser non conosce la lingua. */
  languages: string[];
  /** Codici ISO 639-3 ("eng", "spa") nello stesso ordine di `languages`: servono a tradurre i nomi. */
  languageCodes: string[];
  currencies: { code: string; name: string; symbol: string }[];
  callingCode: string;
  drivingSide: 'left' | 'right';
  /** Centro del paese: fallback per risalire al fuso quando il viaggio non ha coordinate. */
  latlng: [number, number] | null;
}

interface WorldCountry {
  cca2: string;
  cca3: string;
  name: { common: string };
  translations?: { ita?: { common?: string } };
  capital?: string[];
  region?: string;
  subregion?: string;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
  idd?: { root?: string; suffixes?: string[] };
  latlng?: number[];
}

/** Paesi con guida a sinistra (il dataset non ha il campo). */
const LEFT_DRIVING = new Set([
  'GB', 'IE', 'MT', 'CY', 'AU', 'NZ', 'JP', 'TH', 'ID', 'MY', 'SG', 'IN', 'LK', 'NP', 'BD', 'PK', 'BT', 'MV',
  'HK', 'MO', 'BN', 'TL', 'KE', 'TZ', 'UG', 'ZA', 'ZW', 'ZM', 'MZ', 'BW', 'NA', 'MU', 'LS', 'SZ', 'MW', 'SR',
  'GY', 'JM', 'BB', 'TT', 'BS', 'FJ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'PG', 'SB', 'WS', 'TO', 'KI', 'CY',
]);

const readCache = <T>(key: string, ttl: number): T | null => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { at, value } = JSON.parse(raw) as { at: number; value: T };
    return Date.now() - at < ttl ? value : null;
  } catch {
    return null;
  }
};

const writeCache = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), value }));
  } catch {
    // ignore storage errors (privacy mode, quota)
  }
};

const callingCodeOf = (idd: WorldCountry['idd']): string => {
  if (!idd?.root) return '';
  // Con più suffissi (es. +1 con 242, 246…) il prefisso comune è solo la radice.
  return idd.suffixes?.length === 1 ? `${idd.root}${idd.suffixes[0]}` : idd.root;
};

// Il file completo pesa ~1,4 MB (circa 150 KB compresso): una sola richiesta
// condivisa tra i paesi del viaggio, poi per ciascuno resta solo la cache locale.
let countriesRequest: Promise<WorldCountry[]> | null = null;
const loadAllCountries = (): Promise<WorldCountry[]> => {
  countriesRequest ??= fetch(COUNTRIES_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Countries data ${res.status}`);
      return res.json() as Promise<WorldCountry[]>;
    })
    .catch((err) => {
      countriesRequest = null;
      throw err;
    });
  return countriesRequest;
};

export const fetchCountryInfo = async (countryCode: string): Promise<CountryInfo> => {
  const code = countryCode.toUpperCase();
  const cached = readCache<CountryInfo>(`c3:${code}`, COUNTRY_TTL_MS);
  if (cached) return cached;

  const c = (await loadAllCountries()).find((x) => x.cca2 === code);
  if (!c) throw new Error(`Unknown country ${code}`);

  const info: CountryInfo = {
    code,
    cca3: c.cca3,
    nameEn: c.name.common,
    nameIt: c.translations?.ita?.common ?? c.name.common,
    capital: c.capital ?? [],
    region: c.region ?? '',
    subregion: c.subregion ?? '',
    languages: Object.values(c.languages ?? {}),
    languageCodes: Object.keys(c.languages ?? {}),
    currencies: Object.entries(c.currencies ?? {}).map(([cur, v]) => ({
      code: cur,
      name: v.name,
      symbol: v.symbol ?? '',
    })),
    callingCode: callingCodeOf(c.idd),
    drivingSide: LEFT_DRIVING.has(code) ? 'left' : 'right',
    latlng: c.latlng?.length === 2 ? [c.latlng[0], c.latlng[1]] : null,
  };
  writeCache(`c3:${code}`, info);
  return info;
};

/** Nome IANA del fuso (es. "Asia/Bangkok") per un punto, via Open-Meteo. */
export const fetchTimezoneName = async (lat: number, lon: number): Promise<string> => {
  const key = `tz:${lat.toFixed(1)},${lon.toFixed(1)}`;
  const cached = readCache<string>(key, COUNTRY_TTL_MS);
  if (cached) return cached;

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`
  );
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const { timezone } = (await res.json()) as { timezone?: string };
  if (!timezone) throw new Error('Open-Meteo: no timezone');
  writeCache(key, timezone);
  return timezone;
};

/** Offset corrente (minuti dall'UTC) di un fuso IANA, DST incluso. */
export const timezoneOffsetMinutes = (timeZone: string, at: Date = new Date()): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60000);
};

/** Tassi con base `base` (es. EUR). Cache di un'ora, come da specifica. */
export const fetchExchangeRates = async (base: string): Promise<Record<string, number>> => {
  const key = `r2:${base}`;
  const cached = readCache<Record<string, number>>(key, RATES_TTL_MS);
  if (cached) return cached;

  const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  if (!res.ok) throw new Error(`ExchangeRate ${res.status}`);
  const json = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number };
  if (json.result !== 'success' || !json.rates) throw new Error('ExchangeRate invalid response');
  writeCache(key, json.rates);
  if (json.time_last_update_unix) writeCache(`r2t:${base}`, json.time_last_update_unix);
  return json.rates;
};

/** Quando il servizio ha aggiornato i tassi (non quando li abbiamo scaricati), se noto. */
export const ratesUpdatedAt = (base: string): Date | null => {
  const unix = readCache<number>(`r2t:${base}`, COUNTRY_TTL_MS);
  return unix ? new Date(unix * 1000) : null;
};

/** Valuta -> paese per la bandiera, per TUTTE le valute del dataset. Con più paesi per la stessa
 *  valuta (USD, EUR, XOF...) vince quello il cui codice coincide con le prime due lettere della
 *  valuta (AFN -> AF), altrimenti il primo. */
export const loadCurrencyFlags = async (): Promise<Record<string, string>> => {
  const all = await loadAllCountries();
  const candidates = new Map<string, string[]>();
  for (const c of all) {
    for (const code of Object.keys(c.currencies ?? {})) {
      candidates.set(code, [...(candidates.get(code) ?? []), c.cca2]);
    }
  }
  const out: Record<string, string> = {};
  for (const [code, list] of candidates) {
    out[code] = list.find((cc) => cc === code.slice(0, 2)) ?? list[0];
  }
  return out;
};

export const farnesinaUrl = (cca3: string): string =>
  `https://www.viaggiaresicuri.it/find-country/country/${cca3.toUpperCase()}`;

/** Lingue ufficiali del paese nella lingua dell'interfaccia (es. "inglese"); se il browser non
 *  conosce il codice resta il nome inglese del dataset. */
export const languageNames = (info: CountryInfo, locale: string): string[] => {
  let display: Intl.DisplayNames | null = null;
  try {
    display = new Intl.DisplayNames([locale], { type: 'language' });
  } catch {
    display = null;
  }
  return info.languageCodes.map((code, i) => {
    const fallback = info.languages[i] ?? code;
    try {
      const name = display?.of(code);
      return name && name.toLowerCase() !== code.toLowerCase() ? name.charAt(0).toUpperCase() + name.slice(1) : fallback;
    } catch {
      return fallback;
    }
  });
};

const REGION_NAMES_IT: Record<string, string> = {
  Africa: 'Africa',
  Americas: 'Americhe',
  Asia: 'Asia',
  Europe: 'Europa',
  Oceania: 'Oceania',
  Antarctic: 'Antartide',
  'North America': 'America del Nord',
  'South America': 'America del Sud',
  'Central America': 'America Centrale',
  Caribbean: 'Caraibi',
  'Northern Europe': 'Europa settentrionale',
  'Southern Europe': 'Europa meridionale',
  'Western Europe': 'Europa occidentale',
  'Eastern Europe': 'Europa orientale',
  'Central Europe': 'Europa centrale',
  'South-Eastern Europe': 'Europa sud-orientale',
  'Southeast Europe': 'Europa sud-orientale',
  'Northern Africa': 'Africa settentrionale',
  'Western Africa': 'Africa occidentale',
  'Middle Africa': 'Africa centrale',
  'Eastern Africa': 'Africa orientale',
  'Southern Africa': 'Africa meridionale',
  'Central Asia': 'Asia centrale',
  'Eastern Asia': 'Asia orientale',
  'South-Eastern Asia': 'Asia sud-orientale',
  'Southeast Asia': 'Asia sud-orientale',
  'Southern Asia': 'Asia meridionale',
  'Western Asia': 'Asia occidentale',
  'Australia and New Zealand': 'Australia e Nuova Zelanda',
  Melanesia: 'Melanesia',
  Micronesia: 'Micronesia',
  Polynesia: 'Polinesia',
};

/** Nome di regione/sottoregione (dataset in inglese) nella lingua dell'interfaccia. */
export const regionName = (name: string, locale: string): string =>
  locale.startsWith('it') ? (REGION_NAMES_IT[name] ?? name) : name;
