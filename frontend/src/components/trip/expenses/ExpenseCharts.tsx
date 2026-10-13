import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/Card';
import { CATEGORY_OTHER_VAR, categoryColorVar, getCategoryColor } from '@/lib/categoryColors';
import { baseCentsOf, formatCurrency, participantName, toCents, type ExpenseSummary } from '@/lib/expenses';
import type { ExpenseWithSplits, TripParticipantDetail } from '@/lib/types';
import { ParticipantAvatar } from './participants';

interface ExpenseChartsProps {
  expenses: ExpenseWithSplits[];
  baseCurrency: string;
  summary: ExpenseSummary;
  participants: TripParticipantDetail[];
  currentUserId: string;
  /** Mappa colori stabile costruita sull'elenco completo delle categorie (come nel tab Attività). */
  colorMap: Map<string, string>;
  categoryLabel: (category: string) => string;
  formatMoney: (cents: number) => string;
  tripStart: string | null;
  tripEnd: string | null;
}

// Serie fisse del grafico per persona: stesso ordine della palette categorica.
const PAID_COLOR = categoryColorVar(0);
const SHARE_COLOR = categoryColorVar(6);
const DAY_COLOR = categoryColorVar(0);

// ---------------------------------------------------------------------------
// Ciambella per categoria (stessa geometria di ActivityCategoryChart)
// ---------------------------------------------------------------------------

const MAX_SLICES = 7; // + "Altro", come la palette a 8 colori
const RADIUS = 90;
const INNER_RADIUS = 56;
const CENTER = 100;
const GAP_DEG = 1.5;

const polarToCartesian = (angleDeg: number, r: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
};

