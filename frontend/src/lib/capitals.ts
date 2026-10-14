import { useEffect, useState } from 'react';
import { distanceKm } from '@/lib/airports';
import type { Coordinates } from '@/lib/types';

// Capitali dei paesi (public/capitals.json, generato da scripts/build-capitals.mjs).

interface CapitalEntry {
  lat: number;
  lon: number;
  it: string;
  en: string;
}

export interface Capital {
  name: string;
  lat: number;
  lon: number;
}

/** Sotto questa distanza una città (o la casa) coincide con la capitale: il nome si scrive una volta sola. */
const SAME_PLACE_KM = 15;

export const nearCapital = (capital: Capital | null, place: Coordinates | null | undefined): boolean =>
  !!capital && !!place && distanceKm(capital, place) < SAME_PLACE_KM;

let request: Promise<Record<string, CapitalEntry>> | null = null;

const loadCapitals = (): Promise<Record<string, CapitalEntry>> => {
  request ??= fetch('/capitals.json')
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, CapitalEntry>>) : {}))
    .catch(() => {
      request = null; // si riprova al prossimo paese
      return {};
    });
  return request;
};

/** Capitale del paese `code` (alpha-2 o "X-..."), con il nome nella lingua dell'interfaccia. */
export const useCapital = (code: string | null, lang: string): Capital | null => {
  const [capital, setCapital] = useState<Capital | null>(null);
  const language = lang.split('-')[0];

  useEffect(() => {
    setCapital(null);
    if (!code) return;
    let cancelled = false;
    void loadCapitals().then((all) => {
      const c = all[code.toUpperCase()];
      if (cancelled || !c) return;
      setCapital({ name: (language === 'it' ? c.it : c.en) || c.en || c.it, lat: c.lat, lon: c.lon });
    });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  return capital;
};
