import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_OTHER_VAR, getCategoryColor } from '@/lib/categoryColors';
import type { ActivityRow } from '@/lib/types';

interface ActivityCategoryChartProps {
  activities: ActivityRow[];
  /** Stable color map built from the trip's full, stably-sorted category list
   * (same one used for card badges) — keeps identity consistent everywhere. */
  colorMap: Map<string, string>;
  categoryLabel: (category: string) => string;
}

interface Slice {
  key: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

const MAX_SLICES = 7; // + "Altro" bucket, matches the 8-slot categorical palette

const RADIUS = 90;
const INNER_RADIUS = 56;
const CENTER = 100;
const GAP_DEG = 1.5; // visual gap between adjacent wedges

const polarToCartesian = (angleDeg: number, r: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
};

const arcPath = (startAngle: number, endAngle: number): string => {
  const start = polarToCartesian(endAngle, RADIUS);
  const end = polarToCartesian(startAngle, RADIUS);
  const innerStart = polarToCartesian(endAngle, INNER_RADIUS);
  const innerEnd = polarToCartesian(startAngle, INNER_RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
};

export const ActivityCategoryChart: React.FC<ActivityCategoryChartProps> = ({
  activities,
  colorMap,
  categoryLabel,
}) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);

  const slices = useMemo<Slice[]>(() => {
    const counts = new Map<string, number>();
    for (const a of activities) {
      const key = a.category ?? '__none__';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, MAX_SLICES);
    const rest = entries.slice(MAX_SLICES);
    const restTotal = rest.reduce((sum, [, c]) => sum + c, 0);

    const total = activities.length || 1;
    let cursor = 0;
    const result: Slice[] = top.map(([key, count]) => {
      const percent = (count / total) * 100;
      const startAngle = cursor;
      const endAngle = cursor + (count / total) * 360;
      cursor = endAngle;
      return {
        key,
        label: key === '__none__' ? t('activity.chart.uncategorized') : categoryLabel(key),
        count,
        percent,
        color: key === '__none__' ? CATEGORY_OTHER_VAR : getCategoryColor(key, colorMap),
        startAngle,
        endAngle,
      };
    });

    if (restTotal > 0) {
      const percent = (restTotal / total) * 100;
      const startAngle = cursor;
      const endAngle = cursor + (restTotal / total) * 360;
      result.push({
        key: '__other__',
        label: t('activity.chart.other'),
        count: restTotal,
        percent,
        color: CATEGORY_OTHER_VAR,
        startAngle,
        endAngle,
      });
    }

    return result;
  }, [activities, colorMap, categoryLabel, t]);

  const hoveredSlice = slices.find((s) => s.key === hovered) ?? null;

  if (activities.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-title">{t('activity.chart.empty')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 py-4">
      <div className="relative shrink-0">
        <svg viewBox="0 0 200 200" className="w-64 h-64" role="img" aria-label={t('activity.chart.title')}>
          {slices.map((slice) => {
            const gapped =
              slices.length > 1
                ? { start: slice.startAngle + GAP_DEG / 2, end: slice.endAngle - GAP_DEG / 2 }
                : { start: slice.startAngle, end: slice.endAngle };
            const isHovered = hovered === slice.key;
            return (
              <path
                key={slice.key}
                d={arcPath(gapped.start, gapped.end)}
                tabIndex={0}
                role="button"
                aria-label={`${slice.label}: ${slice.count} (${slice.percent.toFixed(0)}%)`}
                onMouseEnter={() => setHovered(slice.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(slice.key)}
                onBlur={() => setHovered(null)}
                className="cursor-pointer transition-all duration-150 outline-none focus-visible:brightness-110"
                style={{
                  // `var()` inside the `fill` SVG attribute is unreliable
                  // across browsers — setting it via the `style` object goes
                  // through the real CSS cascade, where custom properties
                  // always resolve.
                  fill: slice.color,
                  opacity: hovered && !isHovered ? 0.45 : 1,
                  transform: isHovered ? 'scale(1.035)' : 'scale(1)',
                  transformOrigin: '100px 100px',
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-8">
          {hoveredSlice ? (
            <>
              <span className="text-2xl font-poppins font-extrabold text-slate-900 dark:text-slate-100">
                {hoveredSlice.count}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                {hoveredSlice.label}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {hoveredSlice.percent.toFixed(0)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-poppins font-extrabold text-slate-900 dark:text-slate-100">
                {activities.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('activity.chart.total')}
              </span>
            </>
          )}
        </div>
      </div>

      <ul className="flex-1 w-full space-y-1.5">
        {slices.map((slice) => (
          <li key={slice.key}>
            <button
              type="button"
              onMouseEnter={() => setHovered(slice.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(slice.key)}
              onBlur={() => setHovered(null)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-default ${
                hovered === slice.key ? 'bg-slate-900/5 dark:bg-white/5' : ''
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
                aria-hidden="true"
              />
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                {slice.label}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                {slice.count}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 w-10 text-right tabular-nums">
                {slice.percent.toFixed(0)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