const arcPath = (startAngle: number, endAngle: number): string => {
  // Un solo spicchio a 360° degenera in un arco nullo: lo si ferma appena prima.
  const end = Math.min(endAngle, startAngle + 359.99);
  const start = polarToCartesian(end, RADIUS);
  const stop = polarToCartesian(startAngle, RADIUS);
  const innerStart = polarToCartesian(end, INNER_RADIUS);
  const innerEnd = polarToCartesian(startAngle, INNER_RADIUS);
  const largeArc = end - startAngle > 180 ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${stop.x} ${stop.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
};

interface Slice {
  key: string;
  label: string;
  cents: number;
  percent: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

const CategoryDonut: React.FC<Pick<ExpenseChartsProps, 'summary' | 'colorMap' | 'categoryLabel' | 'formatMoney'>> = ({
  summary,
  colorMap,
  categoryLabel,
  formatMoney,
}) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);

  const slices = useMemo<Slice[]>(() => {
    const entries = Array.from(summary.byCategory.entries())
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, MAX_SLICES);
    const restTotal = entries.slice(MAX_SLICES).reduce((s, [, c]) => s + c, 0);
    const total = summary.total || 1;
    let cursor = 0;
    const make = (key: string, label: string, cents: number, color: string): Slice => {
      const startAngle = cursor;
      cursor += (cents / total) * 360;
      return { key, label, cents, percent: (cents / total) * 100, color, startAngle, endAngle: cursor };
    };
    const result = top.map(([key, cents]) =>
      key === ''
        ? make('__none__', t('expenses.chart.uncategorized'), cents, CATEGORY_OTHER_VAR)
        : make(key, categoryLabel(key), cents, getCategoryColor(key, colorMap))
    );
    if (restTotal > 0) result.push(make('__other__', t('expenses.chart.other'), restTotal, CATEGORY_OTHER_VAR));
    return result;
  }, [summary, colorMap, categoryLabel, t]);

  const hoveredSlice = slices.find((s) => s.key === hovered) ?? null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 py-2">
      <div className="relative shrink-0">
        <svg viewBox="0 0 200 200" className="w-64 h-64" role="img" aria-label={t('expenses.chart.byCategory')}>
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
                aria-label={`${slice.label}: ${formatMoney(slice.cents)} (${slice.percent.toFixed(0)}%)`}
                onMouseEnter={() => setHovered(slice.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(slice.key)}
                onBlur={() => setHovered(null)}
                className="cursor-pointer transition-all duration-150 outline-none focus-visible:brightness-110"
                style={{
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
              <span className="text-lg font-poppins font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatMoney(hoveredSlice.cents)}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                {hoveredSlice.label}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{hoveredSlice.percent.toFixed(0)}%</span>
            </>
          ) : (
            <>
              <span className="text-xl font-poppins font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatMoney(summary.total)}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('expenses.chart.total')}</span>
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
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} aria-hidden="true" />
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                {slice.label}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                {formatMoney(slice.cents)}
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

// ---------------------------------------------------------------------------
// Pagato vs quota per persona (barre orizzontali, una scala sola)
// ---------------------------------------------------------------------------

interface PersonBarProps {
  cents: number;
  max: number;
  color: string;
  label: string;
  formatMoney: (cents: number) => string;
}

const PersonBar: React.FC<PersonBarProps> = ({ cents, max, color, label, formatMoney }) => (
  <div className="relative flex items-center gap-2.5" title={`${label}: ${formatMoney(cents)}`}>
    <div className="flex-1 h-3 rounded-full bg-slate-900/5 dark:bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-r-[4px] transition-[width] duration-500 ease-out"
        style={{ width: `${(cents / max) * 100}%`, backgroundColor: color, minWidth: cents > 0 ? 4 : 0 }}
      />
    </div>
    <span className="w-[96px] shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
      {formatMoney(cents)}
    </span>
  </div>
);

const PersonBars: React.FC<Pick<ExpenseChartsProps, 'summary' | 'participants' | 'currentUserId' | 'formatMoney'>> = ({
  summary,
  participants,
  currentUserId,
  formatMoney,
}) => {
  const { t } = useTranslation();
  const max = Math.max(
    1,
    ...participants.map((p) => {
      const r = summary.byParticipant.get(p.participant_id);
      return Math.max(r?.paid ?? 0, r?.share ?? 0);
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PAID_COLOR }} aria-hidden="true" />
          {t('expenses.chart.paid')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SHARE_COLOR }} aria-hidden="true" />
          {t('expenses.chart.share')}
        </span>
      </div>
      <ul className="space-y-4">
        {participants.map((p) => {
          const r = summary.byParticipant.get(p.participant_id);
          return (
            <li key={p.participant_id} className="flex items-center gap-3">
              <ParticipantAvatar participant={p} size="md" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
                  {participantName(p, currentUserId, t)}
                </p>
                <PersonBar cents={r?.paid ?? 0} max={max} color={PAID_COLOR} label={t('expenses.chart.paid')} formatMoney={formatMoney} />
                <PersonBar cents={r?.share ?? 0} max={max} color={SHARE_COLOR} label={t('expenses.chart.share')} formatMoney={formatMoney} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Spesa per giorno (barre verticali). Le spese fuori dalle date del viaggio
// (es. voli prenotati mesi prima) finiscono in "Prima"/"Dopo" invece di
// allungare l'asse di mesi vuoti.
// ---------------------------------------------------------------------------

interface DayBucket {
  key: string;
  label: string;
  title: string;
  cents: number;
  muted?: boolean;
}

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const DailyBars: React.FC<Pick<ExpenseChartsProps, 'summary' | 'formatMoney' | 'tripStart' | 'tripEnd'>> = ({
  summary,
  formatMoney,
  tripStart,
  tripEnd,
}) => {
  const { t, i18n } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);

  const buckets = useMemo<DayBucket[]>(() => {
    const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
      new Date(`${iso}T00:00:00`).toLocaleDateString(i18n.language, opts);
    const dayBucket = (iso: string, cents: number): DayBucket => ({
      key: iso,
      label: fmt(iso, { day: 'numeric' }),
      title: fmt(iso, { weekday: 'short', day: 'numeric', month: 'short' }),
      cents,
    });
    const days = Array.from(summary.byDay.entries());

    if (!tripStart || !tripEnd || tripEnd < tripStart) {
      return days.sort((a, b) => a[0].localeCompare(b[0])).map(([iso, c]) => dayBucket(iso, c));
    }
    const before = days.filter(([d]) => d < tripStart).reduce((s, [, c]) => s + c, 0);
    const after = days.filter(([d]) => d > tripEnd).reduce((s, [, c]) => s + c, 0);
    const result: DayBucket[] = [];
    if (before > 0)
      result.push({ key: '__before__', label: t('expenses.chart.before'), title: t('expenses.chart.beforeTitle'), cents: before, muted: true });
    for (let d = tripStart, i = 0; d <= tripEnd && i < 120; d = addDays(d, 1), i++) {
      result.push(dayBucket(d, summary.byDay.get(d) ?? 0));
    }
    if (after > 0)
      result.push({ key: '__after__', label: t('expenses.chart.after'), title: t('expenses.chart.afterTitle'), cents: after, muted: true });
    return result;
  }, [summary, tripStart, tripEnd, t, i18n.language]);

  const max = Math.max(1, ...buckets.map((b) => b.cents));
  const hoveredBucket = buckets.find((b) => b.key === hovered) ?? null;
  // Con tanti giorni le etichette si accavallano: se ne mostra una ogni `step`.
  const step = Math.ceil(buckets.length / 16);

  if (buckets.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="h-6 text-sm text-slate-600 dark:text-slate-300">
        {hoveredBucket ? (
          <span>
            <span className="font-semibold">{hoveredBucket.title}</span>
            <span className="mx-1.5 text-slate-400">·</span>
            <span className="font-bold tabular-nums">{formatMoney(hoveredBucket.cents)}</span>
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs">{t('expenses.chart.dailyHint')}</span>
        )}
      </div>
      <div className="relative h-[192px] flex items-end gap-[2px] border-b border-[var(--border-subtle)]">
        {/* Griglia: metà e massimo, recessiva */}
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-[var(--border-subtle)]" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--border-subtle)]" />
        <span className="pointer-events-none absolute right-0 -top-5 text-[11px] text-slate-400 tabular-nums">
          {formatMoney(max)}
        </span>
        {buckets.map((b) => (
          <button
            key={b.key}
            type="button"
            onMouseEnter={() => setHovered(b.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(b.key)}
            onBlur={() => setHovered(null)}
            aria-label={`${b.title}: ${formatMoney(b.cents)}`}
            className="relative flex-1 min-w-0 h-full flex items-end cursor-default outline-none"
          >
            <span
              className="w-full rounded-t-[4px] transition-[height,opacity] duration-300"
              style={{
                height: `${(b.cents / max) * 100}%`,
                minHeight: b.cents > 0 ? 2 : 0,
                backgroundColor: b.muted ? CATEGORY_OTHER_VAR : DAY_COLOR,
                opacity: hovered && hovered !== b.key ? 0.45 : 1,
              }}
            />
          </button>
        ))}
      </div>
      <div className="flex gap-[2px]">
        {buckets.map((b, i) => (
          <span
            key={b.key}
            className="flex-1 min-w-0 text-center text-[10px] text-slate-400 dark:text-slate-500 truncate"
          >
            {b.muted || i % step === 0 ? b.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Spese per valuta: totale nella valuta in cui si è pagato e controvalore nella
// valuta del viaggio (rimborsi esclusi, come in tutti i totali).
// ---------------------------------------------------------------------------

const CurrencyBreakdown: React.FC<Pick<ExpenseChartsProps, 'expenses' | 'baseCurrency' | 'summary' | 'formatMoney'>> = ({
  expenses,
  baseCurrency,
  summary,
  formatMoney,
}) => {
  const { t, i18n } = useTranslation();
  const rows = useMemo(() => {
    const map = new Map<string, { original: number; base: number; count: number }>();
    for (const e of expenses) {
      if (e.kind !== 'expense') continue;
      const r = map.get(e.currency) ?? { original: 0, base: 0, count: 0 };
      r.original += toCents(e.amount);
      r.base += baseCentsOf(e);
      r.count += 1;
      map.set(e.currency, r);
    }
    return [...map.entries()].sort((a, b) => b[1].base - a[1].base);
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rows.map(([code, r]) => {
        const percent = summary.total > 0 ? (r.base / summary.total) * 100 : 0;
        return (
          <div key={code} className="rounded-2xl bg-slate-900/5 dark:bg-white/5 px-[18px] py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold/15 text-gold ring-1 ring-gold/30">
                {code}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('expenses.chart.currencyCount', { count: r.count })} · {percent.toFixed(0)}%
              </span>
            </div>
            <p className="mt-2 font-poppins font-bold text-lg tabular-nums">
              {formatCurrency(r.original, code, i18n.language)}
            </p>
            {code !== baseCurrency && (
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">≈ {formatMoney(r.base)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ExpenseCharts: React.FC<ExpenseChartsProps> = (props) => {
  const { t } = useTranslation();
  if (props.summary.total === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-title">{t('expenses.chart.empty')}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="card-static">
        <h3 className="font-poppins font-semibold text-base mb-4">{t('expenses.chart.byCategory')}</h3>
        <CategoryDonut {...props} />
      </Card>
      <Card className="card-static">
        <h3 className="font-poppins font-semibold text-base mb-4">{t('expenses.chart.byPerson')}</h3>
        <PersonBars {...props} />
      </Card>
      <Card className="card-static xl:col-span-2">
        <h3 className="font-poppins font-semibold text-base mb-4">{t('expenses.chart.byCurrency')}</h3>
        <CurrencyBreakdown {...props} />
      </Card>
      <Card className="card-static xl:col-span-2">
        <h3 className="font-poppins font-semibold text-base mb-4">{t('expenses.chart.byDay')}</h3>
        <DailyBars {...props} />
      </Card>
    </div>
  );
};
