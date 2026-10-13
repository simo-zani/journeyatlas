// Date dei viaggi con precisione al giorno o al mese (viaggi-ricordo).
// Con 'month' start_date è il primo giorno del mese di partenza ed end_date
// l'ultimo del mese di ritorno: i confronti di date esistenti restano validi,
// cambia solo come le si mostra.

import type { Trip } from '@/lib/types';

/** '2019-08' → '2019-08-01' */
export const monthStart = (month: string): string => `${month}-01`;

/** '2019-02' → '2019-02-28' (ultimo giorno del mese) */
export const monthEnd = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${month}-${String(last).padStart(2, '0')}`;
};

const monthLabel = (iso: string, locale: string, withYear: boolean) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(locale, withYear ? { month: 'short', year: 'numeric' } : { month: 'short' });

/**
 * Intervallo di un viaggio a precisione mensile: "ago 2019", "ago – set 2019",
 * "dic 2019 – gen 2020". Null se il viaggio non è a precisione mensile o non ha date
 * (il chiamante usa allora la sua formattazione al giorno).
 */
export const formatMonthRange = (
  trip: Pick<Trip, 'start_date' | 'end_date' | 'date_precision'>,
  locale: string
): string | null => {
  if (trip.date_precision !== 'month' || !trip.start_date) return null;
  const start = trip.start_date;
  const end = trip.end_date ?? start;
  if (start.slice(0, 7) === end.slice(0, 7)) return monthLabel(start, locale, true);
  if (start.slice(0, 4) === end.slice(0, 4)) return `${monthLabel(start, locale, false)} – ${monthLabel(end, locale, true)}`;
  return `${monthLabel(start, locale, true)} – ${monthLabel(end, locale, true)}`;
};
