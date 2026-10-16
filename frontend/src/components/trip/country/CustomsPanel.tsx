import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ban,
  CalendarDays,
  CalendarRange,
  ChefHat,
  ChevronDown,
  MapPin,
  ExternalLink,
  Gavel,
  Hand,
  HandCoins,
  Info,
  Loader2,
  PartyPopper,
  Sparkles,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { loadRegions, regionAt } from '@/lib/atlasGeo';
import { localYearsFor } from '@/lib/calendars';
import { farnesinaUrl, fetchPublicHolidays, type CountryInfo, type PublicHoliday } from '@/lib/countryInfo';
import { CUSTOMS, CUSTOMS_LIKE, HOLIDAY_NOTES, periodOverlaps, type CountryCustoms, type LocalText } from '@/lib/customs';
import { DISHES } from '@/lib/dishes';
import { holidayInfo } from '@/lib/holidayInfo';
import { subdivisionForShape, subdivisionName } from '@/lib/subdivisions';
import type { Destination } from '@/lib/types';

const TONES = {
  law: { icon: Gavel, box: 'bg-red-500/10 ring-red-500/25', head: 'text-red-500 dark:text-red-400' },
  gestures: { icon: Hand, box: 'bg-purple-500/10 ring-purple-500/25', head: 'text-purple-500 dark:text-purple-400' },
  avoid: { icon: Ban, box: 'bg-amber-500/10 ring-amber-500/25', head: 'text-amber-600 dark:text-amber-400' },
  local: { icon: Sparkles, box: 'bg-emerald-500/10 ring-emerald-500/25', head: 'text-emerald-600 dark:text-emerald-400' },
} as const;

type Section = keyof typeof TONES;
const SECTIONS: Section[] = ['law', 'gestures', 'avoid', 'local'];

/** Anni toccati dal viaggio (di solito uno, due a cavallo di Capodanno). */
const tripYears = (start: string, end: string): number[] => {
  const from = Number(start.slice(0, 4));
  const to = Number(end.slice(0, 4));
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
};

const InfoTile: React.FC<{ icon: LucideIcon; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
  <div className="relative overflow-hidden rounded-2xl ring-1 p-6 min-w-0 bg-gradient-to-br from-gold/15 to-gold/5 ring-gold/25">
    <Icon className="absolute -bottom-2 -right-2 w-14 h-14 opacity-10 text-gold" strokeWidth={1.5} />
    <p className="relative flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
      <Icon className="w-5 h-5 shrink-0" />
      <span className="truncate">{label}</span>
    </p>
    <div className="relative mt-2 text-sm">{children}</div>
  </div>
);

interface CustomsPanelProps {
  countries: CountryInfo[];
  tripStart: string | null;
  tripEnd: string | null;
  destinations: Destination[];
  /** Dove si aggancia la barra dei paesi: sotto la barra delle sotto-schede. */
  stickyTop: number;
}

