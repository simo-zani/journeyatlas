const FLAG_CDN_BASE = 'https://flags.restcountries.com/v5/w320';

const CACHE_PREFIX = 'ja-cc:';

export const flagUrl = (countryCode: string): string =>
  `${FLAG_CDN_BASE}/${countryCode.toLowerCase()}.png`;

interface FlagSource {
  countryCode?: string | null;
  country?: string | null;
  city?: string | null;
}

const readCache = (key: string): string => {
  try {
    return localStorage.getItem(CACHE_PREFIX + key) ?? '';
  } catch {
    return '';
  }
};

const writeCache = (key: string, value: string): void => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch {
    // ignore storage errors (privacy mode, quota)
  }
};

const resolveCountryCode = async (key: string): Promise<string> => {
  const cached = readCache(key);
  if (cached) return cached;

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', key);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'it');
    url.searchParams.set('type', 'country');
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString());
    if (!res.ok) return '';

    const json = (await res.json()) as { address?: { country_code?: string } }[];
    const code = json[0]?.address?.country_code ?? '';
    if (code) writeCache(key, code);
    return code;
  } catch {
    return '';
  }
};

export const resolveCountryFlags = async (sources: FlagSource[]): Promise<string[]> => {
  const unique = new Map<string, string>();
  for (const source of sources) {
    const key = (source.countryCode || source.country || source.city || '').trim();
    if (key && !unique.has(key)) unique.set(key, source.countryCode ?? '');
  }

  const codes = new Set<string>();
  for (const [key, storedCode] of unique) {
    const code = storedCode || (await resolveCountryCode(key));
    if (code) codes.add(code.toLowerCase());
  }
  return [...codes];
};