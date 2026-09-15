import React, { useEffect, useState } from 'react';
import { flagUrl, resolveCountryFlags } from '@/lib/flags';
import type { Destination } from '@/lib/types';

interface TripFlagsProps {
  destinations?: Destination[] | null;
  size?: 'sm' | 'md';
}

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

  const sizeClass = size === 'sm' ? 'w-7 h-5' : 'w-10 h-7';

  return (
    <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
      {codes.map((code) => (
        <img
          key={code}
          src={flagUrl(code)}
          alt=""
          className={`${sizeClass} rounded-sm object-cover shadow-sm`}
          loading="lazy"
        />
      ))}
    </div>
  );
};