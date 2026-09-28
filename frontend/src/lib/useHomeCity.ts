import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { fetchProfile } from '@/lib/api';
import type { Coordinates } from '@/lib/types';

export type HomeCity = { city: string; coords: Coordinates | null } | null;

/**
 * Il form mezzo è montato in due punti (tab Mezzi e calendario) e il profilo non
 * cambia mentre si sta compilando: una cache a modulo evita la seconda lettura.
 */
let cache: { userId: string; value: HomeCity } | null = null;

/**
 * Da chiamare dopo aver salvato il profilo: la città nuova è già in memoria,
 * far rileggere il profilo dal form mezzo sarebbe una richiesta inutile.
 */
export const setHomeCityCache = (userId: string, value: HomeCity) => {
  cache = { userId, value };
};

/**
 * Città di casa dell'utente, o null se non l'ha impostata. Serve ai consigliati
 * del campo aeroporto: senza, il campo resta una ricerca libera.
 */
export const useHomeCity = (): HomeCity => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [home, setHome] = useState<HomeCity>(cache?.value ?? null);

  useEffect(() => {
    if (!userId) {
      setHome(null);
      return;
    }
    if (cache?.userId === userId) {
      setHome(cache.value);
      return;
    }
    let active = true;
    void fetchProfile(userId)
      .then((profile) => {
        const value: HomeCity = profile?.home_city
          ? { city: profile.home_city, coords: profile.home_city_coords ?? null }
          : null;
        cache = { userId, value };
        if (active) setHome(value);
      })
      .catch(() => {
        // Profilo non leggibile: si vola senza consigliati, il resto del form
        // funziona. Non è un errore da mostrare all'utente.
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return home;
};
