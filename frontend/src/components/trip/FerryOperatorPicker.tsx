import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Anchor, Loader2, Search, X } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { PickerInput } from '@/components/trip/CityPicker';
import {
  loadFerryOperators,
  searchFerryOperators,
  ferryOperatorByName,
  type FerryOperator,
} from '@/lib/ferryOperators';
import { MODAL_ICON_SIZE } from '@/lib/ui';

export interface FerryOperatorPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * Logo della compagnia marittima con vettoriali per i marchi principali
 * (Moby, GNV, Tirrenia, Grimaldi, MSC) e fallback d'immagine o monogramma.
 */
export const FerryOperatorLogo: React.FC<{
  operator: FerryOperator;
  className?: string;
  style?: React.CSSProperties;
}> = ({ operator, className = 'w-6 h-6', style }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [operator.logo]);

  // Vettoriali dedicati per le principali compagnie marittime italiane
  if (operator.id === 'moby') {
    return (
      <svg viewBox="0 0 32 32" className={`${className} shrink-0`} style={style} aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#003380" />
        <path d="M6 18c3-4 8-5 14-3 3 1 5 4 6 5-2 1-6 2-10 1-4-1-7-1-10-3z" fill="#ffd200" />
        <circle cx="11" cy="16.5" r="1.2" fill="#003380" />
      </svg>
    );
  }

  if (operator.id === 'gnv') {
    return (
      <svg viewBox="0 0 32 32" className={`${className} shrink-0`} style={style} aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#002244" />
        <path d="M5 20c6-3 14-3 22 0-7 2-15 2-22 0z" fill="#009fe3" />
        <text
          x="16"
          y="15.5"
          fill="#ffffff"
          fontFamily="Poppins, sans-serif"
          fontWeight="bold"
          fontSize="8.5"
          textAnchor="middle"
          letterSpacing="-0.3"
        >
          GNV
        </text>
      </svg>
    );
  }

  if (operator.id === 'tirrenia') {
    return (
      <svg viewBox="0 0 32 32" className={`${className} shrink-0`} style={style} aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#002855" />
        <path d="M4 11h24v3H18v12h-4V14H4z" fill="#ffffff" />
        <path d="M18 11l6 6h-6z" fill="#cc1b24" />
      </svg>
    );
  }

  if (operator.id === 'grimaldi') {
    return (
      <svg viewBox="0 0 32 32" className={`${className} shrink-0`} style={style} aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#001a4d" />
        <path d="M8 9l8 4 8-4-3 14H11z" fill="#ffcc00" />
        <circle cx="16" cy="18" r="2.5" fill="#001a4d" />
      </svg>
    );
  }

  if (operator.id === 'msc-cruises') {
    return (
      <svg viewBox="0 0 32 32" className={`${className} shrink-0`} style={style} aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#0a1d37" />
        <path d="M16 6l2 7 7 3-7 3-2 7-2-7-7-3 7-3z" fill="#c29b38" />
        <circle cx="16" cy="16" r="2" fill="#ffffff" />
      </svg>
    );
  }

  if (!operator.logo || failed) {
    return (
      <span
        className={`${className} rounded-md text-white text-[10px] font-bold flex items-center justify-center shrink-0 uppercase tracking-tight`}
        style={{
          background: `linear-gradient(135deg, ${operator.gradient[0]}, ${operator.gradient[1]})`,
          ...style,
        }}
        aria-hidden="true"
      >
        {operator.code.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={operator.logo}
      alt=""
      aria-hidden="true"
      width={24}
      height={24}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} object-contain shrink-0`}
      style={style}
    />
  );
};

export const FerryOperatorPicker: React.FC<FerryOperatorPickerProps> = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const [operators, setOperators] = useState<FerryOperator[] | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipReopen = useRef(false);
  const uid = useId();
  const listboxId = `ferry-operator-listbox-${uid}`;

  useEffect(() => {
    let active = true;
    void loadFerryOperators().then((all) => {
      if (active) setOperators(all);
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
    () => (operators ? ferryOperatorByName(operators, value) : null),
    [operators, value]
  );

  const options = useMemo(
    () => (operators ? searchFerryOperators(operators, value) : []),
    [operators, value]
  );

  const pick = (operator: FerryOperator) => {
    skipReopen.current = true;
    onChange(operator.name);
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
        placeholder={placeholder ?? t('transport.ferryOperatorPlaceholder')}
        leading={
          selected ? (
            <FerryOperatorLogo operator={selected} />
          ) : (
            <Search className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          )
        }
        trailing={
          operators === null ? (
            <Loader2 className={`${MODAL_ICON_SIZE} text-gold animate-spin shrink-0`} />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              aria-label={t('transport.ferryOperatorClear')}
              className="text-slate-400 hover:text-error transition-colors shrink-0"
            >
              <X className={MODAL_ICON_SIZE} />
            </button>
          ) : null
        }
        role="combobox"
        ariaLabel={ariaLabel ?? t('transport.ferryOperator')}
        ariaControls={listboxId}
        ariaExpanded={showList}
        ariaActiveDescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
      />

      {showList && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] overflow-hidden max-h-72 overflow-y-auto">
          <p className="text-xs text-slate-400 px-3 pt-2 pb-1 font-medium uppercase tracking-wider sticky top-0 bg-white dark:bg-[#0f1c35]">
            {value.trim() ? t('transport.ferryOperatorResults') : t('transport.popularFerryOperators')}
          </p>
          <ul id={listboxId} role="listbox">
            {options.map((operator, i) => (
              <li
                key={operator.id}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={activeIndex === i}
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(operator)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                    activeIndex === i ? 'bg-gold/10' : 'hover:bg-gold/10'
                  }`}
                >
                  <FerryOperatorLogo operator={operator} />
                  <span className="font-medium truncate">{operator.name}</span>
                  <span className="ml-auto flex items-center justify-end gap-2.5 shrink-0 w-24">
                    <CountryFlag code={operator.country} size="md" />
                    <span className="w-12 text-right font-semibold text-xs text-slate-500 dark:text-slate-400 truncate">
                      {operator.code}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && options.length === 0 && operators !== null && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] px-3 py-2 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Anchor className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          {value.trim()
            ? t('transport.ferryOperatorNoResults', { value: value.trim() })
            : t('transport.ferryOperatorStartTyping')}
        </div>
      )}
    </div>
  );
};
