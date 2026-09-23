/** Unsplash API client — cover image suggestions for a trip (1.5).
 * Free tier ("Demo" app): 50 richieste/ora, nessun costo.
 * Richiede VITE_UNSPLASH_ACCESS_KEY in .env.local (vedi .env.example).
 * Registrazione: https://unsplash.com/developers */

export interface UnsplashSuggestion {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  authorName: string;
  authorProfileUrl: string;
  /** Endpoint da chiamare quando la foto viene effettivamente scelta,
   * come richiesto dalle Unsplash API Guidelines (trigger di download). */
  downloadLocation: string;
}

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;

export const isUnsplashConfigured = (): boolean => Boolean(ACCESS_KEY);

/** Aggiunge l'attribuzione richiesta dalle Unsplash API Guidelines ai link
 * verso il profilo autore / Unsplash stesso. */
const withUtm = (url: string): string =>
  `${url}${url.includes('?') ? '&' : '?'}utm_source=journeyatlas&utm_medium=referral`;

interface UnsplashApiPhoto {
  id: string;
  urls: { small: string; regular: string };
  user: { name: string; links: { html: string } };
  links: { download_location: string };
}

export async function searchUnsplashCovers(query: string): Promise<UnsplashSuggestion[]> {
  if (!ACCESS_KEY || !query.trim()) return [];

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query.trim());
  url.searchParams.set('per_page', '6');
  url.searchParams.set('orientation', 'landscape');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  });
  if (!res.ok) throw new Error(`Unsplash: errore ${res.status}`);

  const data = (await res.json()) as { results: UnsplashApiPhoto[] };
  return (data.results ?? []).map((p) => ({
    id: p.id,
    thumbUrl: p.urls.small,
    fullUrl: p.urls.regular,
    authorName: p.user.name,
    authorProfileUrl: withUtm(p.user.links.html),
    downloadLocation: p.links.download_location,
  }));
}

/** Da chiamare quando una foto suggerita viene scelta come copertina —
 * richiesto dalle Unsplash API Guidelines, non blocca il flusso se fallisce. */
export function trackUnsplashDownload(downloadLocation: string): void {
  if (!ACCESS_KEY) return;
  fetch(downloadLocation, { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }).catch(() => {
    // best-effort: un fallimento qui non deve bloccare la scelta della copertina
  });
}

export const UNSPLASH_HOME_URL = withUtm('https://unsplash.com');
