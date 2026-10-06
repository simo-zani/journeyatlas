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
  Plane,
  Plug,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { Alert } from '@/components/Alert';
import { PlugTypeIcon } from '@/components/PlugTypeIcon';
import { CurrencyPanel } from '@/components/trip/country/CurrencyPanel';
import { PhrasebookPanel } from '@/components/trip/country/PhrasebookPanel';
import { WeatherPanel } from '@/components/trip/country/WeatherPanel';
import { flagUrl, resolveCountryFlags } from '@/lib/flags';
import {
  fetchCountryInfo,
  fetchExchangeRates,
  fetchTimezoneName,
  farnesinaUrl,
  languageNames,
  timezoneOffsetMinutes,
  type CountryInfo,
} from '@/lib/countryInfo';
import { PLUGS, PLUG_DESCRIPTIONS } from '@/lib/plugs';
import { fetchTransports } from '@/lib/api';
import { airportByIata, distanceKm, loadAirports } from '@/lib/airports';
import { loadTrainStations, stationByNameOrCode } from '@/lib/trainStations';
import { loadFerryPorts, portByNameOrCode } from '@/lib/ferryPorts';
import { useHomeCity } from '@/lib/useHomeCity';
import { useIsStuck } from '@/lib/useIsStuck';
import type { Destination } from '@/lib/types';

