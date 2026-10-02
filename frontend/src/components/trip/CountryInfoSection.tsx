import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  BookOpen,
  Car,
  CloudSun,
  Clock,
  Coins,
  ExternalLink,
  Globe2,
  Landmark,
  Languages,
  Loader2,
  Phone,
  Plug,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { Alert } from '@/components/Alert';
import { CountryFlag } from '@/components/CountryFlag';
import { CurrencyPanel } from '@/components/trip/country/CurrencyPanel';
import { PhrasebookPanel } from '@/components/trip/country/PhrasebookPanel';
import { WeatherPanel } from '@/components/trip/country/WeatherPanel';
import { resolveCountryFlags } from '@/lib/flags';
import {
  fetchCountryInfo,
  fetchExchangeRates,
  fetchTimezoneName,
  farnesinaUrl,
  timezoneOffsetMinutes,
  type CountryInfo,
} from '@/lib/countryInfo';
import { PLUGS, PLUG_DESCRIPTIONS } from '@/lib/plugs';
import type { Destination } from '@/lib/types';

interface CountryInfoSectionProps {
  tripDestinations: Destination[];
}

type SubTab = 'overview' | 'weather' | 'currency' | 'phrasebook';

const SUB_TABS: { id: SubTab; icon: LucideIcon }[] = [
  { id: 'overview', icon: Globe2 },
  { id: 'weather', icon: CloudSun },
  { id: 'currency', icon: ArrowLeftRight },
  { id: 'phrasebook', icon: BookOpen },
];

const HOME_CURRENCY = 'EUR';
/** Tipi di presa che si infilano nelle prese italiane (C: Europlug, F: Schuko, L: italiana). */
const COMPATIBLE_WITH_ITALY = ['C', 'F', 'L'];

const Row: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
  icon,
  label,
  children,
}) => (
  <div className="flex items-start gap-3.5">
    <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  </div>
);

/** Differenza oraria rispetto al dispositivo, es. "+5 h" / "−1 h 30 min". */
const offsetFromHere = (timeZone: string): string => {
  const diff = timezoneOffsetMinutes(timeZone) - -new Date().getTimezoneOffset();
  if (diff === 0) return '0 h';
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${diff > 0 ? '+' : '−'}${h} h${m ? ` ${m} min` : ''}`;
};

const PlugRow: React.FC<{ country: CountryInfo }> = ({ country }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('it') ? 'it' : 'en';
  const plug = PLUGS[country.code];
  if (!plug) return null;

  const fits = plug.types.some((x) => COMPATIBLE_WITH_ITALY.includes(x));
  const differentVoltage = plug.voltage < 200;

  return (
    <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-white/10 space-y-4">
      <Row icon={<Plug className="w-7 h-7" />} label={t('countryInfo.plugs')}>
        <div className="flex flex-wrap gap-2 mb-2">
          {plug.types.map((type) => (
            <span
              key={type}
              className="w-11 h-11 rounded-xl bg-deep-blue text-gold-light flex items-center justify-center text-xl font-bold shadow-sm"
            >
              {type}
            </span>
          ))}
        </div>
        <ul className="text-xs text-slate-500 dark:text-slate-400 font-normal space-y-0.5">
          {plug.types.map((type) => (
            <li key={type}>
              <span className="font-semibold">{type}</span> · {PLUG_DESCRIPTIONS[type]?.[lang]}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          {plug.voltage} V · {plug.frequency} Hz
        </p>
      </Row>
      <div
        className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
          fits || !differentVoltage ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
        }`}
      >
        <TriangleAlert className="w-6 h-6 shrink-0" />
        <div className="space-y-1">
          <p>{fits ? t('countryInfo.plugFits') : t('countryInfo.plugAdapter')}</p>
          {differentVoltage && <p>{t('countryInfo.voltageWarning', { voltage: plug.voltage })}</p>}
        </div>
      </div>
    </div>
  );
};

