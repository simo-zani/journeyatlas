import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  Compass,
  Earth,
  Globe2,
  Heart,
  Hotel,
  Loader2,
  Moon,
  Plane,
  Route,
  Ship,
  Sparkles,
  Sunrise,
  Timer,
  TrainFront,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { CountryFlag } from '@/components/CountryFlag';
import { ColumnChart } from '@/components/stats/ColumnChart';
import { DistanceGlobe } from '@/components/stats/DistanceGlobe';
import { useAuth } from '@/auth/AuthContext';
import { fetchAccommodationsForTrips, fetchAtlasMarks, fetchTopCompanion, type CompanionCount } from '@/lib/api';
import { buildAtlas, isTripStarted, WORLD_COUNTRY_COUNT } from '@/lib/atlas';
import { countryKind, type WorldGeo } from '@/lib/atlasGeo';
import { countryAt } from '@/lib/atlasHome';
import { loadAtlasTrips } from '@/lib/atlasLoad';
import {
  computeStats,
  EARTH_CIRCUMFERENCE_KM,
  EARTH_MOON_KM,
  LEG_MODES,
  type LegMode,
  type StatsPlace,
  type TravelStats,
} from '@/lib/stats';
import { useCountryName } from '@/lib/useCountryName';
import { useHomeCity } from '@/lib/useHomeCity';

