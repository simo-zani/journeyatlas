import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Coins, HandCoins, List, Loader2, Pencil, PieChart, Plus, Scale, Wallet } from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { CollapsibleLabel } from '@/components/CollapsibleLabel';
import { DeleteButton } from '@/components/trip/DeleteButton';
import { FilterSelect } from '@/components/trip/ActivitySection';
import { useIsStuck } from '@/lib/useIsStuck';
import { useSidebarExpanded } from '@/lib/useSidebarExpanded';
import {
  EXPENSE_CATEGORIES,
  createExpenseCategory,
  deleteExpense,
  fetchExpenseCategories,
  fetchExpenses,
  saveExpense,
  updateTripExpenseCurrency,
  type ExpenseInput,
} from '@/lib/api';
import { buildCategoryColorMap, CATEGORY_OTHER_VAR, getCategoryColor } from '@/lib/categoryColors';
import {
  baseCentsOf,
  baseSplitsOf,
  formatCurrency,
  participantName,
  suggestSettlements,
  summarizeExpenses,
  type Settlement,
} from '@/lib/expenses';
import type { ExpenseCategoryRow, ExpenseWithSplits, Trip, TripParticipantDetail } from '@/lib/types';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseCharts } from './ExpenseCharts';
import { ExpenseBalances } from './ExpenseBalances';
import { COMMON_CURRENCIES, expenseCategoryIcon } from './expenseCategories';
import { ParticipantAvatar } from './participants';
import { useTripCurrencies } from '@/lib/useTripCurrencies';

type ViewMode = 'list' | 'charts' | 'balances';

interface ExpenseSectionProps {
  trip: Trip;
  userId: string;
  participants: TripParticipantDetail[];
  /** Owner/editor: possono modificare anche le spese inserite da altri. */
  canEditTrip: boolean;
  isOwner: boolean;
  onTripChange: (trip: Trip) => void;
}

interface FormState {
  open: boolean;
  editing: ExpenseWithSplits | null;
}

