import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExternalLink,
  Handshake,
  LifeBuoy,
  Search,
  ShieldAlert,
  Siren,
  TrainFront,
  type LucideIcon,
} from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { CountryInfo } from '@/lib/countryInfo';
import {
  LANGUAGES,
  PHRASES,
  PHRASE_CATEGORIES,
  phrasebookLanguagesFor,
  type PhraseCategoryId,
  type PhraseDef,
} from '@/lib/phrasebook';

const CATEGORY_ICONS: Record<PhraseCategoryId, LucideIcon> = {
  allergies: ShieldAlert,
  needs: LifeBuoy,
  emergency: Siren,
  transport: TrainFront,
  courtesy: Handshake,
};

export const PhrasebookPanel: React.FC<{ countries: CountryInfo[] }> = ({ countries }) => {
  const { t, i18n } = useTranslation();
  const isItalian = i18n.language?.startsWith('it');

  // Una lingua per ogni voce del frasario, con la bandiera del primo paese che la parla.
  const available = useMemo(() => {
    const map = new Map<string, { code: string; label: string; flag: string }>();
    for (const c of countries) {
      for (const { code } of phrasebookLanguagesFor(c.languages)) {
        if (!map.has(code)) map.set(code, { code, label: LANGUAGES[code].name, flag: c.code });
      }
    }
    return [...map.values()];
  }, [countries]);

  const uncovered = useMemo(() => {
    const covered = new Set(Object.values(LANGUAGES).map((l) => l.name));
    return [...new Set(countries.flatMap((c) => c.languages))].filter(
      (name) => ![...covered].some((n) => name === n || name.startsWith(`${n} `))
    );
  }, [countries]);

  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState<PhraseDef | null>(null);

  const active = selected && available.some((a) => a.code === selected) ? selected : (available[0]?.code ?? null);
  const language = active ? LANGUAGES[active] : null;

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
            ? t('countryInfo.phrasebook.fallbackLanguages', { languages: uncovered.join(', ') })
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
  const BigIcon = shown ? CATEGORY_ICONS[shown.category] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {available.map((a) => (
          <button
            key={a.code}
            type="button"
            onClick={() => setSelected(a.code)}
            className={`inline-flex items-center gap-2.5 px-5 h-11 rounded-full font-semibold text-sm transition-colors cursor-pointer ${
              a.code === active
                ? 'bg-gold/15 ring-1 ring-gold/40 text-deep-blue dark:text-gold-light'
                : 'bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:hover:bg-white/10'
            }`}
          >
            <CountryFlag code={a.flag} size="md" />
            {a.label}
          </button>
        ))}
        <div className="relative w-full sm:w-72 sm:ml-auto">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            className="!pl-11"
            placeholder={t('countryInfo.phrasebook.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {grouped.length === 0 && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">{t('countryInfo.phrasebook.noResults')}</p>
      )}

      {grouped.map(({ category, phrases }) => {
        const Icon = CATEGORY_ICONS[category];
        return (
          <section key={category}>
            <h3 className="font-poppins font-semibold text-xl mb-3 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              {t(`countryInfo.phrasebook.categories.${category}`)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {phrases.map((p) => {
                const [local, pron] = language.phrases[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setShown(p)}
                    className="card card-compact text-left cursor-pointer flex flex-col gap-1"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {phraseLabel(p)}
                    </span>
                    <span
                      className="text-xl font-semibold"
                      dir={language.rtl ? 'rtl' : undefined}
                      lang={active}
                    >
                      {local}
                    </span>
                    <span className="text-sm text-gold-dark dark:text-gold-light italic">{pron}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {uncovered.length > 0 && translateFallback}

      {/* Vista "schermo grande": da mostrare a una persona del posto */}
      <Modal open={shown !== null} onClose={() => setShown(null)} title={shown ? phraseLabel(shown) : ''} maxWidth="max-w-4xl">
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
