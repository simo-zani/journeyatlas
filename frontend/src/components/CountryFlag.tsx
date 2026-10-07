import React, { useState } from 'react';
import { flagUrl } from '@/lib/flags';

const SIZES = {
  xs: { w: 20, h: 14 },
  sm: { w: 24, h: 16 },
  md: { w: 28, h: 20 },
  lg: { w: 40, h: 28 },
} as const;

export type CountryFlagSize = keyof typeof SIZES;

interface CountryFlagProps {
  code: string;
  size?: CountryFlagSize;
  /** Etichetta accessibile: se assente l'immagine resta decorativa. */
  label?: string;
  className?: string;
  /** Gruppi di bandiere affiancate: le quadrate occupano solo la propria larghezza, senza lasciare spazio ai lati. */
  tight?: boolean;
  /** Non più usato: tutte le bandiere riempiono lo stesso riquadro (restano per compatibilità). */
  fit?: 'contain' | 'cover';
  /** URL alternativo, per bandiere che non sono di un paese (es. l'Unione Europea). */
  src?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  size = 'md',
  label,
  className = '',
  tight = false,
  src,
}) => {
  const [hasError, setHasError] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
  if (!code || hasError) return null;
  const { w, h } = SIZES[size];

  // Stessa altezza per tutte. Le bandiere rettangolari riempiono lo stesso riquadro largo (quelle più larghe
  // sono tagliate ai lati, mai deformate); quelle quasi quadrate (Svizzera, Vaticano) restano quadrate, con un
  // margine ai lati che mantiene lo spazio del riquadro largo (negli elenchi i nomi restano allineati),
  // tranne con `tight`, per le bandiere affiancate tra loro.
  const square = ratio !== null && ratio < 1.2;
  const width = square ? h : w;
  return (
    <img
      src={src ?? flagUrl(code)}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      width={width}
      height={h}
      style={{ width, height: h, borderRadius: Math.round(h * 0.4), marginInline: square && !tight ? (w - h) / 2 : undefined }}
      className={`shrink-0 object-cover ${className}`}
      loading="lazy"
      onLoad={(e) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth && naturalHeight) setRatio(naturalWidth / naturalHeight);
      }}
      onError={() => setHasError(true)}
    />
  );
};
