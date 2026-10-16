import { ensureAtlasMarks } from '@/lib/api';
import { limitedEntityAt, loadRegionIndex, loadRegions, loadWorldGeo, regionAt, type WorldGeo } from '@/lib/atlasGeo';
import type { Coordinates } from '@/lib/types';

/** Paese (alpha-2 o "X-...") in cui cade un punto. Prima le entità a riconoscimento
 * limitato (stanno dentro il paese "madre"), poi i paesi; regionAt tiene anche le
 * città sulla costa che cadono appena in mare. */
export const countryAt = (geo: WorldGeo, coords: Coordinates): string | null =>
  limitedEntityAt(geo, coords.lat, coords.lon) ??
  regionAt(geo.features.filter((f) => f.code), coords.lat, coords.lon);

export type HomeMark = { country_code: string; region_key: string };

/**
 * Segni dell'atlante per la città di casa: il paese e, se ha i confini delle
 * regioni, la regione. Si salvano come segni a mano, così restano anche dopo
 * aver cambiato casa.
 */
export const homeMarks = async (coords: Coordinates): Promise<HomeMark[]> => {
  const [geo, regionIndex] = await Promise.all([loadWorldGeo(), loadRegionIndex()]);
  const code = countryAt(geo, coords);
  if (!code) return [];
  const cca3 = geo.index.find((c) => c.code === code)?.cca3;
  if (cca3 && regionIndex[cca3]) {
    try {
      const region = regionAt(await loadRegions(cca3), coords.lat, coords.lon);
      // Basta la regione: un paese con almeno una regione segnata è già sbloccato.
      if (region) return [{ country_code: code, region_key: region }];
    } catch {
      // confini delle regioni non disponibili: si segna il paese intero
    }
  }
  return [{ country_code: code, region_key: '' }];
};

/** Calcola e salva i segni della casa; restituisce quelli calcolati. */
export const markHomeOnAtlas = async (coords: Coordinates): Promise<HomeMark[]> => {
  const marks = await homeMarks(coords);
  await ensureAtlasMarks(marks);
  return marks;
};