interface CountryInfoSectionProps {
  tripId: string;
  tripStart: string | null;
  tripEnd: string | null;
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

type TileTint = 'gold' | 'blue' | 'emerald' | 'purple' | 'slate';

const TILE_TINTS: Record<TileTint, { box: string; icon: string }> = {
  gold: { box: 'bg-gradient-to-br from-gold/20 to-gold/5 ring-gold/25', icon: 'text-gold' },
  blue: { box: 'bg-gradient-to-br from-light-blue/20 to-light-blue/5 ring-light-blue/25', icon: 'text-light-blue' },
  emerald: { box: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 ring-emerald-500/25', icon: 'text-emerald-400' },
  purple: { box: 'bg-gradient-to-br from-purple-500/20 to-purple-500/5 ring-purple-500/25', icon: 'text-purple-400' },
  slate: { box: 'bg-slate-900/5 dark:bg-white/5 ring-slate-300/40 dark:ring-white/10', icon: 'text-slate-400' },
};

/** Riquadro della bento grid: etichetta in alto, icona grande sfumata sullo sfondo. */
const BentoTile: React.FC<{
  icon: LucideIcon;
  label: string;
  tint?: TileTint;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}> = ({ icon: Icon, label, tint = 'slate', className = '', bodyClassName = '', children }) => {
  const c = TILE_TINTS[tint];
  return (
    <div className={`relative overflow-hidden rounded-2xl ring-1 p-3.5 min-w-0 text-center ${c.box} ${className}`}>
      <Icon className={`absolute -bottom-2 -right-2 w-14 h-14 opacity-10 ${c.icon}`} strokeWidth={1.5} />
      <p className={`relative flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${c.icon}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <div className={`relative mt-2.5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

/** Differenza oraria rispetto al dispositivo, es. "+5 h" / "−1 h 30 min". */
const offsetFromHere = (timeZone: string): string => {
  const diff = timezoneOffsetMinutes(timeZone) - -new Date().getTimezoneOffset();
  if (diff === 0) return '0 h';
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${diff > 0 ? '+' : '−'}${h} h${m ? ` ${m} min` : ''}`;
};

/** Logo di Viaggiare Sicuri (favicon del sito); se non carica resta lo scudo. */
const SafetyLogo: React.FC = () => {
  const [failed, setFailed] = useState(false);
  if (failed) return <ShieldCheck className="w-5 h-5 text-gold shrink-0" />;
  return (
    <img
      src="https://www.google.com/s2/favicons?sz=64&domain=viaggiaresicuri.it"
      alt=""
      className="w-5 h-5 shrink-0 object-contain rounded"
      onError={() => setFailed(true)}
    />
  );
};

const PlugTile: React.FC<{ country: CountryInfo }> = ({ country }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('it') ? 'it' : 'en';
  const plug = PLUGS[country.code];
  if (!plug) return null;

  const fits = plug.types.some((x) => COMPATIBLE_WITH_ITALY.includes(x));
  const differentVoltage = plug.voltage < 200;
  const ok = fits || !differentVoltage;

  return (
    <BentoTile
      icon={Plug}
      label={t('countryInfo.plugs')}
      tint="blue"
      className="col-span-2 flex flex-col min-h-[340px]"
      bodyClassName="flex-1 flex flex-col"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-3">
          {plug.types.map((type) => (
            <div key={type} className="flex flex-col items-center gap-1">
              <PlugTypeIcon type={type} className="w-14 h-14 drop-shadow-sm" />
              <span className="text-xs font-bold text-gold-light">{type}</span>
            </div>
          ))}
        </div>
        <p className="font-poppins font-bold text-xl leading-tight whitespace-nowrap">
          {plug.voltage} V
          <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">{plug.frequency} Hz</span>
        </p>
      </div>
      <p className="my-3 text-xs text-slate-500 dark:text-slate-400">
        {plug.types.map((type) => `${type}: ${PLUG_DESCRIPTIONS[type]?.[lang] ?? ''}`).join(' · ')}
      </p>
      <div
        className={`mt-auto flex items-start justify-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-center ${
          ok ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
        }`}
      >
        <TriangleAlert className="w-5 h-5 shrink-0" />
        <div className="space-y-1">
          <p>{fits ? t('countryInfo.plugFits') : t('countryInfo.plugAdapter')}</p>
          {differentVoltage && <p>{t('countryInfo.voltageWarning', { voltage: plug.voltage })}</p>}
        </div>
      </div>
    </BentoTile>
  );
};

export const CountryInfoSection: React.FC<CountryInfoSectionProps> = ({ tripId, tripStart, tripEnd, tripDestinations }) => {
  const { t, i18n } = useTranslation();
  const isItalian = i18n.language?.startsWith('it');
  const [tab, setTab] = useState<SubTab>('overview');
  const [barSentinelRef, barStuck] = useIsStuck(56);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [zones, setZones] = useState<Record<string, string[]>>({});
  // Paesi attraversati da voli, treni o traghetti ma che non sono una meta del viaggio
  const [transit, setTransit] = useState<CountryInfo[]>([]);
  const [transitZones, setTransitZones] = useState<Record<string, string[]>>({});
  const homeCity = useHomeCity();
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

  // Paesi di passaggio: quelli degli scali (aeroporti, stazioni, porti dei mezzi del viaggio)
  // che non sono tra le mete. Il paese di casa non conta: non è un passaggio, è la partenza.
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    const run = async () => {
      try {
        const [rows, airports, stations, ports] = await Promise.all([
          fetchTransports(tripId),
          loadAirports(),
          loadTrainStations(),
          loadFerryPorts(),
        ]);
        const countryOf = (type: string, value: string): string | null => {
          const code =
            type === 'flight'
              ? airportByIata(airports, value)?.country
              : type === 'train'
                ? stationByNameOrCode(stations, value)?.country
                : type === 'ferry'
                  ? portByNameOrCode(ports, value)?.country
                  : undefined;
          return code ? code.toUpperCase() : null;
        };

        // paese di casa: quello dell'aeroporto più vicino alla città di casa, altrimenti la partenza del primo mezzo
        let home: string | null = null;
        if (homeCity?.coords) {
          let best = Infinity;
          for (const a of airports) {
            const km = distanceKm(homeCity.coords, a);
            if (km < best) {
              best = km;
              home = a.country.toUpperCase();
            }
          }
        } else if (rows[0]) {
          home = countryOf(rows[0].transport_type, rows[0].departure_airport);
        }

        const known = new Set(countries.map((c) => c.code.toUpperCase()));
        const found = new Set<string>();
        for (const r of rows) {
          for (const v of [r.departure_airport, r.arrival_airport]) {
            const code = countryOf(r.transport_type, v);
            if (code && code !== home && !known.has(code)) found.add(code);
          }
        }

        const settled = await Promise.allSettled([...found].map((code) => fetchCountryInfo(code)));
        const infos = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
        if (cancelled) return;
        setTransit(infos);

        // fuso dal centro del paese (non ci sono coordinate di mete)
        const entries = await Promise.all(
          infos.map(async (info) => {
            if (!info.latlng) return [info.code, [] as string[]] as const;
            try {
              return [info.code, [await fetchTimezoneName(info.latlng[0], info.latlng[1])]] as const;
            } catch {
              return [info.code, [] as string[]] as const;
            }
          })
        );
        if (!cancelled) setTransitZones(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setTransit([]);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [tripId, countries, loading, homeCity]);

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
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
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

  const renderCard = (c: CountryInfo, isTransit: boolean) => {
    const zoneList = zones[c.code] ?? transitZones[c.code] ?? [];
    const name = isItalian ? c.nameIt : c.nameEn;
    return (
      <div
        key={c.code}
        className={`card card-static transition-opacity duration-200 ${
          isTransit ? 'opacity-60 hover:opacity-100 border-slate-200/40 dark:border-white/5' : ''
        }`}
      >
        {/* Bandiera sullo sfondo, in alto a sinistra, che sfuma verso l'interno della card */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[85%] h-[260px] bg-cover bg-center opacity-35 pointer-events-none [mask-image:linear-gradient(135deg,black_0%,transparent_62%)]"
          style={{ backgroundImage: `url(${flagUrl(c.code)})` }}
        />

        {/* Rimando al sito ufficiale Viaggiare Sicuri, con il suo logo */}
        <div className="relative mb-5 flex items-center justify-center">
          <a
            href={farnesinaUrl(c.cca3)}
            target="_blank"
            rel="noopener noreferrer"
            title={t('countryInfo.safetySub')}
            className="relative flex w-fit items-center justify-center gap-2 h-[32px] rounded-full px-3.5 bg-gold/10 ring-1 ring-gold/30 hover:bg-gold/20 transition-colors no-underline hover:no-underline"
          >
            <SafetyLogo />
            <span className="truncate text-xs font-semibold text-center text-slate-900 dark:text-slate-100">
              {t('countryInfo.farnesina')}
            </span>
            <ExternalLink className="w-5 h-5 text-gold shrink-0" />
          </a>
          {isTransit && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 ring-1 ring-gold/30 text-xs font-bold text-gold">
              <Plane className="w-5 h-5" />
              {t('countryInfo.transitBadge')}
            </span>
          )}
        </div>

        <div className="relative mb-6 flex flex-col items-center text-center">
          <h3 className="font-poppins font-bold text-2xl leading-tight break-words">{name}</h3>
          {(c.subregion || c.region) && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.subregion || c.region}</p>
          )}
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          {c.currencies.length > 0 && (
            <BentoTile icon={Coins} label={t('countryInfo.currency')} tint="gold">
              <div className="space-y-3">
                {c.currencies.map((cur) => {
                  const rate = rates?.[cur.code];
                  return (
                    <div key={cur.code} className="min-w-0">
                      <p className="font-poppins font-bold text-3xl leading-none">{cur.symbol || cur.code}</p>
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate" title={`${cur.name} · ${cur.code}`}>
                        {cur.name} · {cur.code}
                      </p>
                      {rate && cur.code !== HOME_CURRENCY && (
                        <p className="mx-auto mt-2.5 w-fit max-w-full rounded-full bg-gold/15 ring-1 ring-gold/25 px-2.5 py-1 text-[11px] font-bold text-gold truncate">
                          1 {HOME_CURRENCY} = {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {cur.code}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </BentoTile>
          )}

          {zoneList.length > 0 && (
            <BentoTile icon={Clock} label={t('countryInfo.timezone')} tint="blue">
              <div className="space-y-2.5">
                {zoneList.map((tz) => (
                  <div key={tz} className="min-w-0">
                    <p className="font-poppins font-bold text-3xl leading-none tabular-nums">
                      {new Date().toLocaleTimeString(i18n.language, {
                        timeZone: tz,
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate" title={tz.replace('_', ' ')}>
                      {tz.replace('_', ' ')}
                    </p>
                    <p className="mx-auto mt-2.5 w-fit max-w-full rounded-full bg-light-blue/15 ring-1 ring-light-blue/25 px-2.5 py-1 text-[11px] font-bold text-light-blue truncate">
                      {t('countryInfo.fromYou', { diff: offsetFromHere(tz) })}
                    </p>
                  </div>
                ))}
              </div>
            </BentoTile>
          )}

          {c.capital.length > 0 && (
            <BentoTile icon={Landmark} label={t('countryInfo.capital')} tint="purple">
              <p className="font-poppins font-bold text-lg leading-snug break-words">{c.capital.join(', ')}</p>
            </BentoTile>
          )}

          {c.languages.length > 0 && (
            <BentoTile icon={Languages} label={t('countryInfo.languages')} tint="emerald">
              <p className="font-poppins font-bold text-lg leading-snug break-words">{languageNames(c, i18n.language).join(', ')}</p>
            </BentoTile>
          )}

          {c.callingCode && (
            <BentoTile icon={Phone} label={t('countryInfo.callingCode')}>
              <p className="font-poppins font-bold text-2xl leading-none">{c.callingCode}</p>
            </BentoTile>
          )}

          <BentoTile icon={Car} label={t('countryInfo.driving')}>
            <p className="font-poppins font-bold text-lg leading-snug">{t(`countryInfo.side.${c.drivingSide}`)}</p>
          </BentoTile>

          <PlugTile country={c} />
        </div>
      </div>
    );

  };

  return (
    <div className="space-y-6">
      {error && <Alert type="warning" message={error} />}

      {/* Sotto-schede: barra sticky come i filtri degli altri tab (stessa posizione e altezza) */}
      <div ref={barSentinelRef} className="h-0 !mt-0" aria-hidden="true" />
      <div
        className={`!mt-0 sticky top-14 z-20 py-1.5 before:content-[''] before:absolute before:-z-10 before:inset-x-[-50vw] before:top-[-120px] before:bottom-[-12px] before:backdrop-blur-md before:bg-[var(--surface-0)]/60 before:pointer-events-none before:[mask-image:linear-gradient(to_bottom,black_80%,transparent)] before:transition-opacity before:duration-500 before:ease-out ${barStuck ? 'before:opacity-100' : 'before:opacity-0'}`}
      >
        <nav
          className="flex gap-1 w-full items-center overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1 my-1 rounded-full bg-slate-900/80 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 dark:border-white/10 shadow-md"
          aria-label="Country info sections"
        >
          {SUB_TABS.map(({ id, icon: Icon }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`relative flex flex-1 min-w-0 px-3 py-1 items-center justify-center gap-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-slate-950' : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="country-tab-active"
                    className="absolute inset-0 rounded-full bg-gold shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="w-5 h-5 relative shrink-0" strokeWidth={2} />
                <span className="relative truncate select-none">{t(`countryInfo.tabs.${id}`)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {tab === 'overview' && (
        <>
          {/* Mete e paesi di passaggio nella stessa griglia: i passaggi vengono dopo, "spenti" */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((c) => renderCard(c, false))}
            {transit.map((c) => renderCard(c, true))}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 text-center">
            <Globe2 className="w-3.5 h-3.5" />
            {t('countryInfo.sources')}
          </p>
        </>
      )}

      {tab === 'weather' && <WeatherPanel destinations={tripDestinations} tripId={tripId} tripStart={tripStart} tripEnd={tripEnd} />}
      {tab === 'currency' && <CurrencyPanel countries={countries} rates={rates} />}
      {tab === 'phrasebook' && <PhrasebookPanel countries={countries} />}
    </div>
  );
};
