// ===========================================================================
// Calcoli delle spese condivise (stile Tricount)
// ---------------------------------------------------------------------------
// Tutto lavora in CENTESIMI interi: con i float, 3 × 33,33 non fa 100 e i
// saldi non tornano mai a zero. Le conversioni nella valuta del viaggio
// avvengono una volta per spesa e la parte convertita viene poi ripartita con
// il metodo dei resti maggiori, così la somma delle quote convertite è sempre
// uguale al totale convertito.
// ===========================================================================

import type { TFunction } from 'i18next';
import type { ExpenseWithSplits, TripParticipantDetail } from '@/lib/types';

export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (cents: number): number => cents / 100;

/** Divide `totalCents` in proporzione ai pesi (resti maggiori): la somma del
 * risultato è sempre esattamente `totalCents`. Pesi tutti nulli → tutto zero. */
export const distributeCents = (totalCents: number, weights: number[]): number[] => {
  const weightSum = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (weightSum <= 0 || weights.length === 0) return weights.map(() => 0);
  const raw = weights.map((w) => (Math.max(0, w) / weightSum) * totalCents);
  const floored = raw.map(Math.floor);
  let remainder = totalCents - floored.reduce((s, v) => s + v, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; remainder > 0 && k < order.length; k++, remainder--) {
    floored[order[k].i] += 1;
  }
  return floored;
};

/** Importo di una spesa nella valuta del viaggio, in centesimi. */
export const baseCentsOf = (e: Pick<ExpenseWithSplits, 'amount' | 'exchange_rate'>): number =>
  Math.round(e.amount * 100 * e.exchange_rate);

/** Quote di ciascun partecipante nella valuta del viaggio, in centesimi. */
export const baseSplitsOf = (e: ExpenseWithSplits): Map<string, number> => {
  const splits = e.expense_splits;
  const cents = distributeCents(
    baseCentsOf(e),
    splits.map((s) => toCents(s.amount))
  );
  return new Map(splits.map((s, i) => [s.participant_id, cents[i]]));
};

export interface ParticipantSummary {
  /** Pagato di tasca propria per spese del viaggio (rimborsi esclusi). */
  paid: number;
  /** Costo del viaggio a suo carico: la somma delle sue quote (rimborsi esclusi). */
  share: number;
  /** Rimborsi dati (+) e ricevuti (−). */
  transfersNet: number;
  /** Saldo: > 0 deve ricevere, < 0 deve dare. */
  balance: number;
}

export interface ExpenseSummary {
  /** Costo totale del viaggio (rimborsi esclusi). */
  total: number;
  byParticipant: Map<string, ParticipantSummary>;
  byCategory: Map<string, number>;
  byDay: Map<string, number>;
}

const emptySummary = (): ParticipantSummary => ({ paid: 0, share: 0, transfersNet: 0, balance: 0 });

/** Riepilogo di tutte le spese, in centesimi della valuta del viaggio.
 * `participantIds` garantisce una riga anche a chi non ha ancora speso nulla. */
export const summarizeExpenses = (
  expenses: ExpenseWithSplits[],
  participantIds: string[]
): ExpenseSummary => {
  const byParticipant = new Map<string, ParticipantSummary>();
  const row = (id: string) => {
    let r = byParticipant.get(id);
    if (!r) {
      r = emptySummary();
      byParticipant.set(id, r);
    }
    return r;
  };
  participantIds.forEach(row);

  const byCategory = new Map<string, number>();
  const byDay = new Map<string, number>();
  let total = 0;

  for (const e of expenses) {
    const cents = baseCentsOf(e);
    const shares = baseSplitsOf(e);
    if (e.kind === 'transfer') {
      row(e.payer_participant_id).transfersNet += cents;
      shares.forEach((c, pid) => (row(pid).transfersNet -= c));
      continue;
    }
    total += cents;
    row(e.payer_participant_id).paid += cents;
    shares.forEach((c, pid) => (row(pid).share += c));
    const cat = e.category ?? '';
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + cents);
    byDay.set(e.expense_date, (byDay.get(e.expense_date) ?? 0) + cents);
  }

  byParticipant.forEach((r) => {
    r.balance = r.paid - r.share + r.transfersNet;
  });

  return { total, byParticipant, byCategory, byDay };
};

export interface Settlement {
  from: string;
  to: string;
  cents: number;
}

/** Rimborsi suggeriti per azzerare i saldi: ad ogni passo chi deve di più paga
 * chi deve ricevere di più. Al massimo n−1 trasferimenti, e in pratica quasi
 * sempre il minimo possibile. */
export const suggestSettlements = (balances: Map<string, number>): Settlement[] => {
  const creditors = [...balances].filter(([, b]) => b > 0).map(([id, b]) => ({ id, left: b }));
  const debtors = [...balances].filter(([, b]) => b < 0).map(([id, b]) => ({ id, left: -b }));
  const result: Settlement[] = [];
  for (;;) {
    creditors.sort((a, b) => b.left - a.left);
    debtors.sort((a, b) => b.left - a.left);
    const c = creditors[0];
    const d = debtors[0];
    if (!c || !d || c.left <= 0 || d.left <= 0) break;
    const cents = Math.min(c.left, d.left);
    result.push({ from: d.id, to: c.id, cents });
    c.left -= cents;
    d.left -= cents;
    if (c.left === 0) creditors.shift();
    if (d.left === 0) debtors.shift();
  }
  return result;
};

/** Importo in centesimi formattato nella valuta indicata (fallback se il codice non è ISO valido). */
export const formatCurrency = (cents: number, currency: string, locale?: string): string => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
};

/** "12,50" o "12.50" → 12.5; NaN se non è un numero. */
export const parseAmount = (value: string): number => {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
  return normalized === '' ? NaN : Number(normalized);
};

/** Nome con cui un viaggiatore compare nelle spese: username per chi ha un
 * account, il nome scelto dal proprietario per i compagni senza account. */
export const participantName = (
  p: TripParticipantDetail | undefined,
  currentUserId: string,
  t: TFunction
): string => {
  if (!p) return t('expenses.unknownParticipant');
  const name = p.user_id ? p.username ?? '?' : p.display_name ?? '?';
  return p.user_id === currentUserId ? `${name} (${t('share.you')})` : name;
};
