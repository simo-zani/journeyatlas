import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  ChevronDown,
  CloudSun,
  Droplets,
  Loader2,
  Sun,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Alert } from '@/components/Alert';
import { CountryFlag } from '@/components/CountryFlag';
import { fetchAccommodations } from '@/lib/api';
import { foldText } from '@/lib/countries';
import {
  CLIMATE_YEARS,
  fetchHourly,
  fetchNextDays,
  fetchTripWeather,
  localDateStr,
  type DayWeather,
  type HourWeather,
} from '@/lib/weather';
import type { Destination } from '@/lib/types';

/** Codici WMO di Open-Meteo → icona e tono. */
const weatherVisual = (code: number): { Icon: LucideIcon; tone: string } => {
  if (code === 0) return { Icon: Sun, tone: 'text-gold' };
  if (code <= 2) return { Icon: CloudSun, tone: 'text-gold' };
  if (code === 3) return { Icon: Cloud, tone: 'text-slate-400' };
  if (code <= 48) return { Icon: CloudFog, tone: 'text-slate-400' };
  if (code <= 57) return { Icon: CloudDrizzle, tone: 'text-sky-400' };
  if (code <= 67 || (code >= 80 && code <= 82)) return { Icon: CloudRain, tone: 'text-sky-500' };
  if (code <= 77 || code === 85 || code === 86) return { Icon: CloudSnow, tone: 'text-sky-300' };
  return { Icon: CloudLightning, tone: 'text-amber-500' };
};

interface Place {
  key: string;
  city: string;
  countryCode: string;
  lat: number;
  lon: number;
}

type Mode = 'forecast' | 'history' | 'climate' | 'trip' | 'next7';
type Result = { place: Place; days: DayWeather[] | null; mode: Mode };
type Range = { start: string; end: string };

interface WeatherPanelProps {
  destinations: Destination[];
  tripId: string;
  tripStart: string | null;
  tripEnd: string | null;
}

/** Cosa sta guardando l'utente, in base a dove cadono i giorni rispetto a oggi. */
const modeOf = (days: DayWeather[]): Mode => {
  const today = localDateStr(new Date());
  if (days.every((d) => d.source === 'climate')) return 'climate';
  if (days.some((d) => d.source === 'climate')) return 'trip';
  if (days.every((d) => d.date < today)) return 'history';
  if (days.every((d) => d.date >= today)) return 'forecast';
  return 'trip';
};

