import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Globe2, GripVertical, MapPin, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { CountryFlag } from '@/components/CountryFlag';
import { CountrySelect } from '@/components/CountrySelect';
import { DestinationPicker } from '@/components/DestinationPicker';
import { Modal } from '@/components/Modal';
import { countryOptions } from '@/lib/countryCodes';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { Destination } from '@/lib/types';

interface ItineraryEditorProps {
  /** Mete del viaggio, nell'ordine dell'itinerario. */
  value: Destination[];
  onChange: (value: Destination[]) => void;
  /**
   * 'memory' (viaggio rapido): un riquadro per paese; si scelgono anche paesi senza
   * città (mete "solo paese"); niente città doppie; l'ordine conta poco.
   * 'full' (viaggio completo): l'ordine è l'itinerario. Un riquadro per ogni tappa
   * consecutiva nello stesso paese, così si può andare avanti e indietro tra paesi
   * (Italia → Francia → Italia); le città si trascinano ovunque, anche tra paesi.
   */
  mode: 'memory' | 'full';
}

interface Item {
  d: Destination;
  /** Posizione nell'elenco delle mete (full) o nel riquadro (memory). */
  idx: number;
}

interface Group {
  key: string;
  /** Alpha-2 maiuscolo; '' per le mete inserite a mano senza paese. */
  code: string;
  items: Item[];
}

const codeOf = (d: Destination) => (d.countryCode ?? '').toUpperCase();
const sameCity = (a: Destination, b: Destination) =>
  a.city.trim().toLowerCase() === b.city.trim().toLowerCase() && codeOf(a) === codeOf(b);