export const CustomsPanel: React.FC<CustomsPanelProps> = ({ countries, tripStart, tripEnd, destinations, stickyTop }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (countries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏠</div>
        <p className="empty-state-title">{t('countryInfo.onlyHomeTitle')}</p>
        <p className="empty-state-message">{t('countryInfo.onlyHomeMessage')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {countries.map((c) => (
        <CountryCustomsCard
          key={c.code}
          country={c}
          tripStart={tripStart}
          tripEnd={tripEnd}
          destinations={destinations.filter((d) => d.countryCode?.toUpperCase() === c.code)}
          stickyTop={stickyTop}
          collapsed={!!collapsed[c.code]}
          onToggle={() => setCollapsed((prev) => ({ ...prev, [c.code]: !prev[c.code] }))}
        />
      ))}
    </div>
  );
};

const CountryCustomsCard: React.FC<{
  country: CountryInfo;
  tripStart: string | null;
  tripEnd: string | null;
  /** Mete del viaggio in questo paese. */
  destinations: Destination[];
  stickyTop: number;
  collapsed: boolean;
  onToggle: () => void;
}> = ({ country, tripStart, tripEnd, destinations, stickyTop, collapsed, onToggle }) => {
  const { t, i18n } = useTranslation();
  const lang: keyof LocalText = i18n.language?.startsWith('it') ? 'it' : 'en';
  // Paesi piccoli senza voce propria: usanze e piatti del vicino a cui somigliano (le feste restano le loro)
  const likeCode = CUSTOMS[country.code] ? undefined : CUSTOMS_LIKE[country.code];
  const data: CountryCustoms | undefined = CUSTOMS[likeCode ?? country.code];
  const name = lang === 'it' ? country.nameIt : country.nameEn;
  const likeName = likeCode && new Intl.DisplayNames([lang], { type: 'region' }).of(likeCode);

  // Regioni delle mete (codice ISO 3166-2 → città), per capire quali feste regionali le riguardano.
  // null finché non si sa (mete senza coordinate o paese senza confini regionali).
  const [tripRegions, setTripRegions] = useState<Map<string, string[]> | null>(null);
  const destinationsKey = JSON.stringify(destinations.map((d) => [d.city, d.coords?.lat, d.coords?.lon]));
  useEffect(() => {
    const located = destinations.filter((d) => d.coords);
    if (located.length === 0) return;
    let cancelled = false;
    loadRegions(country.cca3)
      .then((regions) => {
        if (cancelled) return;
        const map = new Map<string, string[]>();
        for (const d of located) {
          const shape = regionAt(regions, d.coords!.lat, d.coords!.lon);
          const code = shape ? subdivisionForShape(country.code, shape) : null;
          if (code) map.set(code, [...(map.get(code) ?? []), d.city || d.country]);
        }
        setTripRegions(map);
      })
      .catch(() => {
        if (!cancelled) setTripRegions(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.cca3, country.code, destinationsKey]);

  // Festività (nazionali e regionali) nelle date del viaggio: null = paese non coperto da Nager.Date
  const [holidays, setHolidays] = useState<PublicHoliday[] | null | undefined>(undefined);
  useEffect(() => {
    if (!tripStart) return;
    const end = tripEnd ?? tripStart;
    let cancelled = false;
    setHolidays(undefined);
    Promise.all(tripYears(tripStart, end).map((y) => fetchPublicHolidays(country.code, y)))
      .then((lists) => {
        if (cancelled) return;
        if (lists.every((l) => l === null)) return setHolidays(null);
        // ordinate: i giorni di recupero (festa caduta di domenica) arrivano in fondo all'elenco
        setHolidays(
          lists
            .flatMap((l) => l ?? [])
            .filter((h) => h.date >= tripStart && h.date <= end)
            .sort((a, b) => a.date.localeCompare(b.date))
        );
      })
      .catch(() => {
        if (!cancelled) setHolidays(null);
      });
    return () => {
      cancelled = true;
    };
  }, [country.code, tripStart, tripEnd]);

  const formatDay = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' });

  const national = holidays?.filter((h) => !h.regions) ?? [];
  const regional = holidays?.filter((h) => h.regions) ?? [];
  // Feste regionali che toccano le mete del viaggio, e tutte le altre (in un elenco da aprire)
  const relevant = tripRegions ? regional.filter((h) => h.regions!.some((r) => tripRegions.has(r))) : [];
  const otherRegional = regional.filter((h) => !relevant.includes(h));
  const holidayNote = HOLIDAY_NOTES[country.code];

  const regionList = (codes: string[]) => {
    const names = codes.map((c) => subdivisionName(c, lang)).sort((a, b) => a.localeCompare(b));
    return names.length > 4 ? `${names.slice(0, 3).join(', ')} +${names.length - 3}` : names.join(', ');
  };

  const renderHoliday = (h: PublicHoliday, place: React.ReactNode) => {
    const info = holidayInfo(country.code, h.name);
    const shownName = lang === 'it' ? info?.it ?? h.name : h.name;
    return (
      <li key={h.date + h.name} className="flex gap-3 text-sm">
        <span className="w-[96px] shrink-0 font-semibold tabular-nums text-light-blue">{formatDay(h.date)}</span>
        <div className="min-w-0">
          <p>
            <span className="font-semibold">{shownName}</span>
            {h.localName !== shownName && <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{h.localName}</span>}
          </p>
          {place}
          {info?.about && <p className="text-xs text-slate-500 dark:text-slate-400">{info.about[lang]}</p>}
        </div>
      </li>
    );
  };

  // Periodi curati a mano (Ramadan, Oktoberfest...): solo quelli che toccano le date del viaggio
  const periods = (data?.periods ?? []).filter((p) => periodOverlaps(p, tripStart, tripEnd));
  const dishes = DISHES[likeCode ?? country.code] ?? [];
  const sections = SECTIONS.filter((s) => (data?.[s]?.length ?? 0) > 0);
  // Zodiaco, era o calendario locale alla partenza (o oggi, se il viaggio non ha date)
  const localYears = localYearsFor(country.code, tripStart ?? new Date().toISOString().slice(0, 10));
  const tileCount = (data ? (data.meals ? 1 : 0) + (data.tipping ? 1 : 0) + 1 : 0) + (localYears.length > 0 ? 1 : 0);
  const tileCols = ['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-2 xl:grid-cols-4'][tileCount];

  return (
    // Come le categorie della checklist: l'intestazione resta agganciata sotto la barra delle
    // sotto-schede finché si legge il paese, poi la spinge via quella del paese successivo
    // (il riquadro taglia con overflow: clip, che a differenza di hidden non blocca lo sticky).
    <div className="relative rounded-xl [overflow:clip]">
      {/* Copertura sticky: dentro questo riquadro nasconde ciò che scorre sopra l'intestazione agganciata */}
      <div className="sticky z-[4] h-0 pointer-events-none" style={{ top: stickyTop }} aria-hidden="true">
        {/* scende di 32px (il raggio degli angoli) sotto il bordo alto dell'intestazione: negli angoli curvi non si intravede nulla */}
        <div className="absolute inset-x-0 bottom-[-32px] h-[3032px] bg-[var(--surface-0)]" />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        style={{ top: stickyTop }}
        className="sticky z-[5] w-full flex items-center gap-3 px-6 py-[16px] bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-left select-none cursor-pointer hover:brightness-110 dark:hover:brightness-125 transition-[filter]"
      >
        <CountryFlag code={country.code} size="lg" />
        <h3 className="flex-1 min-w-0 font-poppins font-bold text-2xl leading-tight break-words">{name}</h3>
        <ChevronDown
          size={22}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>

      {!collapsed && (
        <div className="-mt-[32px] pt-[52px] px-6 pb-6 space-y-5 bg-[var(--surface-1)] border border-t-0 border-[var(--border-subtle)] rounded-b-xl">
          {likeName && (
            <p className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Info className="w-5 h-5 shrink-0" />
              {t('countryInfo.customs.likeCountry', { like: likeName })}
            </p>
          )}

          {tileCount > 0 && (
            <div className={`grid grid-cols-1 ${tileCols} gap-3`}>
              {data?.meals && (
                <InfoTile icon={Utensils} label={t('countryInfo.customs.meals')}>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                    <dt className="text-slate-500 dark:text-slate-400">{t('countryInfo.customs.breakfast')}</dt>
                    <dd className="font-semibold tabular-nums">{data.meals.breakfast}</dd>
                    <dt className="text-slate-500 dark:text-slate-400">{t('countryInfo.customs.lunch')}</dt>
                    <dd className="font-semibold tabular-nums">{data.meals.lunch}</dd>
                    <dt className="text-slate-500 dark:text-slate-400">{t('countryInfo.customs.dinner')}</dt>
                    <dd className="font-semibold tabular-nums">{data.meals.dinner}</dd>
                  </dl>
                  {data.meals.note && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{data.meals.note[lang]}</p>}
                </InfoTile>
              )}
              {data?.tipping && (
                <InfoTile icon={HandCoins} label={t('countryInfo.customs.tipping')}>
                  <p>{data.tipping[lang]}</p>
                </InfoTile>
              )}
              {data && (
                <InfoTile icon={CalendarDays} label={t('countryInfo.customs.weekend')}>
                  <p className="font-semibold">{data.weekend ? data.weekend[lang] : t('countryInfo.customs.weekendDefault')}</p>
                </InfoTile>
              )}
              {localYears.length > 0 && (
                <InfoTile icon={CalendarRange} label={t('countryInfo.customs.localYear')}>
                  <div className="space-y-2">
                    {localYears.map((y) => (
                      <div key={y.value.en}>
                        <p className="font-poppins font-bold">{y.value[lang]}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{y.note[lang]}</p>
                      </div>
                    ))}
                  </div>
                </InfoTile>
              )}
            </div>
          )}

          {!data && (
            <p className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Info className="w-5 h-5 shrink-0" />
              {t('countryInfo.customs.noData', { country: name })}
            </p>
          )}

          {dishes.length > 0 && (
            <div className="rounded-2xl ring-1 ring-orange-500/25 bg-orange-500/10 p-6">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                <ChefHat className="w-5 h-5" />
                {t('countryInfo.customs.dishes')}
              </p>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {dishes.map((dish) => (
                  <li key={dish.name} className="min-w-0">
                    <p className="font-semibold">{dish.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{dish.about[lang]}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feste: quelle nazionali nelle date del viaggio, più i periodi che lo toccano */}
          <div className="rounded-2xl ring-1 ring-light-blue/25 bg-light-blue/10 p-6 space-y-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-light-blue">
              <PartyPopper className="w-5 h-5" />
              {t('countryInfo.customs.holidays')}
            </p>

            {holidayNote && (
              <p className="text-sm">
                <span className="font-semibold">{t('countryInfo.customs.onHolidays')}</span> {holidayNote[lang]}
              </p>
            )}

            {!tripStart ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('countryInfo.customs.holidaysNoDates')}</p>
            ) : holidays === undefined ? (
              <Loader2 className="w-5 h-5 text-light-blue animate-spin" />
            ) : holidays === null ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('countryInfo.customs.holidaysUnavailable')}</p>
            ) : national.length + relevant.length === 0 && otherRegional.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('countryInfo.customs.holidaysNone')}</p>
            ) : (
              <>
                {national.length + relevant.length > 0 ? (
                  <ul className="space-y-1.5">
                    {[...national, ...relevant]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((h) =>
                        renderHoliday(
                          h,
                          h.regions && tripRegions && (
                            <p className="flex items-center gap-1 text-xs font-semibold text-gold">
                              <MapPin className="w-[14px] h-[14px] shrink-0" />
                              {t('countryInfo.customs.appliesTo', {
                                places: h.regions
                                  .filter((r) => tripRegions.has(r))
                                  .map((r) => `${tripRegions.get(r)!.join(', ')} (${subdivisionName(r, lang)})`)
                                  .join(' · '),
                              })}
                            </p>
                          )
                        )
                      )}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('countryInfo.customs.holidaysNone')}</p>
                )}

                {otherRegional.length > 0 && (
                  <details className="group">
                    <summary className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                      {t(tripRegions ? 'countryInfo.customs.otherRegional' : 'countryInfo.customs.regional', {
                        count: otherRegional.length,
                      })}
                    </summary>
                    <ul className="mt-2 space-y-1.5">
                      {otherRegional.map((h) =>
                        renderHoliday(
                          h,
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('countryInfo.customs.onlyIn', { regions: regionList(h.regions!) })}
                          </p>
                        )
                      )}
                    </ul>
                  </details>
                )}
              </>
            )}

            {periods.length > 0 && (
              <div className="space-y-2 pt-1">
                {periods.map((p) => (
                  <div key={p.name.en} className="rounded-xl p-5 ring-1 bg-gold/15 ring-gold/40">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{p.name[lang]}</p>
                      <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-slate-950">
                        {t('countryInfo.customs.duringTrip')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.when[lang]}</p>
                    {p.about && <p className="mt-1 text-sm">{p.about[lang]}</p>}
                    <p className="mt-1 text-sm">
                      <span className="font-semibold">{t('countryInfo.customs.forTravellers')}</span> {p.note[lang]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {sections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((s) => {
                const tone = TONES[s];
                const Icon = tone.icon;
                return (
                  <div key={s} className={`rounded-2xl ring-1 p-6 ${tone.box}`}>
                    <p className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${tone.head}`}>
                      <Icon className="w-5 h-5" />
                      {t(`countryInfo.customs.sections.${s}`)}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm list-disc pl-5 marker:text-slate-400">
                      {data![s]!.map((item) => (
                        <li key={item.en}>{item[lang]}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Le leggi cambiano: rimando alla fonte ufficiale */}
          <a
            href={farnesinaUrl(country.cca3)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-gold no-underline hover:no-underline"
          >
            <Info className="w-5 h-5 shrink-0" />
            <span>{t('countryInfo.customs.disclaimer')}</span>
            <ExternalLink className="w-5 h-5 shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
};
