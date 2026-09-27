import React, { useEffect, useState } from 'react';
import { resolveCountryFlags } from '@/lib/flags';
import { CountryFlag } from '@/components/CountryFlag';
import type { Destination } from '@/lib/types';

interface TripFlagsProps {
  destinations?: Destination[] | null;
  size?: 'sm' | 'md';
}

/**
 * `TripFlags` ha due formati pubblici (sm/md) da mantenere distinti dai nomi
 * interni di CountryFlag, quindi si mappa: sm->28x20, md->40x28, esattamente
 * le dimensioni che le bandierine avevano prima dell'unificazione.
 */
const FLAG_SIZE = { sm: 'md', md: 'lg' } as const;

export const TripFlags: React.FC<TripFlagsProps> = ({ destinations, size = 'md' }) => {
  const [codes, setCodes] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!destinations?.length) {
      setCodes([]);
      return;
    }
    const resolve = async () => {
      const resolved = await resolveCountryFlags(destinations);
      if (!cancelled) setCodes(resolved);
    };
    void resolve();
    return () => {
      cancelled = true;
    };
  }, [destinations]);

  if (codes.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
      {codes.map((code) => (
        <CountryFlag key={code} code={code} size={FLAG_SIZE[size]} className="shadow-sm" />
      ))}
    </div>
  );
};