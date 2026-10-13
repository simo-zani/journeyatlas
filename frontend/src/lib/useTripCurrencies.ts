import { useEffect, useMemo, useState } from 'react';
import { fetchCountryInfo, type CountryInfo } from '@/lib/countryInfo';
import { resolveCountryFlags } from '@/lib/flags';
import { findTransitCountryCodes } from '@/lib/tripCountries';
import { useHomeCity } from '@/lib/useHomeCity';
import { useNationality } from '@/lib/useNationality';
import type { Destination } from '@/lib/types';

export type TripCurrencySource = 'base' | 'home' | 'destination' | 'transit';

export interface TripCurrency {
  code: string;
  /** Perché è proposta, nell'ordine in cui compare (la prima è la ragione principale). */
  sources: TripCurrencySource[];
  /** Paesi (mete, scali o nazionalità) che usano questa valuta. */
  countries: CountryInfo[];
}

/**
 * Valute tipiche di un viaggio, da proporre per prime quando si registra una
 * spesa: quella del viaggio, quella della nazionalità di chi guarda, quelle
 * delle mete e quelle dei paesi di scalo (es. sterlina per uno scalo a
 * Londra). I paesi si ricavano come in Info Paese; se qualcosa fallisce si
 * ripiega sulle sole valute già note, senza errori.
 */
export const useTripCurrencies = (
  tripId: string,
  destinations: Destination[] | null,
  baseCurrency: string
): TripCurrency[] => {
  const nationality = useNationality();
  const homeCity = useHomeCity();
  const [found, setFound] = useState<{ source: TripCurrencySource; country: CountryInfo }[]>([]);

  // Le mete arrivano come array nuovo a ogni render: chiave stabile per l'effetto.
  const destinationsKey = JSON.stringify(destinations ?? []);
  const homeKey = homeCity?.coords ? `${homeCity.coords.lat},${homeCity.coords.lon}` : '';

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const dest = (await resolveCountryFlags(destinations ?? [])).map((c) => c.toUpperCase());
      let transit: string[] = [];
      try {
        transit = await findTransitCountryCodes(tripId, dest, homeCity?.coords);
      } catch {
        transit = [];
      }
      const entries: { source: TripCurrencySource; code: string }[] = [
        ...(nationality ? [{ source: 'home' as const, code: nationality }] : []),
        ...dest.map((code) => ({ source: 'destination' as const, code })),
        ...transit.map((code) => ({ source: 'transit' as const, code })),
      ];
      const settled = await Promise.allSettled(
        entries.map(async (e) => ({ source: e.source, country: await fetchCountryInfo(e.code) }))
      );
      if (!cancelled) setFound(settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])));
    };
    void run().catch(() => !cancelled && setFound([]));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, destinationsKey, nationality, homeKey]);

  return useMemo(() => {
    const byCode = new Map<string, TripCurrency>();
    const add = (code: string, source: TripCurrencySource, country?: CountryInfo) => {
      const entry = byCode.get(code) ?? { code, sources: [], countries: [] };
      if (!entry.sources.includes(source)) entry.sources.push(source);
      if (country && !entry.countries.some((c) => c.code === country.code)) entry.countries.push(country);
      byCode.set(code, entry);
    };
    add(baseCurrency, 'base');
    for (const { source, country } of found) {
      for (const cur of country.currencies) add(cur.code, source, country);
    }
    return [...byCode.values()];
  }, [found, baseCurrency]);
};