export const CountryInfoSection: React.FC<CountryInfoSectionProps> = ({ tripDestinations }) => {
  const { t, i18n } = useTranslation();
  const isItalian = i18n.language?.startsWith('it');
  const [tab, setTab] = useState<SubTab>('overview');
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [zones, setZones] = useState<Record<string, string[]>>({});
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Un viaggio senza destinazioni arriva come `[]` nuovo a ogni render: la
  // chiave stabile evita di rilanciare il caricamento senza che sia cambiato nulla.
  const destinationsKey = useMemo(() => JSON.stringify(tripDestinations), [tripDestinations]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const codes = await resolveCountryFlags(tripDestinations);
        const settled = await Promise.allSettled(codes.map((code) => fetchCountryInfo(code)));
        if (cancelled) return;
        const infos = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
        setCountries(infos);
        // Il fuso viene dalle coordinate delle mete nel paese (o dal centro del paese):
        // opzionale, se fallisce la riga resta semplicemente nascosta.
        void Promise.all(
          infos.map(async (info) => {
            const points = tripDestinations
              .filter((d) => d.coords && d.countryCode?.toUpperCase() === info.code)
              .map((d) => [d.coords!.lat, d.coords!.lon] as const);
            if (points.length === 0 && info.latlng) points.push([info.latlng[0], info.latlng[1]]);
            const names = await Promise.allSettled(points.map(([lat, lon]) => fetchTimezoneName(lat, lon)));
            const unique = [...new Set(names.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])))];
            return [info.code, unique] as const;
          })
        ).then((entries) => {
          if (!cancelled) setZones(Object.fromEntries(entries));
        });
        if (infos.length < codes.length) setError(t('countryInfo.partialError'));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t('common.error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationsKey, t]);

  // I tassi sono opzionali: se falliscono il resto della scheda resta utile.
  useEffect(() => {
    let cancelled = false;
    fetchExchangeRates(HOME_CURRENCY)
      .then((r) => {
        if (!cancelled) setRates(r);
      })
      .catch(() => {
        if (!cancelled) setRates(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-16 h-16 text-gold animate-spin" />
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <>
        {error && <Alert type="error" message={error} />}
        <div className="empty-state">
          <div className="empty-state-icon">🌍</div>
          <p className="empty-state-title">{t('countryInfo.emptyTitle')}</p>
          <p className="empty-state-message">{t('countryInfo.emptyMessage')}</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {error && <Alert type="warning" message={error} />}

      {/* Sotto-schede: stessa pillola delle schede del viaggio */}
      <nav
        className="flex gap-1 sm:gap-1.5 w-full items-center overflow-x-auto overflow-y-hidden p-1.5 rounded-full bg-slate-900/5 dark:bg-white/5"
        aria-label="Country info sections"
      >
        {SUB_TABS.map(({ id, icon: Icon }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`tab-pill relative flex flex-1 min-w-0 px-2 py-2.5 items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold ${
                isActive
                  ? 'text-deep-blue dark:text-gold-light'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="country-tab-active"
                  className="absolute inset-0 rounded-full bg-gold/15 ring-1 ring-gold/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="w-6 h-6 relative shrink-0" strokeWidth={2} />
              <span className="relative truncate select-none">{t(`countryInfo.tabs.${id}`)}</span>
            </button>
          );
        })}
      </nav>

      {tab === 'overview' && (
        <>
          {/* Link ufficiale Farnesina, uno per paese */}
          <section>
            <h2 className="font-poppins font-semibold text-xl mb-3 flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </span>
              {t('countryInfo.safetyTitle')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {countries.map((c) => (
                <a
                  key={c.code}
                  href={farnesinaUrl(c.cca3)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 h-12 rounded-xl bg-gold/15 ring-1 ring-gold/30 hover:bg-gold/25 transition-colors font-semibold text-sm no-underline hover:no-underline"
                >
                  <CountryFlag code={c.code} size="lg" />
                  <span>{isItalian ? c.nameIt : c.nameEn}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t('countryInfo.farnesina')}</span>
                  <ExternalLink className="w-5 h-5 text-gold" />
                </a>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {countries.map((c) => {
              const name = isItalian ? c.nameIt : c.nameEn;
              return (
                <div key={c.code} className="card card-static">
                  <div className="flex items-center gap-3 mb-5">
                    <CountryFlag code={c.code} size="lg" label={name} />
                    <div className="min-w-0">
                      <h3 className="font-poppins font-semibold text-lg truncate">{name}</h3>
                      {(c.subregion || c.region) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.subregion || c.region}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {c.capital.length > 0 && (
                      <Row icon={<Landmark className="w-7 h-7" />} label={t('countryInfo.capital')}>
                        {c.capital.join(', ')}
                      </Row>
                    )}
                    {c.languages.length > 0 && (
                      <Row icon={<Languages className="w-7 h-7" />} label={t('countryInfo.languages')}>
                        {c.languages.join(', ')}
                      </Row>
                    )}
                    {c.currencies.length > 0 && (
                      <Row icon={<Coins className="w-7 h-7" />} label={t('countryInfo.currency')}>
                        {c.currencies.map((cur) => {
                          const rate = rates?.[cur.code];
                          return (
                            <div key={cur.code}>
                              {cur.name} ({cur.code}
                              {cur.symbol ? ` · ${cur.symbol}` : ''})
                              {rate && cur.code !== HOME_CURRENCY && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                                  1 {HOME_CURRENCY} = {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
                                  {cur.code}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </Row>
                    )}
                    {(zones[c.code]?.length ?? 0) > 0 && (
                      <Row icon={<Clock className="w-7 h-7" />} label={t('countryInfo.timezone')}>
                        {zones[c.code].map((tz) => (
                          <div key={tz}>
                            {new Date().toLocaleTimeString(i18n.language, {
                              timeZone: tz,
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                              {tz.replace('_', ' ')} ({t('countryInfo.fromYou', { diff: offsetFromHere(tz) })})
                            </span>
                          </div>
                        ))}
                      </Row>
                    )}
                    {c.callingCode && (
                      <Row icon={<Phone className="w-7 h-7" />} label={t('countryInfo.callingCode')}>
                        {c.callingCode}
                      </Row>
                    )}
                    <Row icon={<Car className="w-7 h-7" />} label={t('countryInfo.driving')}>
                      {t(`countryInfo.side.${c.drivingSide}`)}
                    </Row>
                  </div>

                  <PlugRow country={c} />
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Globe2 className="w-4 h-4" />
            {t('countryInfo.sources')}
          </p>
        </>
      )}

      {tab === 'weather' && <WeatherPanel destinations={tripDestinations} />}
      {tab === 'currency' && <CurrencyPanel countries={countries} rates={rates} />}
      {tab === 'phrasebook' && <PhrasebookPanel countries={countries} />}
    </div>
  );
};
