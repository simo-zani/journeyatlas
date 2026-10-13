import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Check, Compass, Earth, Globe2, Loader2, Map as MapIcon, Plane } from 'lucide-react';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { CountryFlag } from '@/components/CountryFlag';
import { WorldMap, type MapView } from '@/components/atlas/WorldMap';
import { RegionMap, type RegionState } from '@/components/atlas/RegionMap';
import { useAuth } from '@/auth/AuthContext';
import { fetchAtlasMarks, fetchCountryContinents, fetchMyTrips, fetchTransportsForTrips, setAtlasMark } from '@/lib/api';
import {
  buildAtlas,
  isTripStarted,
  WORLD_COUNTRY_COUNT,
  type AtlasCountry,
  type AtlasTripInput,
  type CountryStatus,
} from '@/lib/atlas';
import {
  BREAKAWAY_PARENT,
  countryKind,
  limitedEntityAt,
  loadRegionIndex,
  loadRegions,
  loadWorldGeo,
  regionAt,
  type CountryKind,
  type GeoFeature,
  type RegionIndexEntry,
  type WorldGeo,
} from '@/lib/atlasGeo';
import { resolveCountryFlags } from '@/lib/flags';
import { loadTransportPlaces, transitPlacesFromRows } from '@/lib/tripCountries';
import { useHomeCity } from '@/lib/useHomeCity';
import { useNationality } from '@/lib/useNationality';
import type { AtlasMarkRow, TransportRow } from '@/lib/types';

const CONTINENTS = ['europe', 'asia', 'africa', 'north-america', 'south-america', 'oceania', 'antarctica'] as const;
const LIST_ORDER: CountryStatus[] = ['visited', 'transit', 'planned'];
const STATUS_RANK: Record<CountryStatus, number> = { visited: 3, transit: 2, planned: 1 };

const todayIso = () => {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Campione di colore della legenda, con lo stesso trattamento della mappa (tratteggio per gli scali). */
const Swatch: React.FC<{ status: CountryStatus | 'home' }> = ({ status }) => (
  <span
    className="w-3.5 h-3.5 rounded-[4px] shrink-0 ring-1 ring-black/5"
    style={
      status === 'transit'
        ? { background: 'repeating-linear-gradient(45deg, var(--atlas-visited) 0 2px, var(--atlas-land) 2px 4px)' }
        : { backgroundColor: `var(--atlas-${status})` }
    }
    aria-hidden="true"
  />
);

/** Piccola etichetta per territori e stati a riconoscimento limitato. */
const KindTag: React.FC<{ kind: CountryKind }> = ({ kind }) => {
  const { t } = useTranslation();
  if (kind === 'sovereign') return null;
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-900/5 dark:bg-white/10 text-slate-500 dark:text-slate-400 shrink-0">
      {t(`atlas.kind.${kind}`)}
    </span>
  );
};