const todayIso = () => {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  trip,
  userId,
  participants: allParticipants,
  canEditTrip,
  isOwner,
  onTripChange,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const baseCurrency = trip.expense_currency ?? 'EUR';

  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [categories, setCategories] = useState<ExpenseCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [filterPerson, setFilterPerson] = useState<'all' | string>('all');
  const [form, setForm] = useState<FormState>({ open: false, editing: null });
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [filterBarSentinelRef, filterBarStuck] = useIsStuck(56);
  const compact = useSidebarExpanded();

  // Viaggiatori = partecipanti accettati (compagni senza account inclusi);
  // gli inviti pending/rifiutati non partecipano alle spese.
  const participants = useMemo(
    () =>
      allParticipants
        .filter((p) => p.status === 'accepted')
        .sort((a, b) => Number(b.role === 'owner') - Number(a.role === 'owner')),
    [allParticipants]
  );
  const participantIds = useMemo(() => participants.map((p) => p.participant_id), [participants]);
  const byId = useMemo(() => new Map(allParticipants.map((p) => [p.participant_id, p])), [allParticipants]);
  const me = participants.find((p) => p.user_id === userId) ?? null;
  const tripCurrencies = useTripCurrencies(trip.id, trip.destinations, baseCurrency);

  // Valuta proposta per una nuova spesa: quella dell'ultima spesa che ho inserito
  // (in un viaggio negli USA, dopo la prima spesa in dollari restano i dollari).
  const lastCurrency = useMemo(
    () =>
      [...expenses]
        .filter((e) => e.created_by_user_id === userId && e.kind === 'expense')
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.currency ?? baseCurrency,
    [expenses, userId, baseCurrency]
  );
  const name = useCallback((id: string) => participantName(byId.get(id), userId, t), [byId, userId, t]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [exp, cats] = await Promise.all([fetchExpenses(trip.id), fetchExpenseCategories(trip.id)]);
      setExpenses(exp);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [trip.id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatMoney = useCallback((cents: number) => formatCurrency(cents, baseCurrency, lang), [baseCurrency, lang]);

  const categoryLabel = useCallback((c: string) => t(`expenses.category.${c}`, { defaultValue: c }), [t]);

  // Elenco completo e ordinato per chiave: unica fonte per i colori (come nel tab Attività).
  const allCategories = useMemo(() => {
    const names = new Set<string>([...(EXPENSE_CATEGORIES as readonly string[]), ...categories.map((c) => c.name)]);
    expenses.forEach((e) => e.category && names.add(e.category));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [expenses, categories]);
  const colorMap = useMemo(() => buildCategoryColorMap(allCategories), [allCategories]);
  const usedCategories = useMemo(
    () =>
      allCategories
        .filter((c) => expenses.some((e) => e.category === c))
        .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b))),
    [allCategories, expenses, categoryLabel]
  );

  const summary = useMemo(() => summarizeExpenses(expenses, participantIds), [expenses, participantIds]);
  const settlements = useMemo(
    () => suggestSettlements(new Map([...summary.byParticipant].map(([id, r]) => [id, r.balance]))),
    [summary]
  );
  const mine = me ? summary.byParticipant.get(me.participant_id) : undefined;

  const filtered = useMemo(
    () =>
      expenses.filter(
        (e) =>
          (filterCategory === 'all' || e.category === filterCategory) &&
          (filterPerson === 'all' ||
            e.payer_participant_id === filterPerson ||
            e.expense_splits.some((s) => s.participant_id === filterPerson))
      ),
    [expenses, filterCategory, filterPerson]
  );

  const groupedByDay = useMemo(() => {
    const map = new Map<string, ExpenseWithSplits[]>();
    filtered.forEach((e) => {
      const list = map.get(e.expense_date) ?? [];
      list.push(e);
      map.set(e.expense_date, list);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const canModify = (e: ExpenseWithSplits) => canEditTrip || e.created_by_user_id === userId;

  const handleSubmit = async (input: ExpenseInput, newCategoryIcon?: string) => {
    if (
      input.category &&
      !(EXPENSE_CATEGORIES as readonly string[]).includes(input.category) &&
      !categories.some((c) => c.name === input.category)
    ) {
      await createExpenseCategory(trip.id, input.category, newCategoryIcon ?? 'tag');
    }
    await saveExpense(trip.id, input, form.editing?.id);
    setForm({ open: false, editing: null });
    await load();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const handleSettle = async (s: Settlement) => {
    setError(null);
    try {
      await saveExpense(trip.id, {
        kind: 'transfer',
        title: t('expenses.settle.transferTitle'),
        amount: s.cents / 100,
        currency: baseCurrency,
        exchange_rate: 1,
        category: null,
        expense_date: todayIso(),
        payer_participant_id: s.from,
        split_mode: 'amounts',
        notes: null,
        splits: [{ participant_id: s.to, amount: s.cents / 100, shares: 1 }],
      });
      await load();
    } catch (err) {
      setError(
        err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : t('common.error')
      );
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    setError(null);
    try {
      await updateTripExpenseCurrency(trip.id, currency);
      onTripChange({ ...trip, expense_currency: currency });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const formatDay = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /** Riga secondaria di una spesa: chi ha pagato e per chi. */
  const describeSplit = (e: ExpenseWithSplits) => {
    if (e.kind === 'transfer') {
      const to = e.expense_splits[0]?.participant_id;
      return t('expenses.list.transfer', { from: name(e.payer_participant_id), to: to ? name(to) : '?' });
    }
    const paid = t('expenses.list.paidBy', { name: name(e.payer_participant_id) });
    const ids = e.expense_splits.filter((s) => s.amount > 0).map((s) => s.participant_id);
    const forWhom =
      ids.length === participants.length && participants.every((p) => ids.includes(p.participant_id))
        ? t('expenses.list.forEveryone')
        : ids.length === 1
          ? t('expenses.list.forOne', { name: name(ids[0]) })
          : t('expenses.list.forMany', { count: ids.length });
    return `${paid} · ${forWhom}`;
  };

  const tiles = [
    {
      key: 'total',
      icon: Wallet,
      label: t('expenses.tiles.total'),
      value: formatMoney(summary.total),
      hint:
        participants.length > 0
          ? t('expenses.tiles.average', { amount: formatMoney(Math.round(summary.total / participants.length)) })
          : undefined,
    },
    ...(mine
      ? [
          {
            key: 'share',
            icon: Coins,
            label: t('expenses.tiles.myShare'),
            value: formatMoney(mine.share),
            hint: t('expenses.tiles.myShareHint'),
          },
          {
            key: 'paid',
            icon: HandCoins,
            label: t('expenses.tiles.myPaid'),
            value: formatMoney(mine.paid),
            hint: t('expenses.tiles.myPaidHint'),
          },
          {
            key: 'balance',
            icon: Scale,
            label: t('expenses.tiles.myBalance'),
            value: `${mine.balance > 0 ? '+' : ''}${formatMoney(mine.balance)}`,
            tone: mine.balance > 0 ? 'text-success' : mine.balance < 0 ? 'text-error' : undefined,
            hint:
              mine.balance > 0
                ? t('expenses.tiles.owedToYou')
                : mine.balance < 0
                  ? t('expenses.tiles.youOwe')
                  : t('expenses.tiles.settled'),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Barra filtri: stessa posizione, altezza e comportamento sticky degli altri tab */}
      <div ref={filterBarSentinelRef} className="h-0 !mt-0" aria-hidden="true" />
      <div
        className={`!mt-0 sticky top-14 z-20 py-1.5 before:content-[''] before:absolute before:-z-10 before:inset-x-[-50vw] before:top-[-120px] before:bottom-[-12px] before:backdrop-blur-md before:bg-[var(--surface-0)]/60 before:pointer-events-none before:[mask-image:linear-gradient(to_bottom,black_80%,transparent)] before:transition-opacity before:duration-500 before:ease-out ${filterBarStuck ? 'before:opacity-100' : 'before:opacity-0'} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-2 flex-wrap py-1 min-h-[46px]">
          {viewMode === 'list' && (
            <>
              <FilterSelect
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label={t('expenses.filterAllCategory')}
              >
                <option value="all">{t('expenses.filterAllCategory')}</option>
                {usedCategories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
                aria-label={t('expenses.filterAllPeople')}
              >
                <option value="all">{t('expenses.filterAllPeople')}</option>
                {participants.map((p) => (
                  <option key={p.participant_id} value={p.participant_id}>
                    {name(p.participant_id)}
                  </option>
                ))}
              </FilterSelect>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <div className="flex items-center gap-1 bg-slate-900/80 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 dark:border-white/10 p-1 rounded-full shrink-0 shadow-md">
            {(
              [
                ['list', List, t('expenses.view.listShort'), t('expenses.view.list')],
                ['charts', PieChart, t('expenses.view.chartsShort'), t('expenses.view.charts')],
                ['balances', Scale, t('expenses.view.balancesShort'), t('expenses.view.balances')],
              ] as const
            ).map(([mode, Icon, label, title]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                aria-label={title}
                title={compact ? title : undefined}
                className={`relative flex items-center justify-center py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-[color,background-color,padding] duration-300 cursor-pointer ${
                  compact ? 'px-3.5' : 'px-5'
                } ${viewMode === mode ? 'text-slate-950' : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'}`}
              >
                {viewMode === mode && (
                  <motion.span
                    layoutId="expense-view-active"
                    className="absolute inset-0 rounded-full bg-gold shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="w-5 h-5 shrink-0 relative" />
                <span className="relative flex">
                  <CollapsibleLabel compact={compact}>{label}</CollapsibleLabel>
                </span>
              </button>
            ))}
          </div>
          {me && (
            <Button className="!h-[38px] !min-h-0 !py-0 !px-5 !text-xs" onClick={() => setForm({ open: true, editing: null })}>
              <Plus className="w-5 h-5" />
              {t('expenses.add')}
            </Button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading || participants.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
        </div>
      ) : (
        <>
          {/* Riepilogo: totale del viaggio e la posizione di chi guarda */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiles.map(({ key, icon: Icon, label, value, hint, ...rest }) => (
              <Card key={key} compact className="card-static">
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</p>
                    <p
                      className={`font-poppins font-bold text-lg sm:text-xl tabular-nums truncate ${
                        'tone' in rest && rest.tone ? rest.tone : ''
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                </div>
                {key === 'total' && isOwner ? (
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">{hint}</span>
                    <select
                      className="input-field input-field-inline !py-0.5 !px-2 !text-xs !rounded-lg"
                      value={baseCurrency}
                      disabled={expenses.length > 0}
                      title={expenses.length > 0 ? t('expenses.currencyLocked') : t('expenses.currencyLabel')}
                      aria-label={t('expenses.currencyLabel')}
                      onChange={(e) => void handleCurrencyChange(e.target.value)}
                    >
                      {Array.from(new Set([baseCurrency, ...tripCurrencies.map((c) => c.code), ...COMMON_CURRENCIES])).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  hint && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">{hint}</p>
                )}
              </Card>
            ))}
          </div>

          {viewMode === 'charts' ? (
            <ExpenseCharts
              expenses={expenses}
              baseCurrency={baseCurrency}
              summary={summary}
              participants={participants}
              currentUserId={userId}
              colorMap={colorMap}
              categoryLabel={categoryLabel}
              formatMoney={formatMoney}
              tripStart={trip.start_date}
              tripEnd={trip.end_date}
            />
          ) : viewMode === 'balances' ? (
            <ExpenseBalances
              summary={summary}
              settlements={settlements}
              participants={participants}
              currentUserId={userId}
              formatMoney={formatMoney}
              onSettle={me ? handleSettle : null}
            />
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💸</div>
              <p className="empty-state-title">{t('expenses.empty')}</p>
              <p className="empty-state-message">{t('expenses.emptySub')}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-title">{t('expenses.noMatches')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedByDay.map(([day, list]) => {
                const dayTotal = list.filter((e) => e.kind === 'expense').reduce((s, e) => s + baseCentsOf(e), 0);
                return (
                  <Card key={day} noPadding className="card-static">
                    <div
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <h3 className="font-poppins font-semibold text-base capitalize truncate">{formatDay(day)}</h3>
                      {dayTotal > 0 && (
                        <span className="text-sm font-bold tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                          {formatMoney(dayTotal)}
                        </span>
                      )}
                    </div>
                    <ul className="p-2 space-y-1">
                      {list.map((e) => {
                        const isTransfer = e.kind === 'transfer';
                        const color = isTransfer
                          ? CATEGORY_OTHER_VAR
                          : e.category
                            ? getCategoryColor(e.category, colorMap)
                            : CATEGORY_OTHER_VAR;
                        const Icon = isTransfer ? ArrowRightLeft : expenseCategoryIcon(e.category, categories);
                        const baseCents = baseCentsOf(e);
                        const myCents = me ? baseSplitsOf(e).get(me.participant_id) ?? 0 : 0;
                        const iPaid = me?.participant_id === e.payer_participant_id;
                        // Effetto della spesa sul mio saldo: quanto ho anticipato per gli altri o quanto devo.
                        const myImpact = me ? (iPaid ? baseCents : 0) - myCents : 0;
                        return (
                          <li
                            key={e.id}
                            className="group flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <div
                              className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
                            >
                              <Icon className="w-5 h-5" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-medium text-sm sm:text-base truncate ${isTransfer ? 'italic' : ''}`}>
                                  {e.title}
                                </span>
                                {e.category && !isTransfer && (
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                                    style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
                                  >
                                    {categoryLabel(e.category)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                <ParticipantAvatar participant={byId.get(e.payer_participant_id)} size="sm" />
                                <span className="truncate">{describeSplit(e)}</span>
                              </p>
                              {e.notes && <p className="text-xs text-slate-400 mt-0.5 truncate">{e.notes}</p>}
                            </div>
                            <div className="text-right shrink-0">
                              {/* Importo nella valuta in cui è stato pagato; sotto, convertito nella valuta del viaggio */}
                              <p className="text-sm sm:text-base font-bold tabular-nums">
                                {formatCurrency(Math.round(e.amount * 100), e.currency, lang)}
                              </p>
                              {e.currency !== baseCurrency && (
                                <p
                                  className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums"
                                  title={t('expenses.list.rate', {
                                    from: e.currency,
                                    rate: e.exchange_rate.toLocaleString(lang, { maximumFractionDigits: 6 }),
                                    to: baseCurrency,
                                  })}
                                >
                                  ≈ {formatMoney(baseCents)}
                                </p>
                              )}
                              {me && !isTransfer && myImpact !== 0 && (
                                <p className={`text-[11px] font-semibold tabular-nums ${myImpact > 0 ? 'text-success' : 'text-error'}`}>
                                  {myImpact > 0
                                    ? t('expenses.list.youLent', { amount: formatMoney(myImpact) })
                                    : t('expenses.list.youBorrowed', { amount: formatMoney(-myImpact) })}
                                </p>
                              )}
                            </div>
                            {canModify(e) && (
                              <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                {confirmingDeleteId !== e.id && (
                                  <button
                                    type="button"
                                    onClick={() => setForm({ open: true, editing: e })}
                                    className="p-2 rounded-xl text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                                    aria-label={t('common.edit')}
                                    title={t('common.edit')}
                                  >
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                )}
                                <DeleteButton
                                  onConfirmingChange={(on) => setConfirmingDeleteId(on ? e.id : null)}
                                  onDelete={() => handleDelete(e.id)}
                                />
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {me && (
        <Modal
          open={form.open}
          onClose={() => setForm({ open: false, editing: null })}
          title={form.editing ? t('expenses.edit') : t('expenses.add')}
        >
          <ExpenseForm
            // Rimonta il form a ogni apertura: lo stato iniziale dipende dalla spesa scelta.
            key={form.editing?.id ?? 'new'}
            initial={form.editing}
            participants={participants}
            currentUserId={userId}
            myParticipantId={me.participant_id}
            baseCurrency={baseCurrency}
            defaultCurrency={lastCurrency}
            suggestedCurrencies={tripCurrencies}
            customCategories={categories}
            onSubmit={handleSubmit}
            onCancel={() => setForm({ open: false, editing: null })}
          />
        </Modal>
      )}
    </div>
  );
};