/** Riassunto a riquadro chiuso: periodo, icona di ogni giorno, minima-massima e pioggia massima. */
const CollapsedSummary: React.FC<{ days: DayWeather[] }> = ({ days }) => {
  const lo = Math.round(Math.min(...days.map((d) => d.tMin)));
  const hi = Math.round(Math.max(...days.map((d) => d.tMax)));
  const rainValues = days.flatMap((d) => (d.rainChance !== null ? [d.rainChance] : []));
  const rain = rainValues.length ? Math.max(...rainValues) : null;
  // dd/mm, in piccolo sopra l'icona del giorno
  const short = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

  return (
    <div className="ml-auto mr-5 flex items-center gap-[56px] text-sm min-w-0">
      <span className="hidden sm:flex items-end gap-[32px]">
        {days.slice(0, 7).map((d) => {
          const { Icon, tone } = weatherVisual(d.code);
          return (
            <span key={d.date} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] leading-none font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                {short(d.date)}
              </span>
              <Icon className={`w-5 h-5 ${tone}`} strokeWidth={1.75} />
            </span>
          );
        })}
      </span>
      <span className="font-bold whitespace-nowrap tabular-nums">
        {lo}°<span className="text-slate-500 dark:text-slate-400 font-medium"> – </span>
        {hi}°
      </span>
      {rain !== null && (
        <span className="flex items-center gap-1 text-xs font-semibold text-sky-500 whitespace-nowrap">
          <Droplets className="w-3.5 h-3.5" />
          {rain}%
        </span>
      )}
    </div>
  );
};

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ destinations, tripId, tripStart, tripEnd }) => {
  const { t, i18n } = useTranslation();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  // le card partono sempre compresse: si ricordano solo quelle aperte
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<{ key: string; date: string } | null>(null);
  const [hourly, setHourly] = useState<{ hours: HourWeather[] | null; loading: boolean }>({
    hours: null,
    loading: false,
  });

  const { places, skipped } = useMemo(() => {
    const seen = new Set<string>();
    const out: Place[] = [];
    let missing = 0;
    for (const d of destinations) {
      if (!d.coords) {
        missing += 1;
        continue;
      }
      const key = `${d.coords.lat.toFixed(2)},${d.coords.lon.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ key, city: d.city || d.country, countryCode: d.countryCode ?? '', lat: d.coords.lat, lon: d.coords.lon });
    }
    return { places: out, skipped: missing };
  }, [destinations]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelected(null);

    const load = async () => {
      // Giorni per città: quelli in cui hai l'alloggio lì; senza alloggio, l'intero viaggio.
      const cityRanges = new Map<string, Range>();
      try {
        for (const acc of await fetchAccommodations(tripId)) {
          if (!acc.city || !acc.check_in_date || !acc.check_out_date) continue;
          const key = foldText(acc.city);
          const prev = cityRanges.get(key);
          cityRanges.set(key, {
            start: prev && prev.start < acc.check_in_date ? prev.start : acc.check_in_date,
            end: prev && prev.end > acc.check_out_date ? prev.end : acc.check_out_date,
          });
        }
      } catch {
        // senza alloggi si usa l'intero viaggio
      }

      const rangeFor = (place: Place): Range | null => {
        const own = cityRanges.get(foldText(place.city));
        const start = own?.start ?? tripStart;
        const end = own?.end ?? tripEnd;
        if (!start || !end || end < start) return null;
        // dentro le date del viaggio, se note
        return {
          start: tripStart && start < tripStart ? tripStart : start,
          end: tripEnd && end > tripEnd ? tripEnd : end,
        };
      };

      return Promise.all(
        places.map(async (place): Promise<Result> => {
          try {
            const range = rangeFor(place);
            const days = range
              ? await fetchTripWeather(place.lat, place.lon, range.start, range.end)
              : await fetchNextDays(place.lat, place.lon);
            if (days.length === 0) return { place, days: null, mode: 'trip' };
            return { place, days, mode: range ? modeOf(days) : 'next7' };
          } catch {
            return { place, days: null, mode: 'trip' };
          }
        })
      );
    };

    void load().then((r) => {
      if (cancelled) return;
      setResults(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [places, tripId, tripStart, tripEnd]);

  // Andamento orario del giorno scelto
  useEffect(() => {
    if (!selected) return;
    const place = places.find((p) => p.key === selected.key);
    if (!place) return;
    let cancelled = false;
    setHourly({ hours: null, loading: true });
    fetchHourly(place.lat, place.lon, selected.date)
      .then((hours) => {
        if (!cancelled) setHourly({ hours, loading: false });
      })
      .catch(() => {
        if (!cancelled) setHourly({ hours: null, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [selected, places]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⛅</div>
        <p className="empty-state-title">{t('countryInfo.weather.emptyTitle')}</p>
        <p className="empty-state-message">{t('countryInfo.weather.emptyMessage')}</p>
      </div>
    );
  }

  const weekday = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' });
  const fullDay = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });

  // Visibili solo Previsioni, Clima tipico e Prossimi 7 giorni: per i giorni già vissuti o misti non serve nessuna etichetta
  const modeLabel = (mode: Mode): string | null =>
    mode === 'history' || mode === 'trip'
      ? null
      : mode === 'climate'
        ? t('countryInfo.weather.modeClimate', { years: CLIMATE_YEARS })
        : t(`countryInfo.weather.mode.${mode}`);

  // Numero del giorno del viaggio (1 = primo giorno), se il viaggio ha una data di inizio
  const tripDayNumber = (date: string): number | null => {
    if (!tripStart) return null;
    const diff = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${tripStart}T00:00:00Z`)) / 86400000) + 1;
    return diff >= 1 ? diff : null;
  };

  const today = localDateStr(new Date());
  const nowHour = new Date().getHours();

  return (
    <div className="space-y-6">
      {skipped > 0 && <Alert type="info" message={t('countryInfo.weather.skipped', { count: skipped })} />}
      {results.map(({ place, days, mode }) => {
        const selectedDate = selected?.key === place.key ? selected.date : null;
        return (
          <section key={place.key} className="card card-static">
            <button
              type="button"
              onClick={() => setExpanded((c) => ({ ...c, [place.key]: !c[place.key] }))}
              aria-expanded={!!expanded[place.key]}
              className="w-full flex items-center gap-3 flex-wrap text-left cursor-pointer select-none"
            >
              {place.countryCode && <CountryFlag code={place.countryCode} size="lg" />}
              <h3 className="font-poppins font-semibold text-lg truncate">{place.city}</h3>
              {modeLabel(mode) && (
                <span className="text-xs text-slate-500 dark:text-slate-400">{modeLabel(mode)}</span>
              )}
              {!expanded[place.key] && days && days.length > 0 && <CollapsedSummary days={days} />}
              <ChevronDown
                className={`w-5 h-5 ${!expanded[place.key] && days ? '' : 'ml-auto'} shrink-0 text-slate-400 transition-transform duration-200 ${
                  expanded[place.key] ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {expanded[place.key] && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  // il margine negativo + padding lascia spazio all'anello di selezione, che altrimenti verrebbe tagliato
                  className="overflow-hidden -mx-1.5 px-1.5 -my-1.5 py-1.5"
                >
                  <div className="pt-5">
            {days ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {days.map((day) => {
                    const { Icon, tone } = weatherVisual(day.code);
                    const clickable = day.source !== 'climate';
                    const isSelected = selectedDate === day.date;
                    const rain =
                      day.rainChance !== null
                        ? `${day.rainChance}%`
                        : day.precipMm !== null
                          ? `${Math.round(day.precipMm * 10) / 10} mm`
                          : null;
                    return (
                      <button
                        key={day.date}
                        type="button"
                        disabled={!clickable}
                        onClick={() =>
                          setSelected(isSelected ? null : { key: place.key, date: day.date })
                        }
                        aria-pressed={clickable ? isSelected : undefined}
                        title={clickable ? t('countryInfo.weather.hourlyHint') : undefined}
                        className={`relative flex flex-col items-center gap-2 rounded-2xl px-3 py-5 transition-all ${
                          isSelected
                            ? 'bg-gold/15 ring-1 ring-gold/50'
                            : 'bg-slate-900/5 dark:bg-white/5 ring-1 ring-transparent'
                        } ${clickable ? 'cursor-pointer hover:bg-slate-900/10 dark:hover:bg-white/10' : 'cursor-default'}`}
                      >
                        {tripDayNumber(day.date) !== null && (
                          <span className="-mt-2 text-[10px] leading-none font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t('countryInfo.weather.tripDay', { n: tripDayNumber(day.date) })}
                          </span>
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                          {weekday(day.date)}
                        </span>
                        <Icon className={`w-10 h-10 ${tone}`} strokeWidth={1.75} />
                        <div className="text-center leading-tight">
                          <span className="text-lg font-bold">{Math.round(day.tMax)}°</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400"> / {Math.round(day.tMin)}°</span>
                        </div>
                        {rain && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-sky-500">
                            <Droplets className="w-3.5 h-3.5" />
                            {rain}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="mt-5 rounded-2xl bg-slate-900/5 dark:bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h4 className="font-poppins font-semibold capitalize">
                        {t('countryInfo.weather.hourlyTitle')} · {fullDay(selectedDate)}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label={t('common.close')}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {hourly.loading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-10 h-10 text-gold animate-spin" />
                      </div>
                    ) : hourly.hours && hourly.hours.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {hourly.hours.map((h) => {
                          const { Icon, tone } = weatherVisual(h.code);
                          const isNow = selectedDate === today && h.hour === nowHour;
                          const rain =
                            h.rainChance !== null
                              ? `${h.rainChance}%`
                              : h.precipMm !== null && h.precipMm > 0
                                ? `${Math.round(h.precipMm * 10) / 10} mm`
                                : null;
                          return (
                            <div
                              key={h.hour}
                              className={`min-w-[72px] shrink-0 flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 ${
                                isNow ? 'bg-gold/15 ring-1 ring-gold/50' : 'bg-slate-900/5 dark:bg-white/5'
                              }`}
                            >
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                                {String(h.hour).padStart(2, '0')}:00
                              </span>
                              <Icon className={`w-7 h-7 ${tone}`} strokeWidth={1.75} />
                              <span className="font-bold">{Math.round(h.temp)}°</span>
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-500 min-h-[16px]">
                                {rain && (
                                  <>
                                    <Droplets className="w-3.5 h-3.5" />
                                    {rain}
                                  </>
                                )}
                              </span>
                              {h.wind !== null && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                  <Wind className="w-3.5 h-3.5" />
                                  {Math.round(h.wind)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('countryInfo.weather.hourlyError')}</p>
                    )}
                  </div>
                )}

                {!selectedDate && days.some((d) => d.source !== 'climate') && (
                  <p className="mt-6 -mb-1 text-center text-xs text-slate-500 dark:text-slate-400">{t('countryInfo.weather.hourlyHint')}</p>
                )}
              </>
            ) : (
              <Alert type="warning" message={t('countryInfo.weather.unavailable')} />
            )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{t('countryInfo.weatherSource')}</p>
    </div>
  );
};