export const AtlasPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const nationality = useNationality();
  const homeCity = useHomeCity();
  const [geo, setGeo] = useState<WorldGeo | null>(null);
  const [inputs, setInputs] = useState<AtlasTripInput[] | null>(null);
  const [marks, setMarks] = useState<AtlasMarkRow[]>([]);
  const [regionIndex, setRegionIndex] = useState<Record<string, RegionIndexEntry>>({});
  const [continents, setContinents] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<MapView>('globe');
  const [selected, setSelected] = useState<string | null>(null);
  const [regions, setRegions] = useState<{ code: string; features: GeoFeature[] } | null>(null);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const homeKey = homeCity?.coords ? `${homeCity.coords.lat},${homeCity.coords.lon}` : '';
  const today = todayIso();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [world, trips] = await Promise.all([loadWorldGeo(), fetchMyTrips(user.id)]);
        // Codice di un luogo: quello salvato (o ricavato dal nome), sostituito dall'entità
        // a riconoscimento limitato se le coordinate cadono lì dentro.
        const placeCode = (code: string, coords: { lat: number; lon: number } | null) =>
          (coords && limitedEntityAt(world, coords.lat, coords.lon)) || code.toUpperCase();

        const startedIds = trips.filter((tr) => isTripStarted(tr, today)).map((tr) => tr.id);
        let rowsByTrip = new Map<string, TransportRow[]>();
        let places: Awaited<ReturnType<typeof loadTransportPlaces>> | null = null;
        try {
          const [rows, p] = await Promise.all([fetchTransportsForTrips(startedIds), loadTransportPlaces()]);
          places = p;
          rowsByTrip = rows.reduce((m, r) => m.set(r.trip_id, [...(m.get(r.trip_id) ?? []), r]), new Map<string, TransportRow[]>());
        } catch {
          // senza anagrafiche dei mezzi la mappa mostra solo le mete
        }

        const built: AtlasTripInput[] = await Promise.all(
          trips.map(async (trip) => {
            const destinations = (
              await Promise.all(
                (trip.destinations ?? []).map(async (d) => {
                  const code = d.countryCode || (await resolveCountryFlags([d]))[0] || '';
                  return code ? { code: placeCode(code, d.coords ?? null), city: d.city, coords: d.coords ?? null } : null;
                })
              )
            ).filter((d): d is NonNullable<typeof d> => d !== null);
            const transit =
              places && rowsByTrip.has(trip.id)
                ? transitPlacesFromRows(
                    rowsByTrip.get(trip.id) ?? [],
                    destinations.map((d) => d.code),
                    homeCity?.coords,
                    places
                  ).map((p) => ({ code: placeCode(p.code, p), coords: { lat: p.lat, lon: p.lon } }))
                : [];
            return { trip, destinations, transit };
          })
        );
        if (cancelled) return;
        setGeo(world);
        setInputs(built);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t('common.error'));
      }
    };
    void load();
    // Dati accessori: se mancano, l'atlante funziona lo stesso.
    fetchAtlasMarks()
      .then((m) => !cancelled && setMarks(m))
      .catch(() => undefined);
    loadRegionIndex().then((idx) => !cancelled && setRegionIndex(idx));
    fetchCountryContinents()
      .then((m) => !cancelled && setContinents(m))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, homeKey, t]);

  const atlas = useMemo(
    () => (inputs ? buildAtlas(inputs, today, new Set(marks.map((m) => m.country_code))) : null),
    [inputs, marks, today]
  );

  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([i18n.language], { type: 'region' });
    } catch {
      return null;
    }
  }, [i18n.language]);
  const countryName = useCallback(
    (code: string) => (code.startsWith('X-') ? t(`atlas.entity.${code}`) : (regionNames?.of(code) ?? code)),
    [regionNames, t]
  );
  const kindOf = useCallback((code: string): CountryKind => (geo ? countryKind(code, geo.index) : 'sovereign'), [geo]);
  const continentOf = (code: string) => continents.get(BREAKAWAY_PARENT[code] ?? code);

  const grouped = useMemo(() => {
    const groups: Record<CountryStatus, AtlasCountry[]> = { visited: [], transit: [], planned: [] };
    atlas?.countries.forEach((c) => groups[c.status].push(c));
    LIST_ORDER.forEach((s) => groups[s].sort((a, b) => countryName(a.code).localeCompare(countryName(b.code))));
    return groups;
  }, [atlas, countryName]);

  const visitedByKind = useMemo(() => {
    const counts: Record<CountryKind, number> = { sovereign: 0, limited: 0, territory: 0 };
    grouped.visited.forEach((c) => counts[kindOf(c.code)]++);
    return counts;
  }, [grouped, kindOf]);

  const visitedContinents = useMemo(
    () => new Set(grouped.visited.map((c) => continentOf(c.code)).filter((c): c is string => !!c)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grouped, continents]
  );

  // ---------------------------------------------------------------- regioni
  const selectedCca3 = selected && geo ? geo.index.find((c) => c.code === selected)?.cca3 ?? null : null;
  const hasRegions = !!selectedCca3 && !!regionIndex[selectedCca3];

  useEffect(() => {
    if (!selected || !selectedCca3 || !hasRegions) return;
    if (regions?.code === selected) return;
    let cancelled = false;
    setRegionsLoading(true);
    loadRegions(selectedCca3)
      .then((features) => !cancelled && setRegions({ code: selected, features }))
      .catch(() => !cancelled && setRegions(null))
      .finally(() => !cancelled && setRegionsLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, selectedCca3, hasRegions]);

  const showRegions = hasRegions && regions?.code === selected;

  const regionStates = useMemo(() => {
    const states = new Map<string, RegionState>();
    if (!atlas || !regions || regions.code !== selected) return states;
    for (const p of atlas.points) {
      if (p.code !== selected) continue;
      const name = regionAt(regions.features, p.lat, p.lon);
      if (!name) continue;
      const prev = states.get(name);
      if (!prev || STATUS_RANK[p.status] > STATUS_RANK[prev.status]) states.set(name, { status: p.status, manual: false });
    }
    for (const m of marks) {
      if (m.country_code !== selected || !m.region_key) continue;
      const prev = states.get(m.region_key);
      if (!prev || prev.status !== 'visited') states.set(m.region_key, { status: 'visited', manual: true });
    }
    return states;
  }, [atlas, regions, selected, marks]);

  const regionNamesSorted = useMemo(
    () =>
      regions && regions.code === selected
        ? regions.features.map((f) => f.code ?? '').filter(Boolean).sort((a, b) => a.localeCompare(b, i18n.language))
        : [],
    [regions, selected, i18n.language]
  );
  const visitedRegions = regionNamesSorted.filter((n) => regionStates.get(n)?.status === 'visited').length;

  const toggleMark = async (countryCode: string, regionKey: string) => {
    const has = marks.some((m) => m.country_code === countryCode && m.region_key === regionKey);
    const prev = marks;
    setMarks(
      has
        ? marks.filter((m) => !(m.country_code === countryCode && m.region_key === regionKey))
        : [...marks, { user_id: user?.id ?? '', country_code: countryCode, region_key: regionKey, created_at: new Date().toISOString() }]
    );
    try {
      await setAtlasMark(countryCode, regionKey, !has);
    } catch (err) {
      setMarks(prev);
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  // --------------------------------------------------------------- vista
  const visitedCities = atlas?.cities.filter((c) => c.visited).length ?? 0;
  const worldPercent = Math.round((visitedByKind.sovereign / WORLD_COUNTRY_COUNT) * 1000) / 10;
  const selectedCountry = selected ? atlas?.countries.get(selected) ?? null : null;
  const countryMarked = !!selected && marks.some((m) => m.country_code === selected && m.region_key === '');
  // Il segno a mano sul paese serve solo se i viaggi non lo sbloccano già.
  const canMarkCountry = !!selected && !selectedCountry?.trips.some((tr) => tr.started && tr.asDestination);

  const formatRange = (start: string | null, end: string | null) => {
    const fmt = (d: string) =>
      new Date(`${d}T00:00:00`).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' });
    if (!start) return t('atlas.noDates');
    return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
  };

  const extras = [
    visitedByKind.territory > 0 && t('atlas.tiles.territories', { count: visitedByKind.territory }),
    visitedByKind.limited > 0 && t('atlas.tiles.limited', { count: visitedByKind.limited }),
  ].filter(Boolean);

  const tiles = [
    {
      key: 'countries',
      icon: Earth,
      label: t('atlas.tiles.countries'),
      value: `${visitedByKind.sovereign}`,
      suffix: `/ ${WORLD_COUNTRY_COUNT}`,
      hint: [t('atlas.tiles.worldPercent', { percent: worldPercent.toLocaleString(i18n.language) }), ...extras].join(' · '),
      progress: visitedByKind.sovereign / WORLD_COUNTRY_COUNT,
    },
    {
      key: 'continents',
      icon: Compass,
      label: t('atlas.tiles.continents'),
      value: `${visitedContinents.size}`,
      suffix: `/ ${CONTINENTS.length}`,
      hint:
        CONTINENTS.filter((c) => visitedContinents.has(c))
          .map((c) => t(`atlas.continent.${c}`))
          .join(', ') || t('atlas.tiles.noContinents'),
    },
    {
      key: 'trips',
      icon: Plane,
      label: t('atlas.tiles.trips'),
      value: `${atlas?.startedTrips ?? 0}`,
      hint: t('atlas.tiles.planned', { count: atlas?.plannedTrips ?? 0 }),
    },
    {
      key: 'cities',
      icon: Building2,
      label: t('atlas.tiles.cities'),
      value: `${visitedCities}`,
      hint: t('atlas.tiles.transit', { count: grouped.transit.length }),
    },
  ];

  const legend = (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
      {(showRegions ? (['visited', 'transit', 'planned'] as const) : (['visited', 'transit', 'planned', 'home'] as const)).map((s) => (
        <li key={s} className="inline-flex items-center gap-1.5">
          <Swatch status={s} />
          {t(`atlas.status.${s}`)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative w-full max-w-[1680px] mx-auto transition-all duration-300">
      <div className="mb-8">
        <h1>{t('atlas.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('atlas.subtitle')}</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {!atlas || !geo ? (
        !error && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-gold animate-spin" />
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiles.map(({ key, icon: Icon, label, value, suffix, hint, progress }) => (
              <Card key={key} compact className="card-static">
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</p>
                    <p className="font-poppins font-bold text-lg sm:text-xl tabular-nums">
                      {value}
                      {suffix && <span className="ml-1 text-sm font-semibold text-slate-400">{suffix}</span>}
                    </p>
                  </div>
                </div>
                {progress !== undefined && (
                  <div className="mt-2.5 h-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold transition-[width] duration-700"
                      style={{ width: `${Math.max(progress * 100, progress > 0 ? 1.5 : 0)}%` }}
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate" title={hint}>
                  {hint}
                </p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <Card noPadding className="card-static xl:col-span-2">
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                {showRegions && selected ? (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:text-gold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <CountryFlag code={selected} size="sm" />
                    {t('atlas.regions.title', { country: countryName(selected) })}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-900/80 dark:bg-slate-900/85 border border-slate-700/60 dark:border-white/10 p-1 rounded-full shadow-md">
                    {(
                      [
                        ['globe', Globe2, t('atlas.view.globe')],
                        ['flat', MapIcon, t('atlas.view.flat')],
                      ] as const
                    ).map(([mode, Icon, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setView(mode)}
                        aria-pressed={view === mode}
                        className={`relative flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                          view === mode ? 'text-slate-950' : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
                        }`}
                      >
                        {view === mode && (
                          <motion.span
                            layoutId="atlas-view-active"
                            className="absolute inset-0 rounded-full bg-gold shadow-sm"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <Icon className="w-5 h-5 relative shrink-0" />
                        <span className="relative">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {legend}
              </div>
              <div className="p-2 sm:p-4">
                {/* Il mondo resta montato (nascosto) mentre si guardano le regioni: al ritorno
                    globo e zoom sono dove li si era lasciati. */}
                <div className={showRegions ? 'hidden' : ''}>
                  <WorldMap
                    geo={geo}
                    view={view}
                    countries={atlas.countries}
                    cities={atlas.cities}
                    homeCode={nationality}
                    selected={selected}
                    onSelect={setSelected}
                    countryName={countryName}
                  />
                </div>
                {showRegions && selected && regions && (
                  <RegionMap
                    countryCode={selected}
                    regions={regions.features}
                    states={regionStates}
                    cities={atlas.cities}
                    onToggle={(name) => void toggleMark(selected, name)}
                  />
                )}
                {regionsLoading && !showRegions && (
                  <p className="mt-2 text-center text-xs text-slate-400 inline-flex w-full justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-gold" />
                    {t('atlas.regions.loading')}
                  </p>
                )}
                <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
                  {showRegions ? t('atlas.regions.hint') : view === 'globe' ? t('atlas.hintGlobe') : t('atlas.hintFlat')}
                </p>
              </div>
            </Card>

            <Card className="card-static">
              {selected ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-light-blue hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    {t('atlas.allCountries')}
                  </button>
                  <div className="flex items-center gap-3">
                    <CountryFlag code={selected} size="lg" />
                    <div className="min-w-0">
                      <h3 className="font-poppins font-semibold text-lg flex items-center gap-2 min-w-0">
                        <span className="truncate">{countryName(selected)}</span>
                        <KindTag kind={kindOf(selected)} />
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                        {selectedCountry ? (
                          <>
                            <Swatch status={selectedCountry.status} />
                            {t(`atlas.status.${selectedCountry.status}`)}
                            {selectedCountry.manual && ` (${t('atlas.regions.manual')})`}
                          </>
                        ) : selected === nationality ? (
                          <>
                            <Swatch status="home" />
                            {t('atlas.status.home')}
                          </>
                        ) : (
                          t('atlas.notVisited')
                        )}
                        {continentOf(selected) && <span>· {t(`atlas.continent.${continentOf(selected)}`)}</span>}
                      </p>
                    </div>
                  </div>

                  {canMarkCountry && (
                    <button
                      type="button"
                      onClick={() => void toggleMark(selected, '')}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                        countryMarked
                          ? 'bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15'
                          : 'bg-gold/15 text-gold-dark dark:text-gold-light ring-1 ring-gold/40 hover:bg-gold/25'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                      {countryMarked ? t('atlas.unmarkCountry') : t('atlas.markCountry')}
                    </button>
                  )}

                  {selectedCountry && selectedCountry.trips.length > 0 && (
                    <ul className="space-y-2">
                      {selectedCountry.trips.map((trip) => (
                        <li key={trip.id}>
                          <Link
                            to={`/trips/${trip.id}`}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 px-3.5 py-2.5 no-underline hover:no-underline transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{trip.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{formatRange(trip.start_date, trip.end_date)}</p>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-500 dark:text-slate-300 shrink-0">
                              {!trip.asDestination ? t('atlas.tripStopover') : trip.started ? t('atlas.tripDone') : t('atlas.tripPlanned')}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!selectedCountry?.trips.length && <p className="text-sm text-slate-500 dark:text-slate-400">{t('atlas.noTripsHere')}</p>}

                  {/* Regioni: conteggio ed elenco, con la casella per segnarle a mano */}
                  {showRegions && (
                    <section className="pt-1">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-poppins font-semibold text-sm">{t('atlas.regions.listTitle')}</h4>
                        <span className="text-sm font-bold tabular-nums">
                          {visitedRegions}
                          <span className="text-slate-400 font-semibold"> / {regionNamesSorted.length}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 overflow-hidden mb-3">
                        <div
                          className="h-full rounded-full bg-gold transition-[width] duration-500"
                          style={{ width: `${regionNamesSorted.length ? (visitedRegions / regionNamesSorted.length) * 100 : 0}%` }}
                        />
                      </div>
                      <ul className="max-h-80 overflow-y-auto space-y-0.5 pr-1">
                        {regionNamesSorted.map((name) => {
                          const state = regionStates.get(name);
                          const auto = !!state && !state.manual && state.status === 'visited';
                          const checked = state?.status === 'visited';
                          return (
                            <li key={name}>
                              <button
                                type="button"
                                disabled={auto}
                                onClick={() => void toggleMark(selected, name)}
                                title={auto ? t('atlas.regions.fromTrips') : undefined}
                                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-sm hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:cursor-default"
                              >
                                <span
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                                    checked ? 'bg-gold border-gold text-slate-950' : 'border-slate-300 dark:border-slate-600 text-transparent'
                                  } ${auto ? 'opacity-70' : ''}`}
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </span>
                                <span className="flex-1 min-w-0 truncate">{name}</span>
                                {state && state.status !== 'visited' && <Swatch status={state.status} />}
                                {auto && <span className="text-[10px] text-slate-400 shrink-0">{t('atlas.regions.fromTripsShort')}</span>}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}
                </div>
              ) : atlas.countries.size === 0 ? (
                <div className="empty-state !py-8">
                  <div className="empty-state-icon">🌍</div>
                  <p className="empty-state-title">{t('atlas.empty')}</p>
                  <p className="empty-state-message">{t('atlas.emptySub')}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {LIST_ORDER.filter((s) => grouped[s].length > 0).map((status) => (
                    <section key={status}>
                      <h3 className="flex items-center gap-2 font-poppins font-semibold text-base mb-2">
                        <Swatch status={status} />
                        {t(`atlas.group.${status}`)}
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-500">
                          {grouped[status].length}
                        </span>
                      </h3>
                      <ul className="space-y-0.5">
                        {grouped[status].map((c) => (
                          <li key={c.code}>
                            <button
                              type="button"
                              onClick={() => setSelected(c.code)}
                              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <CountryFlag code={c.code} size="sm" />
                              <span className="flex-1 min-w-0 truncate text-sm font-medium">{countryName(c.code)}</span>
                              <KindTag kind={kindOf(c.code)} />
                              <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                                {c.trips.length > 0 ? t('atlas.tripsCount', { count: c.trips.length }) : t('atlas.regions.manual')}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">{t('atlas.credits')}</p>
        </div>
      )}
    </div>
  );
};
