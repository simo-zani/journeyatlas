import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/** Paesi per cui il nome del browser è troppo breve o ambiguo: si usa atlas.entity.*. */
const NAME_OVERRIDES = new Set(['US']);

/**
 * Nome di un paese nella lingua dell'app. Dal browser (forma breve: "Stati Uniti");
 * le entità senza ISO e le poche eccezioni con la forma completa (atlas.entity.*)
 * dalle traduzioni dell'app.
 */
export const useCountryName = () => {
  const { t, i18n } = useTranslation();
  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([i18n.language], { type: 'region' });
    } catch {
      return null;
    }
  }, [i18n.language]);
  return useCallback(
    (code: string) =>
      code.startsWith('X-') || NAME_OVERRIDES.has(code) ? t(`atlas.entity.${code}`) : (regionNames?.of(code) ?? code),
    [regionNames, t]
  );
};