export const ItineraryEditor: React.FC<ItineraryEditorProps> = ({ value, onChange, mode }) => {
  const { t, i18n } = useTranslation();
  const options = useMemo(() => countryOptions(i18n.language), [i18n.language]);
  const nameOf = (code: string) => options.find((o) => o.code === code)?.name ?? code;
  const memory = mode === 'memory';

  const groups = useMemo<Group[]>(() => {
    const list: Group[] = [];
    if (memory) {
      // un riquadro per paese
      for (const d of value) {
        const code = codeOf(d);
        let g = list.find((x) => x.code === code);
        if (!g) {
          g = { key: `country-${code}`, code, items: [] };
          list.push(g);
        }
        if (d.city) g.items.push({ d, idx: g.items.length });
      }
    } else {
      // un riquadro per ogni tappa consecutiva nello stesso paese
      value.forEach((d, idx) => {
        if (!d.city) return;
        const code = codeOf(d);
        const last = list[list.length - 1];
        if (last && last.code === code) last.items.push({ d, idx });
        else list.push({ key: `stop-${list.length}`, code, items: [{ d, idx }] });
      });
    }
    return list;
  }, [value, memory]);
  const cities = useMemo(() => value.filter((d) => d.city), [value]);
  const countries = [...new Set(groups.map((g) => g.code).filter(Boolean))];

  // ---------------------------------------------------------------- modifiche
  // Viaggio rapido: si ricompongono le mete dai riquadri (città, oppure il solo paese).
  const commitMemory = (next: Group[]) =>
    onChange(
      next.flatMap((g) =>
        g.items.length > 0
          ? g.items.map((i) => i.d)
          : g.code
            ? [{ city: '', country: nameOf(g.code), countryCode: g.code.toLowerCase(), coords: null }]
            : []
      )
    );
  const cloneGroups = () => groups.map((g) => ({ ...g, items: [...g.items] }));

  const addCountry = (code: string) => {
    if (code && !groups.some((g) => g.code === code)) commitMemory([...cloneGroups(), { key: `country-${code}`, code, items: [] }]);
  };
  // DestinationPicker restituisce l'elenco con la nuova città in fondo.
  const addFromPicker = (next: Destination[]) => {
    if (next.length <= cities.length) return;
    const added = next[next.length - 1];
    if (!memory) {
      onChange([...value, added]); // in coda all'itinerario
      return;
    }
    if (cities.some((c) => sameCity(c, added))) return;
    const list = cloneGroups();
    const g = list.find((x) => x.code === codeOf(added));
    if (g) g.items.push({ d: added, idx: g.items.length });
    else list.push({ key: `country-${codeOf(added)}`, code: codeOf(added), items: [{ d: added, idx: 0 }] });
    commitMemory(list);
  };
  const removeGroup = (key: string) => {
    const g = groups.find((x) => x.key === key);
    if (!g) return;
    if (memory) commitMemory(cloneGroups().filter((x) => x.key !== key));
    else {
      const drop = new Set(g.items.map((i) => i.idx));
      onChange(value.filter((_, i) => !drop.has(i)));
    }
  };
  const removeCity = (g: Group, item: Item) => {
    if (memory) {
      // il paese resta anche senza città (ci si è stati comunque)
      commitMemory(cloneGroups().map((x) => (x.key === g.key ? { ...x, items: x.items.filter((i) => i !== item) } : x)));
    } else {
      onChange(value.filter((_, i) => i !== item.idx));
    }
  };

  // ---------------------------------------------------------------- riordino
  const [dragging, setDragging] = useState<{ kind: 'group' | 'city'; key: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const cityKey = (g: Group, item: Item) => (memory ? `${g.key}#${item.idx}` : `#${item.idx}`);
  const endDrag = () => {
    setDragging(null);
    setDropTarget(null);
  };

  const moveGroup = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    const list = cloneGroups();
    const moving = list.find((g) => g.key === fromKey);
    if (!moving) return;
    const fromPos = list.indexOf(moving);
    const rest = list.filter((g) => g !== moving);
    const toPos = rest.findIndex((g) => g.key === toKey);
    // trascinando in avanti si finisce dopo il riquadro di arrivo, all'indietro prima
    rest.splice(fromPos < list.findIndex((g) => g.key === toKey) ? toPos + 1 : toPos, 0, moving);
    if (memory) commitMemory(rest);
    else onChange(rest.flatMap((g) => g.items.map((i) => i.d)));
  };

  const moveCity = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    if (memory) {
      const [groupKey, fromIdx] = fromKey.split('#');
      const toIdx = Number(toKey.split('#')[1]);
      const list = cloneGroups();
      const g = list.find((x) => x.key === groupKey);
      if (!g) return;
      const [moving] = g.items.splice(Number(fromIdx), 1);
      g.items.splice(toIdx, 0, moving);
      commitMemory(list);
      return;
    }
    // viaggio completo: la città si sposta in quel punto dell'itinerario, anche in un altro paese
    const from = Number(fromKey.slice(1));
    const to = Number(toKey.slice(1));
    const next = [...value];
    const [moving] = next.splice(from, 1);
    next.splice(to, 0, moving); // in avanti finisce dopo la città di arrivo, all'indietro prima
    onChange(next);
  };

  // Città trascinabile su questa? Nel rapido solo dentro il suo paese, nel completo ovunque.
  const canDropCity = (g: Group) => dragging?.kind === 'city' && (!memory || dragging.key.startsWith(`${g.key}#`));

  // Riquadro con città da togliere: si chiede conferma.
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const removingGroup = groups.find((g) => g.key === removingKey) ?? null;
  const askRemoveGroup = (g: Group) => (g.items.length ? setRemovingKey(g.key) : removeGroup(g.key));
  const groupName = (code: string) => (code ? nameOf(code) : t('memory.noCountry'));
  const draggableCities = memory ? (g: Group) => g.items.length > 1 : () => cities.length > 1;

  return (
    <div className="space-y-3">
      {memory && (
        <div>
          <label className="label !flex items-center gap-2">
            <Globe2 className={`${MODAL_ICON_SIZE} shrink-0`} />
            {t('memory.countries')}
          </label>
          <CountrySelect
            value=""
            onChange={addCountry}
            options={options.filter((o) => !countries.includes(o.code))}
            noneLabel={t('memory.addCountry')}
            searchPlaceholder={t('memory.searchCountry')}
          />
          {countries.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {groups
                .filter((g) => g.code)
                .map((g) => (
                  <li
                    key={g.key}
                    className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full bg-gold/10 ring-1 ring-gold/30 text-sm font-semibold"
                  >
                    <CountryFlag code={g.code} size="xs" />
                    {nameOf(g.code)}
                    <button
                      type="button"
                      onClick={() => askRemoveGroup(g)}
                      aria-label={t('common.remove')}
                      title={t('common.remove')}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-error hover:bg-error/10 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <DestinationPicker
          value={cities}
          onChange={addFromPicker}
          label={
            memory ? (
              <>
                <Building2 className={`${MODAL_ICON_SIZE} shrink-0`} />
                {t('memory.cities')}
              </>
            ) : (
              t('trip.destinations')
            )
          }
          hideList
        />
        {memory && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('memory.citiesHint')}</p>}
      </div>

      {groups.length > 0 && (
        <ul className="space-y-2">
          {groups.map((g) => (
            <li
              key={g.key}
              draggable={groups.length > 1}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                setDragging({ kind: 'group', key: g.key });
              }}
              onDragOver={(e) => {
                if (dragging?.kind !== 'group') return;
                e.preventDefault();
                setDropTarget(g.key);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging?.kind === 'group') moveGroup(dragging.key, g.key);
                endDrag();
              }}
              onDragEnd={endDrag}
              className={`rounded-xl bg-slate-900/5 dark:bg-white/5 px-[14px] py-2.5 transition-[opacity,box-shadow] ${
                dragging?.kind === 'group' && dragging.key === g.key ? 'opacity-40' : ''
              } ${dragging?.kind === 'group' && dropTarget === g.key && dragging.key !== g.key ? 'ring-2 ring-gold/60' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                {groups.length > 1 && (
                  <GripVertical
                    className="w-[16px] h-[16px] -ml-1 text-slate-400 cursor-grab active:cursor-grabbing shrink-0"
                    aria-label={t('memory.dragToReorder')}
                  />
                )}
                {g.code ? <CountryFlag code={g.code} size="sm" /> : <MapPin className="w-5 h-5 text-slate-400" />}
                <span className="flex-1 min-w-0 truncate text-sm font-semibold">{groupName(g.code)}</span>
                {g.items.length > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    {t('memory.citiesCount', { count: g.items.length })}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => askRemoveGroup(g)}
                  aria-label={t('common.remove')}
                  title={t('common.remove')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-error hover:bg-error/10 cursor-pointer shrink-0"
                >
                  <X className="w-[16px] h-[16px]" strokeWidth={2.5} />
                </button>
              </div>
              {g.items.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5 pl-[34px]">
                  {g.items.map((item) => {
                    const key = cityKey(g, item);
                    const canDrag = draggableCities(g);
                    return (
                      <li
                        key={`${key}-${item.d.city}`}
                        draggable={canDrag}
                        onDragStart={(e) => {
                          e.stopPropagation(); // non trascinare anche il riquadro
                          e.dataTransfer.effectAllowed = 'move';
                          setDragging({ kind: 'city', key });
                        }}
                        onDragOver={(e) => {
                          if (!canDropCity(g)) return;
                          e.preventDefault();
                          e.stopPropagation();
                          setDropTarget(key);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (dragging?.kind === 'city') moveCity(dragging.key, key);
                          endDrag();
                        }}
                        onDragEnd={endDrag}
                        title={canDrag ? t('memory.dragToReorder') : undefined}
                        className={`inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-[var(--surface-1)] ring-1 text-xs font-medium transition-[opacity,box-shadow] ${
                          canDrag ? 'cursor-grab active:cursor-grabbing' : ''
                        } ${dragging?.kind === 'city' && dragging.key === key ? 'opacity-40' : ''} ${
                          dragging?.kind === 'city' && dropTarget === key && dragging.key !== key ? 'ring-gold' : 'ring-[var(--border-subtle)]'
                        }`}
                      >
                        {item.d.city}
                        <button
                          type="button"
                          onClick={() => removeCity(g, item)}
                          aria-label={t('common.remove')}
                          title={t('common.remove')}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-error hover:bg-error/10 cursor-pointer"
                        >
                          <X className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      {!memory && cities.length > 1 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('memory.itineraryHint')}</p>
      )}

      <Modal
        open={removingGroup !== null}
        onClose={() => setRemovingKey(null)}
        title={t('memory.removeCountryTitle', {
          country: removingGroup ? groupName(removingGroup.code) : '',
          interpolation: { escapeValue: false },
        })}
        maxWidth="max-w-sm"
      >
        {removingGroup && (
          <div className="space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('memory.removeCountryBody', {
                count: removingGroup.items.length,
                cities: removingGroup.items.map((i) => i.d.city).join(', '),
                // React protegge già il testo: senza questo "L'Aquila" diventerebbe "L&#39;Aquila"
                interpolation: { escapeValue: false },
              })}
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="tertiary" onClick={() => setRemovingKey(null)}>
                {t('common.cancel')}
              </Button>
              <button
                type="button"
                onClick={() => {
                  removeGroup(removingGroup.key);
                  setRemovingKey(null);
                }}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold text-white bg-error hover:bg-red-600 cursor-pointer"
              >
                {t('common.remove')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
