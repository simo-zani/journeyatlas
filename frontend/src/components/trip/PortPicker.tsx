import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Anchor, Loader2, Search, X } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { PickerInput } from '@/components/trip/CityPicker';
import {
  loadFerryPorts,
  recommendedPortGroups,
  searchFerryPorts,
  portByNameOrCode,
  type FerryPort,
} from '@/lib/ferryPorts';
import { useHomeCity } from '@/lib/useHomeCity';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { Destination } from '@/lib/types';

export interface PortPickerProps {
  value: string;
  onChange: (value: string) => void;
  tripDestinations?: Destination[];
  placeholder?: string;
  ariaLabel?: string;
}

interface PortOption {
  port: FerryPort;
  km: number | null;
  groupLabel: string | null;
}

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-xs text-slate-400 px-3 pt-3 pb-1 font-medium uppercase tracking-wider sticky top-0 bg-white dark:bg-[#0f1c35]">
    {label}
  </p>
);

const PortItem: React.FC<{
  opt: PortOption;
  index: number;
  listboxId: string;
  activeIndex: number;
  onPick: (p: FerryPort) => void;
  onHover: (i: number) => void;
}> = ({ opt, index, listboxId, activeIndex, onPick, onHover }) => {
  const { port, km } = opt;
  return (
    <li
      id={`${listboxId}-opt-${index}`}
      role="option"
      aria-selected={activeIndex === index}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onPick(port)}
        onMouseEnter={() => onHover(index)}
        className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
          activeIndex === index ? 'bg-gold/10' : 'hover:bg-gold/10'
        }`}
      >
        <span
          className="w-6 h-6 rounded-md bg-light-blue/15 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Anchor className="w-3.5 h-3.5 text-light-blue" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="font-medium truncate block">{port.name}</span>
          {port.city && port.city.toLowerCase() !== port.name.toLowerCase() && (
            <span className="text-xs text-slate-400 truncate block">{port.city}</span>
          )}
        </span>
        <span className="ml-auto flex items-center justify-end gap-2.5 shrink-0 w-24">
          <CountryFlag code={port.country} size="md" />
          <span className="w-12 text-right font-semibold text-xs text-slate-500 dark:text-slate-400 truncate">
            {km != null ? `${Math.round(km)} km` : port.code}
          </span>
        </span>
      </button>
    </li>
  );
};

export const PortPicker: React.FC<PortPickerProps> = ({
  value,
  onChange,
  tripDestinations = [],
  placeholder,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const [ports, setPorts] = useState<FerryPort[] | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipReopen = useRef(false);
  const uid = useId();
  const listboxId = `port-picker-listbox-${uid}`;
  const homeCity = useHomeCity();

  useEffect(() => {
    let active = true;
    void loadFerryPorts().then((all) => {
      if (active) setPorts(all);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setActiveIndex(-1); }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => setActiveIndex(-1), [value]);

  const options = useMemo((): PortOption[] => {
    if (!ports) return [];
    const q = value.trim();
    if (!q) {
      const groups = recommendedPortGroups(ports, {
        homeCity: homeCity?.city
          ? { city: homeCity.city, coords: homeCity.coords ?? null }
          : null,
        destinations: tripDestinations,
      });
      const result: PortOption[] = [];
      for (const group of groups) {
        for (const { port, km } of group.items) {
          result.push({ port, km, groupLabel: group.label });
        }
      }
      if (result.length === 0) {
        ports.filter((p) => p.major).slice(0, 8).forEach((port) =>
          result.push({ port, km: null, groupLabel: t('transport.majorPorts') })
        );
      }
      return result;
    }
    return searchFerryPorts(ports, q).map((port) => ({ port, km: null, groupLabel: null }));
  }, [ports, value, homeCity, tripDestinations, t]);

  const selected = useMemo(() => (ports ? portByNameOrCode(ports, value) : null), [ports, value]);

  const pick = (port: FerryPort) => {
    skipReopen.current = true;
    onChange(port.name);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || options.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => (i + 1) % options.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); pick(options[activeIndex].port); }
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

  const renderList = () => {
    if (value.trim()) {
      return (
        <>
          <SectionLabel label={t('transport.portResults')} />
          <ul id={listboxId} role="listbox">
            {options.map((opt, i) => (
              <PortItem key={opt.port.id} opt={opt} index={i} listboxId={listboxId}
                activeIndex={activeIndex} onPick={pick} onHover={setActiveIndex} />
            ))}
          </ul>
        </>
      );
    }
    const rendered: React.ReactNode[] = [];
    let lastGroup: string | null = null;
    let flatIndex = 0;
    for (const opt of options) {
      if (opt.groupLabel !== lastGroup) {
        const label = opt.groupLabel
          ? t('transport.nearPorts', { city: opt.groupLabel })
          : t('transport.majorPorts');
        rendered.push(<SectionLabel key={`hdr-${opt.groupLabel ?? 'major'}`} label={label} />);
        lastGroup = opt.groupLabel;
      }
      const i = flatIndex++;
      rendered.push(
        <PortItem key={opt.port.id} opt={opt} index={i} listboxId={listboxId}
          activeIndex={activeIndex} onPick={pick} onHover={setActiveIndex} />
      );
    }
    return <ul id={listboxId} role="listbox">{rendered}</ul>;
  };

  return (
    <div ref={ref} className="relative">
      <PickerInput
        value={value}
        onChange={(v) => { setOpen(true); onChange(v); }}
        onFocus={() => { if (!skipReopen.current) setOpen(true); }}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        placeholder={placeholder ?? t('transport.portPlaceholder')}
        leading={
          selected
            ? <Anchor className={`${MODAL_ICON_SIZE} text-light-blue shrink-0`} />
            : <Search className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
        }
        trailing={
          ports === null
            ? <Loader2 className={`${MODAL_ICON_SIZE} text-gold animate-spin shrink-0`} />
            : value
            ? (
              <button type="button" onClick={() => { onChange(''); setOpen(false); }}
                aria-label={t('transport.portClear')}
                className="text-slate-400 hover:text-error transition-colors shrink-0">
                <X className={MODAL_ICON_SIZE} />
              </button>
            )
            : null
        }
        role="combobox"
        ariaLabel={ariaLabel ?? t('transport.port')}
        ariaControls={listboxId}
        ariaExpanded={showList}
        ariaActiveDescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
      />
      {showList && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] overflow-hidden max-h-72 overflow-y-auto">
          {renderList()}
        </div>
      )}
      {open && options.length === 0 && ports !== null && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] px-3 py-2 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Anchor className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          {value.trim()
            ? t('transport.portNoResults', { value: value.trim() })
            : t('transport.portStartTyping')}
        </div>
      )}
    </div>
  );
};
