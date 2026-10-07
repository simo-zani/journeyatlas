import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ambulance,
  Plane,
  Apple,
  Banknote,
  Beef,
  Bird,
  Carrot,
  ChevronDown,
  Croissant,
  Drumstick,
  EarOff,
  Egg,
  Fish,
  GlassWater,
  Ham,
  Shrimp,
  Soup,
  Utensils,
  ExternalLink,
  Hand,
  HandHeart,
  HandHelping,
  Handshake,
  Hospital,
  Leaf,
  LogOut,
  MessageCircle,
  Moon,
  Smile,
  Sprout,
  Sunrise,
  Sunset,
  IdCard,
  Languages,
  LifeBuoy,
  Milk,
  Nut,
  Pill,
  Search,
  ShieldAlert,
  Siren,
  Toilet,
  TrainFront,
  Wheat,
  type LucideIcon,
} from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { CountryInfo } from '@/lib/countryInfo';
import { useIsStuck } from '@/lib/useIsStuck';
import { useNationality } from '@/lib/useNationality';
import {
  BRITISH_ENGLISH_COUNTRIES,
  LANGUAGES,
  PHRASES,
  PHRASE_CATEGORIES,
  phrasebookLanguagesFor,
  type PhraseCategoryId,
  type PhraseDef,
} from '@/lib/phrasebook';

const CATEGORY_ICONS: Record<PhraseCategoryId, LucideIcon> = {
  allergies: ShieldAlert,
  food: Utensils,
  greetings: Smile,
  needs: LifeBuoy,
  emergency: Siren,
  transport: TrainFront,
  courtesy: Handshake,
};

/** Icona specifica per frase, mostrata nella vista a schermo grande. */
const PHRASE_ICONS: Record<string, LucideIcon> = {
  allergy: ShieldAlert,
  vegetarian: Leaf,
  vegan: Sprout,
  gluten: Wheat,
  dairy: Milk,
  nuts: Nut,
  toilet: Toilet,
  help: HandHelping,
  pharmacy: Pill,
  hospital: Hospital,
  ambulance: Ambulance,
  police: Siren,
  passport: IdCard,
  airport: Plane,
  station: TrainFront,
  price: Banknote,
  hello: Smile,
  hellofm: MessageCircle,
  goodbye: LogOut,
  morning: Sunrise,
  evening: Sunset,
  night: Moon,
  thanks: HandHeart,
  please: Handshake,
  excuse: Hand,
  understand: EarOff,
  meat: Drumstick,
  beef: Beef,
  pork: Ham,
  chicken: Bird,
  fish: Fish,
  shellfish: Shrimp,
  eggs: Egg,
  rice: Soup,
  bread: Croissant,
  vegetables: Carrot,
  fruit: Apple,
  water: GlassWater,
  english: Languages,
};

