import React from 'react';
import type { Capital } from '@/lib/capitals';

/** Stella a cinque punte centrata in (0, 0): il simbolo cartografico della capitale. */
const STAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 8.5 : 3.6;
  const a = (Math.PI / 5) * i - Math.PI / 2;
  return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
}).join(' ');

interface CapitalMarkerProps {
  capital: Capital;
  /** false quando lo stesso posto ha già un'etichetta (es. la casa). */
  showLabel?: boolean;
}

/** Stella e nome della capitale, disegnati attorno a (0, 0): il genitore li sposta con un transform. */
export const CapitalMarker: React.FC<CapitalMarkerProps> = ({ capital, showLabel = true }) => (
  <>
    <polygon
      points={STAR_POINTS}
      strokeWidth={1.2}
      strokeLinejoin="round"
      className="fill-deep-blue dark:fill-white"
      style={{ stroke: 'var(--atlas-border)' }}
    />
    {showLabel && (
      <text
        x={12}
        y={4}
        className="text-[11px] font-bold italic uppercase tracking-wide fill-slate-700 dark:fill-slate-100"
        style={{ paintOrder: 'stroke', stroke: 'var(--atlas-land)', strokeWidth: 3 }}
      >
        {capital.name}
      </text>
    )}
  </>
);
