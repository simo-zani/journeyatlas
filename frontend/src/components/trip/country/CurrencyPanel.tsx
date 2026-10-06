import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Check, ChevronDown, Clock, Search } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { CountryFlag } from '@/components/CountryFlag';
import { loadCurrencyFlags, ratesUpdatedAt, type CountryInfo } from '@/lib/countryInfo';

/** Valute più comuni: bandiera (paese o Unione Europea) per quando non arriva da una meta del viaggio. */
const COMMON_FLAGS: Record<string, string> = {
  EUR: 'EU', USD: 'US', GBP: 'GB', CHF: 'CH', JPY: 'JP', CAD: 'CA', AUD: 'AU', NZD: 'NZ', CNY: 'CN', INR: 'IN',
  BRL: 'BR', MXN: 'MX', SEK: 'SE', NOK: 'NO', DKK: 'DK', PLN: 'PL', CZK: 'CZ', HUF: 'HU', TRY: 'TR', AED: 'AE',
  THB: 'TH', SGD: 'SG', HKD: 'HK', KRW: 'KR', ZAR: 'ZA', ISK: 'IS', RON: 'RO', BGN: 'BG', ILS: 'IL', EGP: 'EG',
  MAD: 'MA', ARS: 'AR', CLP: 'CL', COP: 'CO', PEN: 'PE', IDR: 'ID', MYR: 'MY', PHP: 'PH', VND: 'VN', TWD: 'TW',
  SAR: 'SA', QAR: 'QA', KES: 'KE', TZS: 'TZ', UAH: 'UA', RUB: 'RU', HRK: 'HR', RSD: 'RS',
};
const QUICK_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY'];
const QUICK_AMOUNTS = ['10', '50', '100', '500'];
/** Simbolo breve di una valuta ("€", "$", "¥"); se il browser non lo conosce resta il codice. */
const symbolOf = (code: string, locale: string): string => {
  try {
    const part = new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0)
      .find((p) => p.type === 'currency');
    return part?.value ?? code;
  } catch {
    return code;
  }
};

const EU_FLAG = 'https://flagcdn.com/w320/eu.png';

interface Opt {
  code: string;
  name: string;
  flag: string | null;
}

const Flag: React.FC<{ flag: string | null; code: string }> = ({ flag, code }) =>
  flag ? (
    <CountryFlag code={flag} size="md" src={flag === 'EU' ? EU_FLAG : undefined} />
  ) : (
    <span className="w-7 h-5 rounded-full shrink-0 bg-slate-700/60 text-[9px] font-bold flex items-center justify-center text-slate-300">
      {code}
    </span>
  );