export const PhrasebookPanel: React.FC<{ countries: CountryInfo[]; stickyTop: number }> = ({
  countries,
  stickyTop,
}) => {
  const [barSentinelRef, barStuck] = useIsStuck(stickyTop);
  const nationality = useNationality();
  const { t, i18n } = useTranslation();
  const isItalian = i18n.language?.startsWith('it');

  // Una lingua per ogni voce del frasario, con la bandiera del primo paese che la parla.
  // L'inglese dei paesi britannici è una variante a sé; quello americano c'è sempre, in coda,
  // perché serve ovunque nel mondo.
  const available = useMemo(() => {
    const map = new Map<string, { code: string; label: string; flag: string; labelCode: string }>();
    for (const c of countries) {
      for (const { code: base } of phrasebookLanguagesFor(c.languages)) {
        // il frasario italiano è per chi arriva in Italia: a un italiano non serve (es. in Svizzera)
        if (base === 'it' && nationality === 'IT') continue;
        const code = base === 'en' && BRITISH_ENGLISH_COUNTRIES.includes(c.code) ? 'en-gb' : base;
        if (!map.has(code)) map.set(code, { code, label: LANGUAGES[code].name, flag: c.code, labelCode: code });
      }
    }
    if (!map.has('en')) map.set('en', { code: 'en', label: LANGUAGES.en.name, flag: 'US', labelCode: 'en' });
    // con entrambe le varianti serve distinguerle: "inglese britannico" e "inglese americano"
    if (map.has('en-gb') && map.has('en')) map.get('en')!.labelCode = 'en-US';
    return [...map.values()];
  }, [countries, nationality]);

  const uncovered = useMemo(() => {
    const covered = new Set(Object.values(LANGUAGES).map((l) => l.name));
    return [...new Set(countries.flatMap((c) => c.languages))].filter(
      (name) => ![...covered].some((n) => name === n || name.startsWith(`${n} `))
    );
  }, [countries]);

  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState<PhraseDef | null>(null);
  // le sezioni partono sempre chiuse: si ricordano solo quelle aperte
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const active = selected && available.some((a) => a.code === selected) ? selected : (available[0]?.code ?? null);
  const language = active ? LANGUAGES[active] : null;

  // Nome della lingua in quella dell'interfaccia ("Inglese"), con il nome del dataset come ripiego.
  const languageLabel = (code: string, fallback: string) => {
    try {
      const name = new Intl.DisplayNames([i18n.language], { type: 'language' }).of(code);
      return name ? name.charAt(0).toUpperCase() + name.slice(1) : fallback;
    } catch {
      return fallback;
    }
  };

  const phraseLabel = (p: PhraseDef) => (isItalian ? p.it : p.en);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PHRASE_CATEGORIES.map((category) => ({
      category,
      phrases: PHRASES.filter(
        (p) =>
          p.category === category &&
          language?.phrases[p.id] &&
          (!q ||
            p.it.toLowerCase().includes(q) ||
            p.en.toLowerCase().includes(q) ||
            language.phrases[p.id][0].toLowerCase().includes(q))
      ),
    })).filter((g) => g.phrases.length > 0);
  }, [query, language]);

  const translateFallback = (
    <div className="card card-static flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{t('countryInfo.phrasebook.fallbackTitle')}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {uncovered.length > 0
            ? t('countryInfo.phrasebook.fallbackLanguages', {
                languages: uncovered.join(', '),
              })
            : t('countryInfo.phrasebook.fallbackMessage')}
        </p>
      </div>
      <a
        href="https://translate.google.com/?sl=it"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-full bg-gold/15 ring-1 ring-gold/30 hover:bg-gold/25 transition-colors font-semibold text-sm no-underline hover:no-underline shrink-0"
      >
        Google Translate
        <ExternalLink className="w-5 h-5 text-gold" />
      </a>
    </div>
  );

  if (!language || !active) return translateFallback;

  const bigEntry = shown ? language.phrases[shown.id] : null;
  const BigIcon = shown ? (PHRASE_ICONS[shown.id] ?? CATEGORY_ICONS[shown.category]) : null;

  return (
    <div className="space-y-6">
      {/* Barra: lingue a sinistra, ricerca a destra (stesso stile dei filtri degli altri tab) */}
      <div ref={barSentinelRef} className="h-0 !mt-0" aria-hidden="true" />
      <div
        style={{ top: stickyTop }}
        className={`!mt-0 sticky z-10 py-1.5 before:content-[''] before:absolute before:-z-10 before:inset-x-[-50vw] before:top-[-120px] before:bottom-[-12px] before:backdrop-blur-md before:bg-[var(--surface-0)]/60 before:pointer-events-none before:[mask-image:linear-gradient(to_bottom,black_80%,transparent)] before:transition-opacity before:duration-500 before:ease-out ${barStuck ? 'before:opacity-100' : 'before:opacity-0'}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {available.map((a) => (
            <button
              key={a.code}
              type="button"
              onClick={() => setSelected(a.code)}
              className={`inline-flex items-center gap-2 px-3.5 h-[38px] rounded-full text-xs font-bold whitespace-nowrap backdrop-blur-xl shadow-md transition-all duration-150 cursor-pointer ${
                a.code === active
                  ? 'bg-gold text-slate-950'
                  : 'bg-slate-900/80 dark:bg-slate-900/85 border border-slate-700/60 dark:border-white/10 text-slate-300 hover:text-slate-100 hover:border-gold/50'
              }`}
            >
              <CountryFlag code={a.flag} size="md" />
              {languageLabel(a.labelCode, a.label)}
            </button>
          ))}
          <div className="relative w-full sm:w-64 sm:ml-auto">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              type="search"
              className="!pl-11 !h-[38px] !min-h-0 !py-0 !rounded-full !text-xs"
              placeholder={t('countryInfo.phrasebook.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {grouped.length === 0 && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">{t('countryInfo.phrasebook.noResults')}</p>
      )}

      {grouped.map(({ category, phrases }) => {
        const Icon = CATEGORY_ICONS[category];
        // durante una ricerca le sezioni restano aperte, altrimenti i risultati sparirebbero
        const isCollapsed = !expanded[category] && !query.trim();
        return (
          <section key={category} className="space-y-3">
            <button
              type="button"
              onClick={() => setExpanded((c) => ({ ...c, [category]: !c[category] }))}
              aria-expanded={!isCollapsed}
              className="w-full flex items-center gap-2.5 font-poppins font-semibold text-base text-left cursor-pointer"
            >
              <span className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              {t(`countryInfo.phrasebook.categories.${category}`)}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{phrases.length}</span>
              <span className="h-px flex-1 bg-slate-300/40 dark:bg-white/10" aria-hidden="true" />
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
              />
            </button>
            {!isCollapsed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {phrases.map((p) => {
                  const [local, pron] = language.phrases[p.id];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setShown(p)}
                      className="min-w-0 rounded-2xl ring-1 ring-slate-300/40 dark:ring-white/10 bg-slate-900/5 dark:bg-white/[0.04] hover:bg-gold/5 hover:ring-gold/40 transition-colors !px-5 !py-4 text-left cursor-pointer flex flex-col gap-1"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                        {phraseLabel(p)}
                      </span>
                      <span
                        className="text-lg font-semibold leading-snug break-words"
                        dir={language.rtl ? 'rtl' : undefined}
                        lang={active}
                      >
                        {local}
                      </span>
                      <span className="text-xs text-gold-dark dark:text-gold-light italic break-words">{pron}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {uncovered.length > 0 && translateFallback}

      {/* Vista "schermo grande": da mostrare a una persona del posto */}
      <Modal
        open={shown !== null}
        onClose={() => setShown(null)}
        title={shown ? phraseLabel(shown) : ''}
        maxWidth="max-w-4xl"
      >
        {shown && bigEntry && BigIcon && (
          <div className="rounded-3xl bg-white text-slate-950 px-6 py-10 sm:py-14 flex flex-col items-center text-center gap-6">
            <BigIcon className="w-28 h-28 sm:w-36 sm:h-36 text-deep-blue" strokeWidth={1.5} />
            <p
              className="text-4xl sm:text-6xl font-bold leading-tight break-words max-w-full"
              dir={language.rtl ? 'rtl' : undefined}
              lang={active}
            >
              {bigEntry[0]}
            </p>
            <p className="text-lg sm:text-2xl text-slate-600 italic">{bigEntry[1]}</p>
            <p className="text-sm sm:text-base text-slate-500">{phraseLabel(shown)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
