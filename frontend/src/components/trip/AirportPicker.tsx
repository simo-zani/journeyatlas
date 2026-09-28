import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plane, Search, X } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { PickerInput } from '@/components/trip/CityPicker';
import {
  airportByIata,
  loadAirports,
  recommendedAirportGroups,
  searchAirports,
  type Airport,
} from '@/lib/airports';
import { useHomeCity } from '@/lib/useHomeCity';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { Destination } from '@/lib/types';

export interface AirportPickerProps {
  /** Testo libero mostrato nel campo: il codice IATA se si è scelto un
   *  aeroporto dall'elenco, altrimenti quello digitato. */
  value: string;
  onChange: (value: string) => void;
  tripDestinations: Destination[];
  placeholder?: string;
  ariaLabel?: string;
}

interface AirportOption {
  airport: Airport;
  /** Distanza dal punto di riferimento, null per i risultati di ricerca. */
  km: number | null;
  /** Intestazione del gruppo: va scritta solo sulla prima riga. */
  groupLabel: string | null;
}

export const AirportPicker: React.FC<AirportPickerProps> = ({
  value,
  onChange,
  tripDestinations,
  placeholder,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const homeCity = useHomeCity();
  const [airports, setAirports] = useState<Airport[] | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipReopen = useRef(false);
  const uid = useId();
  const listboxId = `airport-listbox-${uid}`;

  // L'elenco è un chunk separato: entra nel bundle solo quando un campo
  // aeroporto viene aperto, non all'avvio dell'app.
  useEffect(() => {
    let active = true;
    void loadAirports().then((all) => {
      if (active) setAirports(all);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => setActiveIndex(-1), [value]);

  /** Il codice IATA nel campo è l'unico modo di sapere se il testo corrente
   *  è un aeroporto del nostro elenco: senza questo, cercando "Milano" il
   *  badge mostrerebbe MXP nonostante l'utente non abbia ancora scelto nulla. */
  const selected = useMemo(
    () => (airports && /^[A-Za-z]{3}$/.test(value.trim()) ? airportByIata(airports, value) : null),
    [airports, value]
  );

  const options = useMemo<AirportOption[]>(() => {
    if (!airports) return [];
    const groups = recommendedAirportGroups(airports, { homeCity, destinations: tripDestinations });
    const fromGroups: AirportOption[] = [];
    for (const group of groups) {
      group.items.forEach((item, i) => {
        fromGroups.push({
          airport: item.airport,
          km: item.km,
          groupLabel: i === 0 ? t('transport.nearAirports', { city: group.label }) : null,
        });
      });
    }

    const query = value.trim();
    if (query.length === 0) return fromGroups;

    const shown = new Set(fromGroups.map((o) => o.airport.iata));
    const results = searchAirports(airports, query).filter((a) => !shown.has(a.iata));
    return [
      ...fromGroups,
      ...results.map((airport) => ({
        airport,
        km: null,
        groupLabel: t('transport.airportResults'),
      })),
    ];
  }, [airports, homeCity, tripDestinations, value, t]);

  // Come nel city picker: una riga di intestazione può stare solo sulla prima
  // opzione di un gruppo, altrimenti il testo si ripete a ogni aeroporto.
  const isHeader = (option: AirportOption, i: number) =>
    option.groupLabel !== null && (i === 0 || options[i - 1].groupLabel !== option.groupLabel);

  const pick = (option: AirportOption) => {
    // Il testo cambia da mano a codice: l'effetto che chiude la lista dopo una
    // scelta deve poter distinguere questo caso da una digitazione.
    skipReopen.current = true;
    onChange(option.airport.iata);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || options.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pick(options[activeIndex]);
    }
  };

  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(`${listboxId}-opt-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listboxId]);

  // Il click su un aeroporto non è una digitazione: senza questo controllo
  // l'opzione scelta resterebbe in cima alla lista come risultato di ricerca.
  useEffect(() => {
    if (!skipReopen.current) return;
    skipReopen.current = false;
    setOpen(false);
  }, [value]);

  const showList = open && options.length > 0;

  return (
    <div ref={ref} className="relative">
      <PickerInput
        value={value}
        onChange={(v) => {
          setOpen(true);
          onChange(v);
        }}
        onFocus={() => {
          if (!skipReopen.current) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        placeholder={placeholder ?? t('transport.airportPlaceholder')}
        leading={
          selected ? (
            <span className="shrink-0 rounded-md bg-gold/15 px-1.5 py-0.5 text-xs font-bold text-gold">
              {selected.iata}
            </span>
          ) : (
            <Search className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          )
        }
        trailing={
          airports === null ? (
            <Loader2 className={`${MODAL_ICON_SIZE} text-gold animate-spin shrink-0`} />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              aria-label={t('transport.airportClear')}
              className="text-slate-400 hover:text-error transition-colors shrink-0"
            >
              <X className={MODAL_ICON_SIZE} />
            </button>
          ) : null
        }
        role="combobox"
        ariaLabel={ariaLabel ?? t('transport.airport')}
        ariaControls={listboxId}
        ariaExpanded={showList}
        ariaActiveDescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
      />

      {showList && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] overflow-hidden max-h-72 overflow-y-auto">
          <ul id={listboxId} role="listbox">
            {options.map((option, i) => {
              const header = isHeader(option, i);
              return (
                <React.Fragment key={`${i}-${option.airport.iata}`}>
                  {header && (
                    <li
                      role="presentation"
                      className={`text-xs text-slate-400 px-3 pt-2 pb-1 font-medium uppercase tracking-wider sticky top-0 bg-white dark:bg-[#0f1c35] ${
                        i > 0 ? 'border-t border-slate-200 dark:border-slate-700 mt-1' : ''
                      }`}
                    >
                      {option.groupLabel}
                    </li>
                  )}
                  <li id={`${listboxId}-opt-${i}`} role="option" aria-selected={activeIndex === i}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(option)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                        activeIndex === i ? 'bg-gold/10' : 'hover:bg-gold/10'
                      }`}
                    >
                      <CountryFlag
                        code={option.airport.country}
                        label={`${option.airport.name}, ${option.airport.city}`}
                      />
                      <span className="font-medium truncate">{option.airport.name}</span>
                      <span className="ml-auto flex items-center gap-2 text-xs text-slate-400 shrink-0">
                        {option.km !== null && <span>{Math.round(option.km)} km</span>}
                        <span className="font-semibold text-slate-500 dark:text-slate-300">
                          {option.airport.iata}
                        </span>
                      </span>
                    </button>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      )}

      {open && options.length === 0 && airports !== null && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] px-3 py-2 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Plane className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          {value.trim() ? t('transport.airportNoResults') : t('transport.airportStartTyping')}
        </div>
      )}
    </div>
  );
};
