import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/Card';
import { CountryFlag } from '@/components/CountryFlag';

export interface FlagBoardCountry {
  code: string;
  name: string;
  continent: string | null;
  visited: boolean;
}

interface CountryFlagsBoardProps {
  countries: FlagBoardCountry[];
  /** Ordine dei continenti; quelli senza paesi non si mostrano. */
  continents: readonly string[];
}

/** Tutti i paesi come bandiere, divisi per continente: quelli sbloccati accesi, gli altri spenti. */
export const CountryFlagsBoard: React.FC<CountryFlagsBoardProps> = ({ countries, continents }) => {
  const { t, i18n } = useTranslation();

  const groups = useMemo(() => {
    const byContinent = new Map<string, FlagBoardCountry[]>();
    for (const c of countries) {
      const key = c.continent ?? 'other';
      byContinent.set(key, [...(byContinent.get(key) ?? []), c]);
    }
    byContinent.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name, i18n.language)));
    return [...continents, 'other']
      .filter((key) => byContinent.has(key))
      .map((key) => ({ key, list: byContinent.get(key)! }));
  }, [countries, continents, i18n.language]);

  return (
    <Card className="card-static !px-6 !py-5">
      <div className="space-y-[32px]">
        {groups.map(({ key, list }) => (
          <section key={key}>
            <h3 className="flex items-baseline gap-2 mb-[16px] text-base">
              {t(`atlas.continent.${key}`, { defaultValue: t('atlas.flags.otherContinent') })}
              <span className="text-sm font-semibold text-slate-400 tabular-nums">
                {list.filter((c) => c.visited).length} / {list.length}
              </span>
            </h3>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-x-3 gap-y-5">
              {list.map((c) => (
                <li
                  key={c.code}
                  className={`flex flex-col items-center gap-2 text-center transition-[opacity,filter] duration-200 ${
                    c.visited ? '' : 'opacity-[.45] grayscale hover:opacity-70 hover:grayscale-0'
                  }`}
                  title={c.name}
                >
                  <CountryFlag code={c.code} size="lg" tight className="shadow-sm ring-1 ring-black/10 dark:ring-white/10" />
                  <span
                    className={`text-[11px] leading-tight line-clamp-2 ${
                      c.visited ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {c.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Card>
  );
};
