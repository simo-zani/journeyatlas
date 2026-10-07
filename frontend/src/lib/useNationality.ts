import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { fetchProfile } from '@/lib/api';

/**
 * Stessa logica di `useHomeCity`: il profilo non cambia mentre si naviga, quindi una cache
 * a modulo evita riletture; `setNationalityCache` la aggiorna dopo il salvataggio del profilo.
 */
let cache: { userId: string; value: string | null } | null = null;

export const setNationalityCache = (userId: string, value: string | null) => {
  cache = { userId, value };
};

/** Codice ISO alpha-2 della nazionalità dell'utente (maiuscolo), o null se non l'ha impostata. */
export const useNationality = (): string | null => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [nationality, setNationality] = useState<string | null>(cache?.userId === userId ? cache.value : null);

  useEffect(() => {
    if (!userId) {
      setNationality(null);
      return;
    }
    if (cache?.userId === userId) {
      setNationality(cache.value);
      return;
    }
    let active = true;
    void fetchProfile(userId)
      .then((profile) => {
        const value = profile?.nationality ? profile.nationality.toUpperCase() : null;
        cache = { userId, value };
        if (active) setNationality(value);
      })
      .catch(() => {
        // profilo non leggibile (o colonna non ancora migrata): si mostrano tutti i paesi
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return nationality;
};