/** Selettore di valuta con bandiera e ricerca (il <select> nativo non può mostrare immagini). */
const CurrencySelect: React.FC<{
  value: string;
  options: Opt[];
  tripCodes: Set<string>;
  onChange: (code: string) => void;
}> = ({ value, options, tripCodes, onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  const current = options.find((o) => o.code === value);
  const q = query.trim().toLowerCase();
  const shown = q
    ? options.filter((o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))
    : options;
  const tripOpts = q ? [] : shown.filter((o) => tripCodes.has(o.code));
  const rest = q ? shown : shown.filter((o) => !tripCodes.has(o.code));

  const row = (o: Opt) => (
    <button
      key={o.code}
      type="button"
      onClick={() => {
        onChange(o.code);
        setOpen(false);
        setQuery('');
      }}
      className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-left text-sm hover:bg-gold/10 cursor-pointer ${
        o.code === value ? 'bg-gold/10' : ''
      }`}
    >
      <Flag flag={o.flag} code={o.code} />
      <span className="font-bold w-10 shrink-0">{o.code}</span>
      <span className="flex-1 truncate text-slate-500 dark:text-slate-400">{o.name}</span>
      {o.code === value && <Check className="w-5 h-5 text-gold shrink-0" />}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-3 h-11 px-3.5 rounded-full bg-slate-900/80 border border-slate-700/60 hover:border-gold/50 transition-colors cursor-pointer"
      >
        <Flag flag={current?.flag ?? null} code={value} />
        <span className="font-bold">{value}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 left-0 w-[320px] max-w-[80vw] rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2">
          <div className="flex items-center gap-2 px-3 py-2 mb-1 rounded-xl bg-white/5">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('countryInfo.currencyPanel.search')}
              className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <div className="max-h-72 overflow-y-auto space-y-0.5">
            {tripOpts.length > 0 && (
              <>
                <p className="px-3.5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
                  {t('countryInfo.currencyPanel.tripCurrencies')}
                </p>
                {tripOpts.map(row)}
                <p className="px-3.5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {t('countryInfo.currencyPanel.otherCurrencies')}
                </p>
              </>
            )}
            {rest.map(row)}
            {shown.length === 0 && (
              <p className="px-3.5 py-3 text-sm text-slate-500">{t('countryInfo.currencyPanel.noResults')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface CurrencyPanelProps {
  countries: CountryInfo[];
  rates: Record<string, number> | null;
}

export const CurrencyPanel: React.FC<CurrencyPanelProps> = ({ countries, rates }) => {
  const { t, i18n } = useTranslation();
  const [fromCode, setFromCode] = useState('EUR');
  const [toCode, setToCode] = useState('');
  // Si scrive in uno dei due campi: l'altro si calcola. `typed` resta legato alla valuta in cui è stato scritto.
  const [typed, setTyped] = useState('100');
  const [side, setSide] = useState<'from' | 'to'>('from');
  // bandiera di ogni valuta, ricavata dai dati dei paesi
  const [currencyFlags, setCurrencyFlags] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    void loadCurrencyFlags()
      .then((m) => {
        if (!cancelled) setCurrencyFlags(m);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Valute delle mete (con la bandiera del loro paese)
  const trip = useMemo(() => {
    const seen = new Set<string>();
    const out: { code: string; name: string; symbol: string; flag: string }[] = [];
    for (const c of countries) {
      for (const cur of c.currencies) {
        if (seen.has(cur.code)) continue;
        seen.add(cur.code);
        out.push({ ...cur, flag: COMMON_FLAGS[cur.code] === 'EU' ? 'EU' : c.code });
      }
    }
    return out;
  }, [countries]);

  const options = useMemo<Opt[]>(() => {
    if (!rates) return [];
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([i18n.language], { type: 'currency' });
    } catch {
      names = null;
    }
    const tripFlag = new Map(trip.map((c) => [c.code, c.flag]));
    const tripName = new Map(trip.map((c) => [c.code, c.name]));
    const nameOf = (code: string) => {
      try {
        const n = names?.of(code);
        if (n && n !== code) return n.charAt(0).toUpperCase() + n.slice(1);
      } catch {
        // codice non riconosciuto
      }
      return tripName.get(code) ?? code;
    };
    const tripCodes = trip.map((c) => c.code).filter((c) => rates[c]);
    const rank = (c: string) => {
      const i = tripCodes.indexOf(c);
      if (i >= 0) return i;
      const q = QUICK_CURRENCIES.indexOf(c);
      return q >= 0 ? 1000 + q : 5000;
    };
    return Object.keys(rates)
      .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
      .map((code) => ({ code, name: nameOf(code), flag: tripFlag.get(code) ?? COMMON_FLAGS[code] ?? currencyFlags[code] ?? null }));
  }, [rates, trip, i18n.language, currencyFlags]);

  const tripCodes = useMemo(() => new Set(trip.map((c) => c.code)), [trip]);

  // Valuta di arrivo iniziale: la prima delle mete diversa da quella di partenza
  const firstTarget = trip.find((c) => c.code !== fromCode && rates?.[c.code])?.code ?? 'USD';
  const effectiveTo = toCode || firstTarget;

  if (!rates) return <Alert type="warning" message={t('countryInfo.currencyPanel.unavailable')} />;

  const rateOf = (code: string) => rates[code] ?? 0;
  const convert = (n: number, from: string, to: string) =>
    rateOf(from) && rateOf(to) ? (n / rateOf(from)) * rateOf(to) : null;
  const parse = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.'));
  const fmt = (n: number) =>
    n.toLocaleString(i18n.language, { maximumFractionDigits: n < 10 ? 4 : 2, useGrouping: true });
  const fmtInput = (n: number) => String(Math.round(n * 100) / 100).replace('.', i18n.language?.startsWith('it') ? ',' : '.');

  const typedValue = parse(typed);
  const valid = typed.trim() !== '' && Number.isFinite(typedValue) && typedValue >= 0;

  // Valori mostrati nei due campi
  let fromText = typed;
  let toText = typed;
  if (valid) {
    if (side === 'from') {
      const v = convert(typedValue, fromCode, effectiveTo);
      toText = v === null ? '' : fmtInput(v);
    } else {
      const v = convert(typedValue, effectiveTo, fromCode);
      fromText = v === null ? '' : fmtInput(v);
    }
  } else {
    if (side === 'from') toText = '';
    else fromText = '';
  }

  const swap = () => {
    setFromCode(effectiveTo);
    setToCode(fromCode);
    setSide((s) => (s === 'from' ? 'to' : 'from')); // l'importo scritto resta nella sua valuta
  };

  const updatedAt = ratesUpdatedAt('EUR');
  const unitRate = convert(1, fromCode, effectiveTo);
  const inverseRate = convert(1, effectiveTo, fromCode);

  const field = (which: 'from' | 'to') => {
    const code = which === 'from' ? fromCode : effectiveTo;
    const text = which === 'from' ? fromText : toText;
    return (
      <div className="rounded-2xl bg-slate-900/5 dark:bg-white/5 ring-1 ring-slate-300/40 dark:ring-white/10 p-3.5 min-w-0 focus-within:ring-gold/50 transition-shadow">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          {t(which === 'from' ? 'countryInfo.currencyPanel.from' : 'countryInfo.currencyPanel.to')}
        </p>
        <div className="flex items-center gap-4 min-w-0">
          <CurrencySelect
            value={code}
            options={options}
            tripCodes={tripCodes}
            onChange={(c) => (which === 'from' ? setFromCode(c) : setToCode(c))}
          />
          <span className="min-w-0 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {options.find((o) => o.code === code)?.name}
          </span>
        </div>
        {/* Campo di input vero e proprio: riquadro con bordo, simbolo della valuta e anello al focus */}
        <label className="mt-3 flex items-center gap-3 h-14 px-5 rounded-xl bg-slate-900/60 dark:bg-slate-900/50 border border-slate-700/60 hover:border-slate-500 focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15 transition-all cursor-text">
          <span className="font-poppins font-bold text-2xl text-gold shrink-0">{symbolOf(code, i18n.language)}</span>
          <input
            type="text"
            inputMode="decimal"
            value={text}
            onChange={(e) => {
              setTyped(e.target.value);
              setSide(which);
            }}
            onFocus={(e) => e.target.select()}
            aria-label={`${t('countryInfo.currencyPanel.amount')} ${code}`}
            className="min-w-0 flex-1 bg-transparent outline-none font-poppins font-bold text-2xl tabular-nums placeholder:text-slate-500"
            placeholder="0"
          />
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="card card-static !overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-5">
          {field('from')}
          <button
            type="button"
            onClick={swap}
            aria-label={t('countryInfo.currencyPanel.swap')}
            title={t('countryInfo.currencyPanel.swap')}
            className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-gold text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeftRight className="w-7 h-7 rotate-90 md:rotate-0" />
          </button>
          {field('to')}
        </div>

        {/* Tasso al centro, con le due valute selezionate */}
        {unitRate !== null && (
          <div className="mt-6 flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center gap-3 rounded-full bg-gold/10 ring-1 ring-gold/30 px-5 py-2.5 text-sm font-bold">
              <Flag flag={options.find((o) => o.code === fromCode)?.flag ?? null} code={fromCode} />
              <span>
                1 {fromCode} = <span className="text-gold">{fmt(unitRate)}</span> {effectiveTo}
              </span>
              <Flag flag={options.find((o) => o.code === effectiveTo)?.flag ?? null} code={effectiveTo} />
            </div>
            {inverseRate !== null && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1 {effectiveTo} = {fmt(inverseRate)} {fromCode}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setTyped(a);
                setSide('from');
              }}
              className="h-[32px] px-3.5 rounded-full text-xs font-bold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:border-gold/50 hover:text-gold transition-colors cursor-pointer"
            >
              {a} {fromCode}
            </button>
          ))}
        </div>
      </section>

      {updatedAt && (
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 text-center">
          <Clock className="w-3.5 h-3.5" />
          {t('countryInfo.currencyPanel.updated', {
            date: updatedAt.toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }),
          })}
        </p>
      )}
    </div>
  );
};
