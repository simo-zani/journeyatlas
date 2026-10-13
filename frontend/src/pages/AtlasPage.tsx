import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  Compass,
  Earth,
  Globe2,
  Layers,
  Loader2,
  Map as MapIcon,
  Plane,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { CountryFlag } from '@/components/CountryFlag';
import { WorldMap, type MapView } from '@/components/atlas/WorldMap';
import { RegionMap, type RegionState } from '@/components/atlas/RegionMap';
import { TripsBadge } from '@/components/atlas/TripsBadge';
import { useAuth } from '@/auth/AuthContext';
import {
  clearAtlasMarks,
  fetchAtlasMarks,
  fetchCountryContinents,
  fetchMyTrips,
  fetchTransportsForTrips,
  setAtlasMark,
} from '@/lib/api';
import {
  buildAtlas,
  isTripStarted,
  WORLD_COUNTRY_COUNT,
  type AtlasCountry,
  type AtlasTripInput,
  type AtlasTripRef,
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
/** Paesi mostrati con il nome completo invece di quello breve del browser. */
const NAME_OVERRIDES = new Set(['US']);
/** Regioni mostrate ma escluse dal conteggio "x / N" (nome originale → sigla). Washington D.C.
 * non è uno stato: gli USA contano 50 stati e il distretto si aggiunge a parte. */
const UNCOUNTED_REGIONS: Record<string, Record<string, string>> = {
  US: { 'District of Columbia': 'D.C.' },
};
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
  // Paese su cui l'animazione del mondo è arrivata: solo allora compaiono le regioni.
  const [settled, setSettled] = useState<string | null>(null);
  // Vista per regioni accesa/spenta a mano: resta com'è passando da un paese all'altro.
  const [regionsOn, setRegionsOn] = useState(false);
  // Ogni nuova selezione riparte da capo: le regioni aspettano la fine del nuovo volo.
  useEffect(() => setSettled(null), [selected]);

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
  // Nomi dal browser (forma breve: "Stati Uniti"); le entità senza ISO e le poche
  // eccezioni con la forma completa (atlas.entity.*) dalle traduzioni dell'app.
  const countryName = useCallback(
    (code: string) =>
      code.startsWith('X-') || NAME_OVERRIDES.has(code)
        ? t(`atlas.entity.${code}`)
        : (regionNames?.of(code) ?? code),
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

  // Le regioni sono "aperte" appena caricate (barra e pannello si aggiornano subito);
  // la mappa delle regioni compare però solo quando il volo verso il paese è finito.
  const showRegions = hasRegions && regions?.code === selected;
  const regionFlags = selectedCca3 ? regionIndex[selectedCca3]?.flags : undefined;
  // Nome mostrato di una regione: tradotto nella lingua dell'app se disponibile.
  // Il nome originale resta la chiave (geometrie, segni a mano).
  const uiLang = i18n.language?.startsWith('it') ? 'it' : 'en';
  const regionTranslations = selectedCca3 ? regionIndex[selectedCca3]?.names?.[uiLang] : undefined;
  const regionLabel = useCallback((name: string) => regionTranslations?.[name] ?? name, [regionTranslations]);
  const regionMapVisible = showRegions && settled === selected && regionsOn;

  const regionStates = useMemo(() => {
    const states = new Map<string, RegionState>();
    if (!atlas || !regions || regions.code !== selected) return states;
    for (const p of atlas.points) {
      if (p.code !== selected) continue;
      const name = regionAt(regions.features, p.lat, p.lon);
      if (!name) continue;
      const prev = states.get(name);
      const trips = prev?.trips ?? [];
      if (p.status === 'visited' && !trips.some((tr) => tr.id === p.tripId)) trips.push({ id: p.tripId, name: p.tripName });
      const status = !prev || STATUS_RANK[p.status] > STATUS_RANK[prev.status] ? p.status : prev.status;
      states.set(name, { status, manual: false, trips });
    }
    for (const m of marks) {
      if (m.country_code !== selected || !m.region_key) continue;
      const prev = states.get(m.region_key);
      if (!prev || prev.status !== 'visited') states.set(m.region_key, { status: 'visited', manual: true, trips: [] });
    }
    return states;
  }, [atlas, regions, selected, marks]);

  const regionNamesSorted = useMemo(
    () =>
      regions && regions.code === selected
        ? regions.features
            .map((f) => f.code ?? '')
            .filter(Boolean)
            .sort((a, b) => regionLabel(a).localeCompare(regionLabel(b), i18n.language))
        : [],
    [regions, selected, i18n.language, regionLabel]
  );
  // Unità che restano sulla mappa ma fuori dal conteggio (Washington D.C.: "x / 50" stati, "+ D.C." a parte).
  const uncounted = (selected && UNCOUNTED_REGIONS[selected]) || {};
  const countedRegions = regionNamesSorted.filter((n) => !(n in uncounted));
  const visitedRegions = countedRegions.filter((n) => regionStates.get(n)?.status === 'visited').length;
  const visitedExtras = regionNamesSorted
    .filter((n) => n in uncounted && regionStates.get(n)?.status === 'visited')
    .map((n) => uncounted[n]);

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

  // Interruttore "Visitato" del pannello: acceso = paese sbloccato. Spegnerlo toglie
  // i segni a mano (paese e regioni); se invece lo sblocca un viaggio non si può.
  const [visitedWarning, setVisitedWarning] = useState<AtlasTripRef[] | null>(null);
  useEffect(() => setVisitedWarning(null), [selected]);

  const toggleCountryVisited = async (code: string) => {
    const country = atlas?.countries.get(code);
    const blockingTrips = (country?.trips ?? []).filter((tr) => tr.started && tr.asDestination);
    if (country?.status !== 'visited') {
      await toggleMark(code, '');
      return;
    }
    if (blockingTrips.length > 0) {
      setVisitedWarning(blockingTrips);
      return;
    }
    const prev = marks;
    setMarks(marks.filter((m) => m.country_code !== code));
    try {
      await clearAtlasMarks(code);
    } catch (err) {
      setMarks(prev);
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  // --------------------------------------------------------------- vista
  const visitedCities = atlas?.cities.filter((c) => c.visited).length ?? 0;
  const worldPercent = Math.round((visitedByKind.sovereign / WORLD_COUNTRY_COUNT) * 1000) / 10;
  const selectedCountry = selected ? atlas?.countries.get(selected) ?? null : null;
  const countryVisited = selectedCountry?.status === 'visited';

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
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
      {(regionMapVisible ? (['visited', 'transit', 'planned'] as const) : (['visited', 'transit', 'planned', 'home'] as const)).map((s) => (
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {tiles.map(({ key, icon: Icon, label, value, suffix, hint, progress }) => (
              <Card key={key} className="card-static !px-6 !py-5">
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card noPadding className="card-static xl:col-span-2">
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="flex flex-wrap items-center gap-3">
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
                        className={`relative flex items-center gap-2 px-5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
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
                  {/* Interruttore della vista per regioni: compare solo quando si è su un
                      paese che ha le regioni; la si apre e chiude a mano. */}
                  {hasRegions && selected && (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={regionsOn}
                      onClick={() => setRegionsOn((v) => !v)}
                      title={t('atlas.regions.toggleTitle', { country: countryName(selected) })}
                      className="inline-flex items-center gap-2.5 cursor-pointer select-none"
                    >
                      <span
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          regionsOn ? 'bg-gold' : 'bg-slate-300 dark:bg-white/15'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                            regionsOn ? 'translate-x-5' : ''
                          }`}
                        />
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Layers className="w-5 h-5" />
                        {t('atlas.regions.toggle')}
                        <CountryFlag code={selected} size="xs" />
                      </span>
                    </button>
                  )}
                </div>
                {legend}
              </div>
              <div className="p-2 sm:p-4">
                {/* Transizione: il mondo vola sul paese (rotazione + zoom), poi le regioni
                    compaiono sopra in dissolvenza. Al ritorno le regioni svaniscono mentre il
                    mondo si riallarga. Il mondo resta sempre montato sotto. */}
                <div className="relative">
                  <WorldMap
                    geo={geo}
                    view={view}
                    countries={atlas.countries}
                    cities={atlas.cities}
                    homeCode={nationality}
                    selected={selected}
                    onSelect={setSelected}
                    countryName={countryName}
                    onFocusSettled={setSettled}
                    homeCoords={homeCity?.coords ?? null}
                    homeLabel={homeCity?.city ?? null}
                  />
                  <AnimatePresence>
                    {regionMapVisible && selected && regions && (
                      <motion.div
                        key={selected}
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <RegionMap
                          countryCode={selected}
                          regions={regions.features}
                          states={regionStates}
                          cities={atlas.cities}
                          homeCoords={homeCity?.coords ?? null}
                          homeLabel={homeCity?.city ?? null}
                          flags={regionFlags}
                          regionLabel={regionLabel}
                          onToggle={(name) => void toggleMark(selected, name)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {regionsLoading && regionsOn && settled === selected && !showRegions && (
                  <p className="mt-2 text-center text-xs text-slate-400 inline-flex w-full justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-gold" />
                    {t('atlas.regions.loading')}
                  </p>
                )}
                <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
                  {regionMapVisible ? t('atlas.regions.hint') : view === 'globe' ? t('atlas.hintGlobe') : t('atlas.hintFlat')}
                </p>
              </div>
            </Card>

            <div className="relative">
              <Card className="card-static xl:absolute xl:inset-0 flex flex-col">
              {selected ? (
                <div className="space-y-4 flex flex-col min-h-0 xl:flex-1">
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
                    <div className="min-w-0 flex-1">
                      <h3 className="font-poppins font-semibold text-lg flex items-center gap-2 min-w-0">
                        <span className="truncate">{countryName(selected)}</span>
                        <KindTag kind={kindOf(selected)} />
                      </h3>
                      {continentOf(selected) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t(`atlas.continent.${continentOf(selected)}`)}
                        </p>
                      )}
                    </div>
                    {/* Check "visitato": segna/toglie a mano il paese */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={countryVisited}
                      onClick={() => void toggleCountryVisited(selected)}
                      title={countryVisited ? t('atlas.unmarkVisited') : t('atlas.markVisited')}
                      aria-label={countryVisited ? t('atlas.unmarkVisited') : t('atlas.markVisited')}
                      className={`ml-auto w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        countryVisited
                          ? 'bg-gold border-gold text-slate-950 shadow-sm shadow-gold/30'
                          : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-gold hover:text-gold/50'
                      }`}
                    >
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </button>
                  </div>


                  {selectedCountry && selectedCountry.trips.length > 0 && (
                    // Al massimo 3 viaggi visibili (righe da 60px + 2 spazi da 8px), gli altri scorrono.
                    <ul className="space-y-2 shrink-0 max-h-[196px] overflow-y-auto pr-1">
                      {selectedCountry.trips.map((trip) => (
                        <li key={trip.id}>
                          <Link
                            to={`/trips/${trip.id}`}
                            className="flex items-center justify-between gap-3 h-[60px] rounded-2xl bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 px-3.5 no-underline hover:no-underline transition-colors"
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
                    <section className="pt-1 flex flex-col min-h-0 xl:flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-poppins font-semibold text-sm">{t('atlas.regions.listTitle')}</h4>
                        <span className="text-sm font-bold tabular-nums">
                          {visitedRegions}
                          <span className="text-slate-400 font-semibold"> / {countedRegions.length}</span>
                          {visitedExtras.map((short) => (
                            <span key={short} className="ml-1.5 text-gold">
                              + {short}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 overflow-hidden mb-3">
                        <div
                          className="h-full rounded-full bg-gold transition-[width] duration-500"
                          style={{ width: `${countedRegions.length ? (visitedRegions / countedRegions.length) * 100 : 0}%` }}
                        />
                      </div>
                      <ul className="max-h-80 xl:max-h-none xl:flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-1">
                        {regionNamesSorted.map((name) => {
                          const state = regionStates.get(name);
                          const auto = !!state && !state.manual && state.status === 'visited';
                          const checked = state?.status === 'visited';
                          return (
                            <li
                              key={name}
                              className="flex items-center gap-2 pr-2 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <button
                                type="button"
                                disabled={auto}
                                onClick={() => void toggleMark(selected, name)}
                                title={auto ? t('atlas.regions.fromTrips') : undefined}
                                className="flex-1 min-w-0 flex items-center gap-2.5 px-2 py-1.5 text-left text-sm cursor-pointer disabled:cursor-default"
                              >
                                <span
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                                    checked ? 'bg-gold border-gold text-slate-950' : 'border-slate-300 dark:border-slate-600 text-transparent'
                                  } ${auto ? 'opacity-70' : ''}`}
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </span>
                                {regionFlags?.[name] && (
                                  <img
                                    src={regionFlags[name]}
                                    alt=""
                                    loading="lazy"
                                    className="h-[20px] w-[30px] object-cover rounded-[4px] ring-1 ring-black/10 shrink-0"
                                  />
                                )}
                                <span className="flex-1 min-w-0 truncate">{regionLabel(name)}</span>
                                {state && state.status !== 'visited' && <Swatch status={state.status} />}
                              </button>
                              {/* Fuori dal pulsante della riga: è cliccabile da solo (link o elenco dei viaggi) */}
                              {auto && <TripsBadge trips={state.trips} />}
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
                <div className="space-y-5 min-h-0 xl:flex-1 xl:overflow-y-auto pr-1">
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
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">{t('atlas.credits')}</p>

          <Modal
            open={visitedWarning !== null}
            onClose={() => setVisitedWarning(null)}
            title={t('atlas.visitedLockedTitle')}
            maxWidth="max-w-md"
          >
            <div className="space-y-5">
              <div className="flex items-start gap-3 px-[18px] py-[14px] rounded-xl bg-warning/10 border border-warning/30">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {t('atlas.visitedLocked', {
                    count: visitedWarning?.length ?? 0,
                    country: selected ? countryName(selected) : '',
                  })}
                </p>
              </div>
              <ul className="space-y-2">
                {visitedWarning?.map((trip) => (
                  <li key={trip.id}>
                    <Link
                      to={`/trips/${trip.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 px-[20px] py-3 no-underline hover:no-underline transition-colors"
                    >
                      <span className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{trip.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        {formatRange(trip.start_date, trip.end_date)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setVisitedWarning(null)}
                className="w-full px-6 py-3 rounded-xl text-sm font-bold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 cursor-pointer"
              >
                {t('share.removeBlockedOk')}
              </button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};
