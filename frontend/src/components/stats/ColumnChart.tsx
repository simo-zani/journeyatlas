import React, { useState } from 'react';

export interface ColumnDatum {
  key: string;
  /** Etichetta sotto la colonna (anno, mese). */
  label: string;
  value: number;
  /** Testo del tooltip, già formattato ("3 viaggi"). */
  tooltip: string;
}

interface ColumnChartProps {
  data: ColumnDatum[];
  /** Testo alternativo del grafico per gli screen reader. */
  ariaLabel: string;
  /** Mostra solo un'etichetta ogni N colonne (assi con molti anni). */
  labelEvery?: number;
}

const CHART_HEIGHT = 140;

/**
 * Colonne di una sola serie (nessuna legenda: il titolo della card la nomina).
 * Solo il massimo ha l'etichetta del valore; gli altri compaiono passandoci sopra.
 */
export const ColumnChart: React.FC<ColumnChartProps> = ({ data, ariaLabel, labelEvery = 1 }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const maxKey = data.find((d) => d.value === max)?.key;

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="relative flex items-end gap-[3px]" style={{ height: CHART_HEIGHT }}>
        {/* griglia di riferimento: solo la linea di base */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--border-subtle)]" aria-hidden="true" />
        {data.map((d) => {
          const active = hovered === d.key;
          const showValue = d.value > 0 && (active || (hovered === null && d.key === maxKey));
          return (
            <div
              key={d.key}
              className="relative flex-1 min-w-0 h-full flex flex-col justify-end items-center"
              onMouseEnter={() => setHovered(d.key)}
              onMouseLeave={() => setHovered(null)}
              title={d.tooltip}
            >
              {showValue && (
                <span
                  className="absolute pb-1 text-[11px] font-bold tabular-nums text-slate-700 dark:text-slate-200 whitespace-nowrap"
                  style={{ bottom: `${(d.value / max) * 100}%` }}
                >
                  {d.value}
                </span>
              )}
              <div
                className={`w-full max-w-[28px] rounded-t-[4px] transition-[height,opacity] duration-500 ${
                  d.value > 0 ? 'bg-gold' : ''
                } ${hovered !== null && !active ? 'opacity-50' : ''}`}
                style={{ height: d.value > 0 ? `${Math.max((d.value / max) * 100, 3)}%` : 0 }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-[3px] mt-1.5">
        {data.map((d, i) => (
          <span
            key={d.key}
            className={`flex-1 min-w-0 text-center text-[10px] font-semibold tabular-nums truncate ${
              hovered === d.key ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'
            }`}
          >
            {i % labelEvery === 0 || i === data.length - 1 ? d.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
};
