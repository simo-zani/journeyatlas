import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { CountryFlag } from '@/components/CountryFlag';
import { Input } from '@/components/Input';
import type { CountryInfo } from '@/lib/countryInfo';

const BASE_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

interface CurrencyPanelProps {
  countries: CountryInfo[];
  rates: Record<string, number> | null;
}

export const CurrencyPanel: React.FC<CurrencyPanelProps> = ({ countries, rates }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('EUR');

  const targets = useMemo(() => {
    const seen = new Set<string>();
    const out: { code: string; name: string; symbol: string; flag: string }[] = [];
    for (const c of countries) {
      for (const cur of c.currencies) {
        if (seen.has(cur.code)) continue;
        seen.add(cur.code);
        out.push({ ...cur, flag: c.code });
      }
    }
    return out;
  }, [countries]);

  const fromOptions = useMemo(
    () => [...new Set([...BASE_CURRENCIES, ...targets.map((x) => x.code)])].filter((c) => rates?.[c]),
    [targets, rates]
  );

  if (!rates) return <Alert type="warning" message={t('countryInfo.currencyPanel.unavailable')} />;

  const value = Number(amount.replace(',', '.'));
  const valid = Number.isFinite(value) && value >= 0;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: n < 10 ? 4 : 2 });

  return (
    <div className="space-y-6">
      <section className="card card-static">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-7 h-7" />
          </div>
          <h3 className="font-poppins font-semibold text-lg">{t('countryInfo.currencyPanel.title')}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('countryInfo.currencyPanel.amount')}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="w-full">
            <label className="label">{t('countryInfo.currencyPanel.from')}</label>
            <select className="input-field" value={from} onChange={(e) => setFrom(e.target.value)}>
              {fromOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((cur) => {
          const rate = rates[cur.code];
          const converted = valid && rate ? (value / rates[from]) * rate : null;
          return (
            <div key={cur.code} className="card card-static flex items-center gap-4">
              <CountryFlag code={cur.flag} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                  {cur.name} ({cur.code})
                </p>
                <p className="text-3xl font-bold truncate">
                  {converted === null ? '—' : fmt(converted)} <span className="text-lg text-gold">{cur.symbol || cur.code}</span>
                </p>
                {rate && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    1 {from} = {fmt(rate / rates[from])} {cur.code}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
