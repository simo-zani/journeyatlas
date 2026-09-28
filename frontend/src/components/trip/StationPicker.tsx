import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, Train, X } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { PickerInput } from '@/components/trip/CityPicker';
import {
  loadTrainStations,
  recommendedStationGroups,
  searchTrainStations,
  stationByNameOrCode,
  type TrainStation,
} from '@/lib/trainStations';
import { useHomeCity } from '@/lib/useHomeCity';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { Destination } from '@/lib/types';

export interface StationPickerProps {
  value: string;
  onChange: (value: string) => void;
  tripDestinations?: Destination[];
  placeholder?: string;
  ariaLabel?: string;
}

interface StationOption {
  station: TrainStation;
  km: number | null;
  groupLabel: string | null;
}

export const StationPicker: React.FC<StationPickerProps> = ({
  value,
  onChange,
  tripDestinations = [],
  placeholder,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const homeCity = useHomeCity();
  const [stations, setStations] = useState<TrainStation[] | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipReopen = useRef(false);
  const uid = useId();
  const listboxId = `station-listbox-${uid}`;

  useEffect(() => {
    let active = true;
    void loadTrainStations().then((all) => {
      if (active) setStations(all);
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

  const selected = useMemo(
    () => (stations ? stationByNameOrCode(stations, value) : null),
    [stations, value]
  );

  const options = useMemo<StationOption[]>(() => {
    if (!stations) return [];
    const query = value.trim();

    // Se non c'è query, mostra i gruppi raccomandati (casa e mete) o le stazioni principali
    if (query.length === 0) {
      const groups = recommendedStationGroups(stations, {
        homeCity,
        destinations: tripDestinations,
      });

      if (groups.length > 0) {
        const fromGroups: StationOption[] = [];
        for (const group of groups) {
          group.items.forEach((item, i) => {
            fromGroups.push({
              station: item.station,
              km: item.km,
              groupLabel: i === 0 ? t('transport.nearStations', { city: group.label }) : null,
            });
          });
        }
        return fromGroups;
      }

      // Fallback: stazioni principali
      const major = stations.filter((s) => s.major).slice(0, 10);
      return major.map((station, i) => ({
        station,
        km: null,
        groupLabel: i === 0 ? t('transport.majorStations') : null,
      }));
    }

    const results = searchTrainStations(stations, query);
    return results.map((station) => ({
      station,
      km: null,
      groupLabel: t('transport.stationResults'),
    }));
  }, [stations, homeCity, tripDestinations, value, t]);

  const isHeader = (option: StationOption, i: number) =>
    option.groupLabel !== null && (i === 0 || options[i - 1].groupLabel !== option.groupLabel);

  const pick = (option: StationOption) => {
    skipReopen.current = true;
    onChange(option.station.name);
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
        placeholder={placeholder ?? t('transport.stationPlaceholder')}
        leading={
          selected ? (
            <span className="shrink-0 rounded-md bg-gold/15 px-1.5 py-0.5 text-xs font-bold text-gold">
              {selected.code}
            </span>
          ) : (
            <Search className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          )
        }
        trailing={
          stations === null ? (
            <Loader2 className={`${MODAL_ICON_SIZE} text-gold animate-spin shrink-0`} />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              aria-label={t('transport.stationClear')}
              className="text-slate-400 hover:text-error transition-colors shrink-0"
            >
              <X className={MODAL_ICON_SIZE} />
            </button>
          ) : null
        }
        role="combobox"
        ariaLabel={ariaLabel ?? t('transport.station')}
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
                <React.Fragment key={`${option.station.id}-${i}`}>
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
                        code={option.station.country}
                        label={`${option.station.name}, ${option.station.city}`}
                      />
                      <span className="font-medium truncate">{option.station.name}</span>
                      <span className="ml-auto flex items-center gap-2 text-xs text-slate-400 shrink-0">
                        {option.km !== null && <span>{Math.round(option.km)} km</span>}
                        <span className="font-semibold text-slate-500 dark:text-slate-300">
                          {option.station.code}
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

      {open && options.length === 0 && stations !== null && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] px-3 py-2 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Train className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          {value.trim()
            ? t('transport.stationNoResults', { value: value.trim() })
            : t('transport.stationStartTyping')}
        </div>
      )}
    </div>
  );
};