const todayIso = () => {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Colori dei mezzi: slot fissi della palette categorica (validata, vedi categoryColors.ts). */
const MODE_COLORS: Record<LegMode, string> = {
  flight: 'var(--cat-color-0)',
  train: 'var(--cat-color-2)',
  ferry: 'var(--cat-color-7)',
  estimated: 'var(--cat-color-other)',
};
const MODE_ICONS: Record<LegMode, LucideIcon> = { flight: Plane, train: TrainFront, ferry: Ship, estimated: Route };

/** Riquadro icona dorato, come nelle card dell'atlante. */
const IconBox: React.FC<{ icon: LucideIcon }> = ({ icon: Icon }) => (
  <div className="w-[42px] h-[42px] rounded-xl border flex items-center justify-center shrink-0 bg-gold/15 border-gold/40 text-gold">
    <Icon className="w-5 h-5" strokeWidth={2.2} />
  </div>
);

/** Titolo di card come nei grafici delle spese, con l'icona davanti. */
const CardTitle: React.FC<{ icon: LucideIcon; title: string; subtitle?: string }> = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-5">
    <h3 className="font-poppins font-semibold text-base flex items-center gap-2">
      <Icon className="w-5 h-5 text-gold shrink-0" strokeWidth={2.2} />
      {title}
    </h3>
    {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

/** Riquadro interno grigio, come le righe dei viaggi nel pannello dell'atlante. */
const PANEL = 'rounded-2xl bg-slate-900/5 dark:bg-white/5 px-3.5 py-3';

/** Link al viaggio, tranne per i ricordi (non hanno il gestionale). */
const TripName: React.FC<{ id: string; name: string; isMemory: boolean }> = ({ id, name, isMemory }) =>
  isMemory ? (
    <span className="font-semibold">{name}</span>
  ) : (
    <Link to={`/trips/${id}`} className="font-semibold text-light-blue hover:underline">
      {name}
    </Link>
  );

export const StatsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const homeCity = useHomeCity();
  const countryName = useCountryName();
  const [geo, setGeo] = useState<WorldGeo | null>(null);
  const [stats, setStats] = useState<TravelStats | null>(null);
  const [visitedCodes, setVisitedCodes] = useState<string[]>([]);
  const [companion, setCompanion] = useState<CompanionCount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const homeKey = homeCity?.coords ? `${homeCity.coords.lat},${homeCity.coords.lon}` : '';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const today = todayIso();
    const load = async () => {
      try {
        const [loaded, marks] = await Promise.all([
          loadAtlasTrips(user.id, homeCity?.coords, today),
          fetchAtlasMarks().catch(() => []),
        ]);
        const startedIds = loaded.trips.filter((tr) => isTripStarted(tr, today)).map((tr) => tr.id);
        const accommodations = await fetchAccommodationsForTrips(startedIds).catch(() => []);
        const atlas = buildAtlas(loaded.inputs, today, new Set(marks.map((m) => m.country_code)));
        const home = homeCity?.coords ? { ...homeCity.coords, label: homeCity.city } : null;
        const computed = computeStats({
          inputs: loaded.inputs,
          rowsByTrip: loaded.rowsByTrip,
          places: loaded.places,
          atlas,
          accommodations,
          home,
          homeCode: home ? countryAt(loaded.world, home) : null,
          today,
        });
        if (cancelled) return;
        setGeo(loaded.world);
        setVisitedCodes([...atlas.countries.values()].filter((c) => c.status === 'visited').map((c) => c.code));
        setStats(computed);
        // Accessorio: senza compagni la card resta vuota.
        fetchTopCompanion(user.id, startedIds)
          .then((c) => !cancelled && setCompanion(c))
          .catch(() => undefined);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t('common.error'));
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, homeKey, t]);

  const lang = i18n.language;
  const num = (n: number, digits = 0) => n.toLocaleString(lang, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  const km = (n: number) => `${num(Math.round(n))} km`;
  const visitedSet = useMemo(() => new Set(visitedCodes), [visitedCodes]);
  const sovereignVisited = geo ? visitedCodes.filter((c) => countryKind(c, geo.index) === 'sovereign').length : 0;

  const utcLabel = (minutes: number) => {
    const sign = minutes < 0 ? '−' : '+';
    const abs = Math.abs(minutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
  };
  const monthYear = (iso: string) =>
    new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, 15)).toLocaleDateString(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const coordLabel = (p: StatsPlace, axis: 'lat' | 'lon') => {
    const v = p[axis];
    const dir = axis === 'lat' ? (v >= 0 ? 'N' : 'S') : v >= 0 ? 'E' : 'W';
    return `${num(Math.abs(v), 1)}° ${t(`stats.compass.dir.${dir}`)}`;
  };

  const header = (
    <div className="mb-8">
      <h1>{t('stats.title')}</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('stats.subtitle')}</p>
    </div>
  );

  if (error) {
    return (
      <div className="relative w-full max-w-[1680px] mx-auto">
        {header}
        <Alert type="error" message={error} onClose={() => setError(null)} />
      </div>
    );
  }

  if (!stats || !geo) {
    return (
      <div className="relative w-full max-w-[1680px] mx-auto">
        {header}
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
        </div>
      </div>
    );
  }

  if (stats.trips === 0) {
    return (
      <div className="relative w-full max-w-[1680px] mx-auto">
        {header}
        <Card className="card-static">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-title">{t('stats.empty.title')}</p>
            <p className="empty-state-message">{t('stats.empty.body')}</p>
          </div>
        </Card>
      </div>
    );
  }

  const laps = stats.totalKm / EARTH_CIRCUMFERENCE_KM;
  const moonShare = stats.totalKm / EARTH_MOON_KM;
  const daysHint =
    stats.days >= 365
      ? t('stats.tiles.daysYears', { value: num(stats.days / 365, 1) })
      : stats.days >= 60
        ? t('stats.tiles.daysMonths', { value: num(stats.days / 30.44, 1) })
        : t('stats.tiles.daysWeeks', { value: num(stats.days / 7, 1) });

  const tiles: { key: string; icon: LucideIcon; label: string; value: string; suffix?: string; hint: string }[] = [
    {
      key: 'km',
      icon: Route,
      label: t('stats.tiles.km'),
      value: num(Math.round(stats.totalKm)),
      suffix: 'km',
      hint: t('stats.tiles.kmHint', { value: num(laps, 1) }),
    },
    { key: 'days', icon: CalendarDays, label: t('stats.tiles.days'), value: num(stats.days), hint: daysHint },
    {
      key: 'countries',
      icon: Earth,
      label: t('stats.tiles.countries'),
      value: `${sovereignVisited}`,
      suffix: `/ ${WORLD_COUNTRY_COUNT}`,
      hint: t('atlas.tiles.worldPercent', {
        percent: (Math.round((sovereignVisited / WORLD_COUNTRY_COUNT) * 1000) / 10).toLocaleString(lang),
      }),
    },
    {
      key: 'trips',
      icon: Plane,
      label: t('stats.tiles.trips'),
      value: num(stats.trips),
      hint: t('stats.tiles.cities', { count: stats.cities }),
    },
  ];

  const modeTotal = LEG_MODES.reduce((s, m) => s + stats.kmByMode[m], 0);
  const modes = LEG_MODES.filter((m) => stats.kmByMode[m] > 0);

  const yearData = stats.tripsByYear.map((y) => ({
    key: String(y.year),
    label: String(y.year),
    value: y.count,
    tooltip: `${y.year}: ${t('stats.trips', { count: y.count })}`,
  }));
  const monthFormatter = new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' });
  const monthLongFormatter = new Intl.DateTimeFormat(lang, { month: 'long', timeZone: 'UTC' });
  const monthData = stats.tripsByMonth.map((count, i) => {
    const d = new Date(Date.UTC(2000, i, 15));
    return { key: String(i), label: monthFormatter.format(d), value: count, tooltip: `${monthLongFormatter.format(d)}: ${t('stats.trips', { count })}` };
  });
  const bestMonth = stats.tripsByMonth.indexOf(Math.max(...stats.tripsByMonth));
  const bestYear = stats.tripsByYear.reduce((m, y) => (y.count > m.count ? y : m), stats.tripsByYear[0]);

  const flightHours = stats.flightMinutes / 60;

  const curiosities: { key: string; icon: LucideIcon; label: string; content: React.ReactNode; hint?: React.ReactNode }[] = [];
  if (stats.utcRange && stats.utcRange.max > stats.utcRange.min) {
    curiosities.push({
      key: 'tz',
      icon: Clock,
      label: t('stats.curiosities.timezones'),
      content: `${utcLabel(stats.utcRange.min)} → ${utcLabel(stats.utcRange.max)}`,
      hint: t('stats.curiosities.timezonesHint', { value: num((stats.utcRange.max - stats.utcRange.min) / 60, 1).replace(/[.,]0$/, '') }),
    });
  }
  const hemis = (['north', 'south', 'east', 'west'] as const).filter((h) => stats.hemispheres[h]);
  curiosities.push({
    key: 'hemispheres',
    icon: Globe2,
    label: t('stats.curiosities.hemispheres'),
    content: (
      <span className="flex flex-wrap gap-1.5">
        {(['north', 'south', 'east', 'west'] as const).map((h) => (
          <span
            key={h}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              stats.hemispheres[h] ? 'bg-gold text-slate-950' : 'bg-slate-900/5 dark:bg-white/10 text-slate-400 line-through'
            }`}
          >
            {t(`stats.curiosities.hemisphere.${h}`)}
          </span>
        ))}
      </span>
    ),
    hint: hemis.length === 4 ? t('stats.curiosities.allHemispheres') : t('stats.curiosities.hemispheresHint', { count: hemis.length }),
  });
  if (companion) {
    curiosities.push({
      key: 'companion',
      icon: Users,
      label: t('stats.curiosities.companion'),
      content: (
        <span className="flex items-center gap-2 min-w-0">
          {companion.avatarUrl ? (
            <img src={companion.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <span className="w-7 h-7 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">
              {companion.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="truncate">{companion.name}</span>
        </span>
      ),
      hint: t('stats.curiosities.companionHint', { count: companion.trips }),
    });
  }
  if (stats.longestTrip) {
    curiosities.push({
      key: 'longest',
      icon: Timer,
      label: t('stats.curiosities.longestTrip'),
      content: <TripName id={stats.longestTrip.id} name={stats.longestTrip.name} isMemory={stats.longestTrip.isMemory} />,
      hint: t('stats.days', { count: stats.longestTrip.days }),
    });
  }
  if (stats.shortestTrip && stats.shortestTrip.id !== stats.longestTrip?.id) {
    curiosities.push({
      key: 'shortest',
      icon: Sunrise,
      label: t('stats.curiosities.shortestTrip'),
      content: <TripName id={stats.shortestTrip.id} name={stats.shortestTrip.name} isMemory={stats.shortestTrip.isMemory} />,
      hint: t('stats.days', { count: stats.shortestTrip.days }),
    });
  }
  if (stats.mostVisited && stats.mostVisited.trips > 1) {
    curiosities.push({
      key: 'mostVisited',
      icon: Heart,
      label: t('stats.curiosities.mostVisited'),
      content: (
        <span className="flex items-center gap-2 min-w-0">
          <CountryFlag code={stats.mostVisited.code} size="sm" />
          <span className="truncate">{countryName(stats.mostVisited.code)}</span>
        </span>
      ),
      hint: t('stats.trips', { count: stats.mostVisited.trips }),
    });
  }
  if (stats.firstCountry) {
    curiosities.push({
      key: 'first',
      icon: Sparkles,
      label: t('stats.curiosities.firstCountry'),
      content: (
        <span className="flex items-center gap-2 min-w-0">
          <CountryFlag code={stats.firstCountry.code} size="sm" />
          <span className="truncate">{countryName(stats.firstCountry.code)}</span>
        </span>
      ),
      hint: monthYear(stats.firstCountry.date),
    });
  }
  if (stats.latestCountry) {
    curiosities.push({
      key: 'latest',
      icon: Sparkles,
      label: t('stats.curiosities.latestCountry'),
      content: (
        <span className="flex items-center gap-2 min-w-0">
          <CountryFlag code={stats.latestCountry.code} size="sm" />
          <span className="truncate">{countryName(stats.latestCountry.code)}</span>
        </span>
      ),
      hint: monthYear(stats.latestCountry.date),
    });
  }
  if (stats.nights.hotel + stats.nights.apartment > 0) {
    curiosities.push({
      key: 'nights',
      icon: Hotel,
      label: t('stats.curiosities.nights'),
      content: t('stats.nights', { count: stats.nights.hotel + stats.nights.apartment }),
      hint: t('stats.curiosities.nightsHint', { hotel: stats.nights.hotel, apartment: stats.nights.apartment }),
    });
  }
  curiosities.push({
    key: 'cities',
    icon: Building2,
    label: t('stats.curiosities.cities'),
    content: num(stats.cities),
    hint: stats.equatorCrossings > 0 ? t('stats.curiosities.equator', { count: stats.equatorCrossings }) : undefined,
  });

  const extremes = stats.extremes;

  return (
    <div className="relative w-full max-w-[1680px] mx-auto transition-all duration-300">
      {header}

      <div className="space-y-6">
        {/* Numeri principali */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {tiles.map(({ key, icon, label, value, suffix, hint }) => (
            <Card key={key} className="card-static !px-6 !py-5">
              <div className="flex items-center gap-3">
                <IconBox icon={icon} />
                <div className="min-w-0">
                  <p className="text-xs truncate text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="font-poppins font-bold text-lg sm:text-xl tabular-nums">
                    {value}
                    {suffix && <span className="ml-1 text-sm font-semibold text-slate-400">{suffix}</span>}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs truncate text-slate-500 dark:text-slate-400" title={hint}>
                {hint}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Il posto più lontano da casa */}
          <Card className="card-static lg:col-span-2">
            <CardTitle icon={Earth} title={t('stats.farthest.title')} subtitle={t('stats.farthest.subtitle')} />
            {stats.farthest && homeCity?.coords ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-3">
                    <CountryFlag code={stats.farthest.code} size="lg" label={countryName(stats.farthest.code)} />
                    <div className="min-w-0">
                      <p className="font-poppins font-bold text-2xl leading-tight truncate">{stats.farthest.label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{countryName(stats.farthest.code)}</p>
                    </div>
                  </div>
                  <p className="font-poppins font-bold text-3xl sm:text-4xl tabular-nums mt-5">
                    {num(Math.round(stats.farthest.km))}
                    <span className="ml-1.5 text-base font-semibold text-slate-400">km</span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('stats.farthest.fromHome', { city: homeCity.city })}
                  </p>
                  <div className="mt-[16px] flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[var(--atlas-home)]" />
                      {homeCity.city}
                    </span>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[var(--atlas-selected-stroke)]" />
                      {stats.farthest.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    {t('stats.farthest.trip')}{' '}
                    <TripName id={stats.farthest.tripId} name={stats.farthest.tripName} isMemory={stats.farthest.tripIsMemory} />
                    {' · '}
                    {t('stats.farthest.earthShare', { percent: num((stats.farthest.km / (EARTH_CIRCUMFERENCE_KM / 2)) * 100) })}
                  </p>
                </div>
                <DistanceGlobe
                  features={geo.features}
                  from={homeCity.coords}
                  to={stats.farthest}
                  visited={visitedSet}
                  className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] shrink-0"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.farthest.noHome')}</p>
            )}
          </Card>

          {/* Fino alla Luna */}
          <Card className="card-static">
            <CardTitle icon={Moon} title={t('stats.moon.title')} subtitle={t('stats.moon.subtitle')} />
            <p className="font-poppins font-bold text-3xl sm:text-4xl tabular-nums">
              {moonShare >= 1 ? `${num(moonShare, 1)}×` : `${num(moonShare * 100, moonShare < 0.1 ? 1 : 0)}%`}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {moonShare >= 1 ? t('stats.moon.reached', { value: num(moonShare, 1) }) : t('stats.moon.progress')}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Earth className="w-5 h-5 text-[var(--cat-color-0)] shrink-0" />
              <div className="flex-1 h-3 rounded-full bg-slate-900/5 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-1000"
                  style={{ width: `${Math.max(Math.min(moonShare, 1) * 100, moonShare > 0 ? 1.5 : 0)}%` }}
                />
              </div>
              <Moon className="w-5 h-5 text-slate-400 shrink-0" />
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">{t('stats.moon.laps')}</span>
                <span className="font-bold tabular-nums">{num(laps, 2)}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">{t('stats.moon.missing')}</span>
                <span className="font-bold tabular-nums">
                  {moonShare >= 1 ? '—' : km(EARTH_MOON_KM - stats.totalKm)}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">{t('stats.moon.perTrip')}</span>
                <span className="font-bold tabular-nums">{km(stats.totalKm / stats.trips)}</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bussola: i quattro punti estremi */}
          <Card className="card-static">
            <CardTitle icon={Compass} title={t('stats.compass.title')} subtitle={t('stats.compass.subtitle')} />
            {extremes ? (
              <div className="grid grid-cols-3 grid-rows-3 gap-3 items-center">
                {(
                  [
                    ['north', 'col-start-2 row-start-1', 'lat'],
                    ['west', 'col-start-1 row-start-2', 'lon'],
                    ['east', 'col-start-3 row-start-2', 'lon'],
                    ['south', 'col-start-2 row-start-3', 'lat'],
                  ] as const
                ).map(([dir, pos, axis]) => {
                  const p = extremes[dir];
                  return (
                    <div key={dir} className={`${pos} ${PANEL} flex flex-col items-center text-center min-w-0`}>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(`stats.compass.${dir}`)}</span>
                      <span className="flex items-center gap-1.5 mt-1 min-w-0 max-w-full">
                        <CountryFlag code={p.code} size="xs" label={countryName(p.code)} />
                        <span className="font-semibold text-sm truncate">{p.label}</span>
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{coordLabel(p, axis)}</span>
                    </div>
                  );
                })}
                <div className="col-start-2 row-start-2 flex items-center justify-center">
                  <div className="w-[56px] h-[56px] rounded-full border bg-gold/15 border-gold/40 text-gold flex items-center justify-center">
                    <Compass className="w-7 h-7" strokeWidth={2.2} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.compass.empty')}</p>
            )}
          </Card>

          {/* Km per mezzo */}
          <Card className="card-static">
            <CardTitle icon={Route} title={t('stats.modes.title')} subtitle={t('stats.modes.subtitle')} />
            {modeTotal > 0 ? (
              <>
                <div className="flex h-3 w-full rounded-full overflow-hidden gap-[2px]" role="img" aria-label={t('stats.modes.title')}>
                  {modes.map((m) => (
                    <div
                      key={m}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${(stats.kmByMode[m] / modeTotal) * 100}%`, background: MODE_COLORS[m] }}
                      title={`${t(`stats.modes.${m}`)}: ${km(stats.kmByMode[m])}`}
                    />
                  ))}
                </div>
                <ul className="mt-[16px] space-y-2">
                  {modes.map((m) => {
                    const Icon = MODE_ICONS[m];
                    return (
                      <li key={m} className="flex items-center gap-2.5 text-sm">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: MODE_COLORS[m] }} aria-hidden="true" />
                        <Icon className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="flex-1 min-w-0 truncate">{t(`stats.modes.${m}`)}</span>
                        <span className="font-bold tabular-nums">{km(stats.kmByMode[m])}</span>
                        <span className="w-[44px] text-right text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {num((stats.kmByMode[m] / modeTotal) * 100)}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {stats.longestFlight && (
                    <div className={`${PANEL} min-w-0`}>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('stats.modes.longestFlight')}</p>
                      <p className="font-bold truncate">
                        {stats.longestFlight.from.label} → {stats.longestFlight.to.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{km(stats.longestFlight.km)}</p>
                    </div>
                  )}
                  {stats.flights > 0 && (
                    <div className={`${PANEL} min-w-0`}>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('stats.modes.flightTime')}</p>
                      <p className="font-bold tabular-nums">
                        {stats.flightMinutesEstimated ? '≈ ' : ''}
                        {t('stats.hours', { count: Math.round(flightHours), value: num(Math.round(flightHours)) })}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('stats.modes.flights', { count: stats.flights })}</p>
                    </div>
                  )}
                  {stats.topRoute && (
                    <div className={`${PANEL} min-w-0`}>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('stats.modes.topRoute')}</p>
                      <p className="font-bold truncate">
                        {stats.topRoute.a.label} ⇄ {stats.topRoute.b.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('stats.modes.times', { count: stats.topRoute.count })}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.modes.empty')}</p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-static">
            <CardTitle
              icon={CalendarDays}
              title={t('stats.byYear.title')}
              subtitle={bestYear && bestYear.count > 0 ? t('stats.byYear.best', { year: bestYear.year, count: bestYear.count }) : undefined}
            />
            <ColumnChart data={yearData} ariaLabel={t('stats.byYear.title')} labelEvery={yearData.length > 12 ? Math.ceil(yearData.length / 8) : 1} />
          </Card>
          <Card className="card-static">
            <CardTitle
              icon={Sunrise}
              title={t('stats.byMonth.title')}
              subtitle={t('stats.byMonth.best', { month: monthLongFormatter.format(new Date(Date.UTC(2000, bestMonth, 15))) })}
            />
            <ColumnChart data={monthData} ariaLabel={t('stats.byMonth.title')} />
          </Card>
        </div>

        {/* Curiosità */}
        <div>
          <h2 className="font-poppins font-semibold text-xl mb-5">{t('stats.curiosities.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {curiosities.map(({ key, icon, label, content, hint }) => (
              <Card key={key} className="card-static !px-6 !py-5">
                <div className="flex items-center gap-3">
                  <IconBox icon={icon} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate text-slate-500 dark:text-slate-400">{label}</p>
                    <div className="font-poppins font-bold text-base sm:text-lg min-w-0 truncate">{content}</div>
                  </div>
                </div>
                {hint && <p className="mt-2 text-xs truncate text-slate-500 dark:text-slate-400">{hint}</p>}
              </Card>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 pb-[16px]">{t('stats.footnote')}</p>
      </div>
    </div>
  );
};
