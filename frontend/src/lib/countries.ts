import type { Destination } from '@/lib/types';
import { flagUrl } from '@/lib/flags';

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export interface DestinationSuggestion {
  city: string;
  country: string;
  countryCode: string | null;
  flagUrl: string | null;
  coords: { lat: number; lon: number } | null;
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
  display_name?: string;
  address?: NominatimAddress;
}

const pickCityName = (address: NominatimAddress | undefined): string => {
  const found = ['city', 'town', 'village', 'municipality', 'hamlet', 'locality'].find(
    (key) => typeof address?.[key as keyof NominatimAddress] === 'string' && (address[key as keyof NominatimAddress] as string).length > 0
  );
  return found ? (address![found as keyof NominatimAddress] as string) : '';
};

export const searchDestinations = async (
  query: string,
  signal?: AbortSignal
): Promise<DestinationSuggestion[]> => {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'it');
  url.searchParams.set('limit', '8');

  const res = await fetch(url.toString(), {
    signal,
    headers: { 'Accept-Language': 'it' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const results = (await res.json()) as NominatimResult[];

  return results
    .map((result): DestinationSuggestion | null => {
      const city = pickCityName(result.address) || result.display_name?.split(',')[0]?.trim() || '';
      const country = result.address?.country ?? '';
      if (!city && !country) return null;

      const lat = Number(result.lat);
      const lon = Number(result.lon);
      const countryCode = result.address?.country_code ?? '';

      return {
        city,
        country,
        countryCode: countryCode || null,
        flagUrl: countryCode ? flagUrl(countryCode) : null,
        coords: Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null,
      };
    })
    .filter((s): s is DestinationSuggestion => s !== null && (s.city.length > 0 || s.country.length > 0));
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