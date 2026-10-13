import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Check, Loader2, Receipt } from 'lucide-react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { EXPENSE_CATEGORIES, type ExpenseInput } from '@/lib/api';
import { fetchExchangeRates } from '@/lib/countryInfo';
import { distributeCents, formatCurrency, parseAmount, participantName, toCents } from '@/lib/expenses';
import type { TripCurrency } from '@/lib/useTripCurrencies';
import type { ExpenseCategoryRow, ExpenseKind, ExpenseSplitMode, ExpenseWithSplits, TripParticipantDetail } from '@/lib/types';
import {
  COMMON_CURRENCIES,
  EXPENSE_ICON_CHOICES,
  EXPENSE_ICON_MAP,
  expenseCategoryIcon,
} from './expenseCategories';
import { ParticipantAvatar } from './participants';

const NEW_CATEGORY = '__new__';
const SPLIT_MODES: ExpenseSplitMode[] = ['equal', 'amounts', 'shares'];

const todayIso = () => {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Numero → testo per un campo importo, senza zeri inutili ("12.5", non "12.50000"). */
const numberToField = (n: number) => String(Number(n.toFixed(8)));

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
  layoutId: string;
}

/** Controllo segmentato a pillola, come i selettori di vista dei tab ma nei colori del modale. */
function Segmented<T extends string>({ value, options, onChange, layoutId }: SegmentedProps<T>) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-slate-900/5 dark:bg-white/5 border border-[var(--border-subtle)] w-fit">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={selected}
            className={`relative flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
              selected ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-gold shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            {o.icon && <span className="relative">{o.icon}</span>}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface ExpenseFormProps {
  initial: ExpenseWithSplits | null;
  participants: TripParticipantDetail[];
  currentUserId: string;
  /** Partecipante dell'utente corrente: pagatore predefinito. */
  myParticipantId: string | null;
  baseCurrency: string;
  /** Valuta proposta per una spesa nuova (es. quella dell'ultima inserita). */
  defaultCurrency?: string;
  /** Valute tipiche del viaggio, proposte per prime (vedi useTripCurrencies). */
  suggestedCurrencies: TripCurrency[];
  customCategories: ExpenseCategoryRow[];
  onSubmit: (input: ExpenseInput, newCategoryIcon?: string) => Promise<void>;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initial,
  participants,
  currentUserId,
  myParticipantId,
  baseCurrency,
  defaultCurrency,
  suggestedCurrencies,
  customCategories,
  onSubmit,
  onCancel,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const isCustomInitial =
    !!initial?.category && !(EXPENSE_CATEGORIES as readonly string[]).includes(initial.category);
  const initialCustomExists = customCategories.some((c) => c.name === initial?.category);
  const initialSplits = new Map(initial?.expense_splits.map((s) => [s.participant_id, s]) ?? []);

  const [kind, setKind] = useState<ExpenseKind>(initial?.kind ?? 'expense');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [amountStr, setAmountStr] = useState(initial ? numberToField(initial.amount) : '');
  const [currency, setCurrency] = useState(initial?.currency ?? defaultCurrency ?? baseCurrency);
  const [rateStr, setRateStr] = useState(initial ? numberToField(initial.exchange_rate) : '1');
  const [rateState, setRateState] = useState<'idle' | 'loading' | 'failed'>('idle');
  const [date, setDate] = useState(initial?.expense_date ?? todayIso());
  const [category, setCategory] = useState<string>(
    isCustomInitial && !initialCustomExists ? NEW_CATEGORY : (initial?.category ?? '')
  );
  const [customCategoryName, setCustomCategoryName] = useState(
    isCustomInitial && !initialCustomExists ? initial?.category ?? '' : ''
  );
  const [customIcon, setCustomIcon] = useState('tag');
  const [payerId, setPayerId] = useState(
    initial?.payer_participant_id ?? myParticipantId ?? participants[0]?.participant_id ?? ''
  );
  const [splitMode, setSplitMode] = useState<ExpenseSplitMode>(initial?.split_mode ?? 'equal');
  // Di default una nuova spesa è per tutti; un rimborso va a qualcun altro.
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      participants.map((p) => [p.participant_id, initial ? initialSplits.has(p.participant_id) : true])
    )
  );
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      participants.map((p) => {
        const s = initialSplits.get(p.participant_id);
        return [p.participant_id, s && initial?.split_mode === 'amounts' ? numberToField(s.amount) : ''];
      })
    )
  );
  const [shares, setShares] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      participants.map((p) => {
        const s = initialSplits.get(p.participant_id);
        return [p.participant_id, s ? numberToField(s.shares) : '1'];
      })
    )
  );
  const [receiverId, setReceiverId] = useState(() => {
    if (initial?.kind === 'transfer') return initial.expense_splits[0]?.participant_id ?? '';
    return participants.find((p) => p.participant_id !== (initial?.payer_participant_id ?? myParticipantId))
      ?.participant_id ?? '';
  });
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Tasso di cambio: proposto automaticamente al cambio valuta, sempre modificabile.
  // Modificando una spesa esistente si tiene quello salvato finché la valuta non cambia.
  // Si confronta con l'ultima valuta gestita (non con un flag "primo render"),
  // così il doppio effetto di StrictMode non rilancia la richiesta; l'id della
  // richiesta scarta le risposte arrivate dopo un cambio di valuta successivo.
  const rateCurrency = useRef<string | null>(initial?.currency ?? null);
  const rateRequest = useRef(0);
  useEffect(() => {
    if (currency === rateCurrency.current) return;
    rateCurrency.current = currency;
    const request = ++rateRequest.current;
    if (currency === baseCurrency) {
      setRateStr('1');
      setRateState('idle');
      return;
    }
    setRateState('loading');
    fetchExchangeRates(currency)
      .then((rates) => {
        if (request !== rateRequest.current) return;
        const rate = rates[baseCurrency];
        if (rate) {
          setRateStr(numberToField(rate));
          setRateState('idle');
        } else {
          setRateState('failed');
        }
      })
      .catch(() => request === rateRequest.current && setRateState('failed'));
  }, [currency, baseCurrency]);

  const amount = parseAmount(amountStr);
  const totalCents = Number.isFinite(amount) && amount > 0 ? toCents(amount) : 0;
  const rate = currency === baseCurrency ? 1 : parseAmount(rateStr);
  const rateValid = Number.isFinite(rate) && rate > 0;

  // Prima le valute del viaggio (sua valuta, nazionalità, mete, scali), poi tutte le altre.
  const currencyGroups = useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([lang], { type: 'currency' });
    } catch {
      names = null;
    }
    const isIt = lang.startsWith('it');
    const suggested = suggestedCurrencies.map((c) => {
      const where = c.countries.map((k) => (isIt ? k.nameIt : k.nameEn)).join(', ');
      const why = c.sources
        .map((src) =>
          src === 'destination' || src === 'transit'
            ? t(`expenses.currencySource.${src}`, { countries: where })
            : t(`expenses.currencySource.${src}`)
        )
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join(' · ');
      return { code: c.code, label: `${c.code} — ${names?.of(c.code) ?? c.code} (${why})` };
    });
    const suggestedCodes = new Set(suggested.map((c) => c.code));
    const others = Array.from(new Set<string>([currency, ...COMMON_CURRENCIES]))
      .filter((code) => !suggestedCodes.has(code))
      .map((code) => ({ code, label: `${code} — ${names?.of(code) ?? code}` }))
      .sort((a, b) => a.code.localeCompare(b.code));
    return { suggested, others };
  }, [suggestedCurrencies, currency, lang, t]);

  const fmt = (cents: number, cur = currency) => formatCurrency(cents, cur, lang);

  // Quote in centesimi della valuta della spesa, per partecipante incluso.
  const split = useMemo(() => {
    const included = participants.filter((p) => selected[p.participant_id]);
    if (splitMode === 'amounts') {
      const cents = included.map((p) => {
        const v = parseAmount(amounts[p.participant_id] ?? '');
        return Number.isFinite(v) && v > 0 ? toCents(v) : 0;
      });
      return { ids: included.map((p) => p.participant_id), cents, weights: included.map(() => 1) };
    }
    const weights = included.map((p) => {
      if (splitMode === 'equal') return 1;
      const v = parseAmount(shares[p.participant_id] ?? '');
      return Number.isFinite(v) && v > 0 ? v : 0;
    });
    return {
      ids: included.map((p) => p.participant_id),
      cents: distributeCents(totalCents, weights),
      weights,
    };
  }, [participants, selected, splitMode, amounts, shares, totalCents]);

  const splitCentsById = new Map(split.ids.map((id, i) => [id, split.cents[i]]));
  const assignedCents = split.cents.reduce((s, c) => s + c, 0);
  const remainingCents = totalCents - assignedCents;

  const isTransfer = kind === 'transfer';
  const categoryValid = category !== NEW_CATEGORY || customCategoryName.trim().length > 0;
  const splitValid = isTransfer
    ? !!receiverId && receiverId !== payerId
    : split.ids.length > 0 && remainingCents === 0 && split.cents.some((c) => c > 0);
  const canSubmit =
    (isTransfer || title.trim().length > 0) && totalCents > 0 && rateValid && rateState !== 'loading' && !!payerId && !!date && categoryValid && splitValid;

  const allSelected = participants.every((p) => selected[p.participant_id]);
  const toggleAll = () =>
    setSelected(Object.fromEntries(participants.map((p) => [p.participant_id, !allSelected])));

  const SelectedCategoryIcon =
    category === NEW_CATEGORY ? EXPENSE_ICON_MAP[customIcon] : expenseCategoryIcon(category || null, customCategories);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    const resolvedCategory = isTransfer
      ? null
      : category === NEW_CATEGORY
        ? customCategoryName.trim() || null
        : category || null;
    try {
      await onSubmit(
        {
          kind,
          title: isTransfer ? title.trim() || t('expenses.transferDefaultTitle') : title.trim(),
          amount: totalCents / 100,
          currency,
          exchange_rate: rate,
          category: resolvedCategory,
          expense_date: date,
          payer_participant_id: payerId,
          split_mode: isTransfer ? 'amounts' : splitMode,
          notes: notes.trim() || null,
          splits: isTransfer
            ? [{ participant_id: receiverId, amount: totalCents / 100, shares: 1 }]
            : split.ids
                .map((id, i) => ({
                  participant_id: id,
                  amount: split.cents[i] / 100,
                  shares: splitMode === 'shares' ? split.weights[i] : 1,
                }))
                .filter((s) => s.amount > 0),
        },
        category === NEW_CATEGORY ? customIcon : undefined
      );
    } catch (err) {
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : t('common.error')
      );
      setSubmitting(false);
    }
  };

  const name = (id: string) => participantName(participants.find((p) => p.participant_id === id), currentUserId, t);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Segmented
        value={kind}
        onChange={setKind}
        layoutId="expense-kind-active"
        options={[
          { value: 'expense', label: t('expenses.kind.expense'), icon: <Receipt className="w-5 h-5" /> },
          { value: 'transfer', label: t('expenses.kind.transfer'), icon: <ArrowRightLeft className="w-5 h-5" /> },
        ]}
      />

      <Input
        label={isTransfer ? t('expenses.form.transferTitle') : `${t('expenses.form.title')} *`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isTransfer ? t('expenses.transferDefaultTitle') : t('expenses.form.titlePlaceholder')}
        required={!isTransfer}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={`${t('expenses.form.amount')} *`}
          inputMode="decimal"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="0,00"
          required
        />
        <div>
          <label className="label">{t('expenses.form.currency')}</label>
          <select className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <optgroup label={t('expenses.form.tripCurrencies')}>
              {currencyGroups.suggested.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label={t('expenses.form.otherCurrencies')}>
              {currencyGroups.others.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {currency !== baseCurrency && (
        <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-gold/30 bg-gold/[0.04] text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-300">1 {currency} =</span>
          <div className="w-32">
            <Input
              inputMode="decimal"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
              aria-label={t('expenses.form.exchangeRate')}
            />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{baseCurrency}</span>
          {rateState === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
          {totalCents > 0 && rateValid && (
            <span className="ml-auto text-slate-500 dark:text-slate-400">
              ≈ <span className="font-bold tabular-nums">{fmt(Math.round(totalCents * rate), baseCurrency)}</span>
            </span>
          )}
          {rateState === 'failed' && (
            <p className="w-full text-xs text-warning">{t('expenses.form.rateUnavailable')}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={`${t('expenses.form.date')} *`} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        {!isTransfer && (
          <div>
            <label className="label">{t('expenses.form.category')}</label>
            <div className="relative">
              {category && SelectedCategoryIcon && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold z-10">
                  <SelectedCategoryIcon className="w-5 h-5" />
                </span>
              )}
              <select
                className="input-field w-full"
                style={{ paddingLeft: category ? '2.5rem' : undefined }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">—</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`expenses.category.${c}`)}
                  </option>
                ))}
                {customCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value={NEW_CATEGORY}>{t('expenses.form.newCategory')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {!isTransfer && category === NEW_CATEGORY && (
        <div className="space-y-3 p-3.5 rounded-xl border border-gold/30 bg-gold/[0.04]">
          <Input
            label={t('expenses.form.newCategory')}
            value={customCategoryName}
            onChange={(e) => setCustomCategoryName(e.target.value)}
            placeholder={t('expenses.form.newCategoryPlaceholder')}
            autoFocus
          />
          <div>
            <label className="label mb-2 block">{t('expenses.form.icon')}</label>
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 max-h-44 overflow-y-auto">
              {EXPENSE_ICON_CHOICES.map((key) => {
                const Icon = EXPENSE_ICON_MAP[key];
                const isSelected = customIcon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCustomIcon(key)}
                    aria-pressed={isSelected}
                    aria-label={key}
                    title={key}
                    className={`h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-gold bg-gold/20 text-gold ring-2 ring-gold/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:border-gold hover:text-gold hover:bg-gold/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{isTransfer ? t('expenses.form.from') : t('expenses.form.paidBy')}</label>
          <select className="input-field" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
            {participants.map((p) => (
              <option key={p.participant_id} value={p.participant_id}>
                {name(p.participant_id)}
              </option>
            ))}
          </select>
        </div>
        {isTransfer && (
          <div>
            <label className="label">{t('expenses.form.to')}</label>
            <select className="input-field" value={receiverId} onChange={(e) => setReceiverId(e.target.value)}>
              <option value="">—</option>
              {participants
                .filter((p) => p.participant_id !== payerId)
                .map((p) => (
                  <option key={p.participant_id} value={p.participant_id}>
                    {name(p.participant_id)}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {!isTransfer && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            <span className="label !m-0">{t('expenses.form.forWhom')}</span>
            <Segmented
              value={splitMode}
              onChange={setSplitMode}
              layoutId="expense-split-active"
              options={SPLIT_MODES.map((m) => ({ value: m, label: t(`expenses.splitMode.${m}`) }))}
            />
          </div>

          <ul className="space-y-1.5">
            <li>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs font-semibold text-light-blue hover:underline cursor-pointer px-1"
              >
                {allSelected ? t('expenses.form.selectNone') : t('expenses.form.selectAll')}
              </button>
            </li>
            {participants.map((p) => {
              const id = p.participant_id;
              const isIn = !!selected[id];
              const cents = splitCentsById.get(id) ?? 0;
              return (
                <li
                  key={id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    isIn ? 'bg-slate-900/5 dark:bg-white/5' : 'opacity-60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelected((prev) => ({ ...prev, [id]: !prev[id] }))}
                    aria-pressed={isIn}
                    aria-label={name(id)}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isIn
                        ? 'bg-gold border-gold text-slate-950'
                        : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-gold'
                    }`}
                  >
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </button>
                  <ParticipantAvatar participant={p} />
                  <span className="flex-1 min-w-0 truncate text-sm font-medium">{name(id)}</span>

                  {splitMode === 'amounts' ? (
                    <div className="w-28 shrink-0">
                      <Input
                        inputMode="decimal"
                        value={amounts[id] ?? ''}
                        disabled={!isIn}
                        onChange={(e) => setAmounts((prev) => ({ ...prev, [id]: e.target.value }))}
                        placeholder="0,00"
                        aria-label={t('expenses.form.amountFor', { name: name(id) })}
                        className="!py-1.5 text-right"
                      />
                    </div>
                  ) : (
                    <>
                      {splitMode === 'shares' && (
                        <div className="w-16 shrink-0">
                          <Input
                            inputMode="decimal"
                            value={shares[id] ?? ''}
                            disabled={!isIn}
                            onChange={(e) => setShares((prev) => ({ ...prev, [id]: e.target.value }))}
                            aria-label={t('expenses.form.sharesFor', { name: name(id) })}
                            className="!py-1.5 text-center"
                          />
                        </div>
                      )}
                      <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                        {isIn ? fmt(cents) : '—'}
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {totalCents > 0 && splitMode === 'amounts' && remainingCents !== 0 && (
            <p className="text-sm text-error" role="alert">
              {remainingCents > 0
                ? t('expenses.form.remaining', { amount: fmt(remainingCents) })
                : t('expenses.form.exceeding', { amount: fmt(-remainingCents) })}
            </p>
          )}
          {split.ids.length === 0 && <p className="text-sm text-error">{t('expenses.form.nobodySelected')}</p>}
        </div>
      )}

      <Input label={t('expenses.form.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="tertiary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};
