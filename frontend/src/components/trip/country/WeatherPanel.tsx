import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Loader2,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { Alert } from '@/components/Alert';
import { CountryFlag } from '@/components/CountryFlag';
import { fetchForecast, type DayForecast } from '@/lib/weather';
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

type Result = { place: Place; days: DayForecast[] | null };

export const WeatherPanel: React.FC<{ destinations: Destination[] }> = ({ destinations }) => {
  const { t, i18n } = useTranslation();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

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
    Promise.all(
      places.map(async (place) => {
        try {
          return { place, days: await fetchForecast(place.lat, place.lon) };
        } catch {
          return { place, days: null };
        }
      })
    ).then((r) => {
      if (cancelled) return;
      setResults(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [places]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-16 h-16 text-gold animate-spin" />
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
    new Date(`${date}T00:00:00`).toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      {skipped > 0 && <Alert type="info" message={t('countryInfo.weather.skipped', { count: skipped })} />}
      {results.map(({ place, days }) => (
        <section key={place.key} className="card card-static">
          <div className="flex items-center gap-3 mb-5">
            {place.countryCode && <CountryFlag code={place.countryCode} size="lg" />}
            <h3 className="font-poppins font-semibold text-lg truncate">{place.city}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('countryInfo.weather.next7')}</span>
          </div>
          {days ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {days.map((day) => {
                const { Icon, tone } = weatherVisual(day.code);
                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-slate-900/5 dark:bg-white/5 px-2 py-4"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {weekday(day.date)}
                    </span>
                    <Icon className={`w-12 h-12 ${tone}`} strokeWidth={1.75} />
                    <div className="text-center leading-tight">
                      <span className="text-lg font-bold">{Math.round(day.tMax)}°</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400"> / {Math.round(day.tMin)}°</span>
                    </div>
                    {day.rainChance !== null && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-sky-500">
                        <Droplets className="w-4 h-4" />
                        {day.rainChance}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Alert type="warning" message={t('countryInfo.weather.unavailable')} />
          )}
        </section>
      ))}
    </div>
  );
};
