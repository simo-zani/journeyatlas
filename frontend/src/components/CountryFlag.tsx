import React, { useState } from 'react';
import { flagUrl } from '@/lib/flags';

const SIZES = {
  xs: { box: 'w-5 h-3.5', w: 20, h: 14 },
  sm: { box: 'w-6 h-4', w: 24, h: 16 },
  md: { box: 'w-7 h-5', w: 28, h: 20 },
  lg: { box: 'w-10 h-7', w: 40, h: 28 },
} as const;

export type CountryFlagSize = keyof typeof SIZES;

interface CountryFlagProps {
  code: string;
  size?: CountryFlagSize;
  /** Etichetta accessibile: se assente l'immagine resta decorativa. */
  label?: string;
  className?: string;
  fit?: 'contain' | 'cover';
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  size = 'md',
  label,
  className = '',
  fit = 'contain',
}) => {
  const [hasError, setHasError] = useState(false);
  if (!code || hasError) return null;
  const { box, w, h } = SIZES[size];
  return (
    <img
      src={flagUrl(code)}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      width={w}
      height={h}
      className={`${box} rounded-full shrink-0 ${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};
