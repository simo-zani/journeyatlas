import { useEffect, useMemo, useState } from 'react';
import type { AtlasCity } from '@/lib/atlas';

// Nomi delle città nella lingua dell'interfaccia. Le mete hanno il nome scelto
// dall'utente (nella lingua in cui ha cercato), gli scali quello inglese delle
// anagrafiche di aeroporti/stazioni/porti: per le etichette sull'atlante si
// chiede a Nominatim il nome locale. Solo per le città del paese aperto (poche
// richieste, una al secondo come chiede Nominatim) e con cache nel browser.

const CACHE_PREFIX = 'ja-city:';
const NOMINATIM_DELAY_MS = 1100;

const cacheKey = (lang: string, key: string) => `${CACHE_PREFIX}${lang}:${key}`;

const readCache = (lang: string, key: string): string | null => {
  try {
    return localStorage.getItem(cacheKey(lang, key));
  } catch {
    return null;
  }
};

const writeCache = (lang: string, key: string, value: string): void => {
  try {
    localStorage.setItem(cacheKey(lang, key), value);
  } catch {
    // ignore storage errors (privacy mode, quota)
  }
};

const fetchLocalizedName = async (city: AtlasCity, lang: string, signal: AbortSignal): Promise<string | null> => {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('city', city.city);
  // I codici "X-..." (stati non riconosciuti) non sono ISO: lì si cerca solo per nome.
  if (city.countryCode && /^[A-Z]{2}$/.test(city.countryCode)) url.searchParams.set('countrycodes', city.countryCode.toLowerCase());
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('accept-language', lang);
  url.searchParams.set('limit', '1');
  const res = await fetch(url.toString(), { signal, headers: { 'Accept-Language': lang } });
  if (!res.ok) return null;
  const json = (await res.json()) as { name?: string }[];
  return json[0]?.name?.trim() || null;
};

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(id);
      resolve();
    });
  });

/** Nome tradotto (chiave → nome) delle città di `countryCode`; le altre restano come sono. */
export const useLocalizedCityNames = (cities: AtlasCity[], countryCode: string | null, lang: string): Map<string, string> => {
  // Chiavi "lingua|città": cambiando lingua i nomi dell'altra non si usano più.
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const language = lang.split('-')[0];

  useEffect(() => {
    if (!countryCode) return;
    const inCountry = cities.filter((c) => (c.visited || c.transit) && c.countryCode === countryCode);
    const found = new Map<string, string>();
    const missing: AtlasCity[] = [];
    for (const c of inCountry) {
      const cached = readCache(language, c.key);
      if (cached) found.set(`${language}|${c.key}`, cached);
      else missing.push(c);
    }
    if (found.size) setNames((prev) => new Map([...prev, ...found]));
    if (!missing.length) return;

    const controller = new AbortController();
    void (async () => {
      for (const [i, c] of missing.entries()) {
        if (i > 0) await sleep(NOMINATIM_DELAY_MS, controller.signal);
        if (controller.signal.aborted) return;
        try {
          const name = await fetchLocalizedName(c, language, controller.signal);
          if (!name) continue;
          writeCache(language, c.key, name);
          setNames((prev) => new Map(prev).set(`${language}|${c.key}`, name));
        } catch {
          if (controller.signal.aborted) return;
        }
      }
    })();
    return () => controller.abort();
  }, [cities, countryCode, language]);

  return useMemo(() => {
    const prefix = `${language}|`;
    const out = new Map<string, string>();
    names.forEach((name, k) => {
      if (k.startsWith(prefix)) out.set(k.slice(prefix.length), name);
    });
    return out;
  }, [names, language]);
};
