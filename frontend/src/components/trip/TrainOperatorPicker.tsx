import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, Train, X } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { PickerInput } from '@/components/trip/CityPicker';
import {
  loadTrainOperators,
  searchTrainOperators,
  trainOperatorByName,
  type TrainOperator,
} from '@/lib/trainOperators';
import { MODAL_ICON_SIZE } from '@/lib/ui';

export interface TrainOperatorPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * Logo dell'operatore ferroviario con rendering vettoriale per Trenitalia / Italo
 * e fallback d'immagine o monogramma con i colori ufficiali dell'operatore.
 */
export const TrainOperatorLogo: React.FC<{
  operator: TrainOperator;
  className?: string;
  style?: React.CSSProperties;
}> = ({ operator, className = 'w-6 h-6', style }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [operator.logo]);

  // Vettoriali nitidi per i due operatori italiani principali
  if (operator.id === 'trenitalia') {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${className} shrink-0`}
        style={style}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="6" fill="#00693e" />
        <path d="M7 11h18v4H18v10h-4V15H7z" fill="#ffffff" />
        <path d="M18 11l7 7h-7z" fill="#c1152a" />
      </svg>
    );
  }

  if (operator.id === 'italo') {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${className} shrink-0`}
        style={style}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="6" fill="#7a0c1a" />
        <text
          x="16"
          y="21"
          fill="#f6cf67"
          fontFamily="Poppins, sans-serif"
          fontWeight="bold"
          fontSize="11"
          textAnchor="middle"
          letterSpacing="-0.5"
        >
          italo
        </text>
      </svg>
    );
  }

  if (operator.id === 'frecciarossa') {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${className} shrink-0`}
        style={style}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="6" fill="#8f0014" />
        <path d="M6 20l12-10 8 4-10 6z" fill="#ffffff" />
        <path d="M18 10l8 4-6 6z" fill="#d91b24" />
      </svg>
    );
  }

  if (operator.id === 'shinkansen') {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${className} shrink-0`}
        style={style}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="6" fill="#003366" />
        <path d="M5 21c6-1 15-4 22-9l1 2c-8 6-15 9-23 9z" fill="#00a0e9" />
        <path d="M7 14h15c3 0 5 2 5 4s-1 3-5 3H7c-2 0-3-1-3-3s1-4 3-4z" fill="#ffffff" />
        <circle cx="20" cy="17.5" r="1.5" fill="#003366" />
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

export const TrainOperatorPicker: React.FC<TrainOperatorPickerProps> = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const [operators, setOperators] = useState<TrainOperator[] | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipReopen = useRef(false);
  const uid = useId();
  const listboxId = `train-operator-listbox-${uid}`;

  useEffect(() => {
    let active = true;
    void loadTrainOperators().then((all) => {
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
    () => (operators ? trainOperatorByName(operators, value) : null),
    [operators, value]
  );

  const options = useMemo(
    () => (operators ? searchTrainOperators(operators, value) : []),
    [operators, value]
  );

  const pick = (operator: TrainOperator) => {
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
        placeholder={placeholder ?? t('transport.trainOperatorPlaceholder')}
        leading={
          selected ? (
            <TrainOperatorLogo operator={selected} />
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
              aria-label={t('transport.trainOperatorClear')}
              className="text-slate-400 hover:text-error transition-colors shrink-0"
            >
              <X className={MODAL_ICON_SIZE} />
            </button>
          ) : null
        }
        role="combobox"
        ariaLabel={ariaLabel ?? t('transport.operator')}
        ariaControls={listboxId}
        ariaExpanded={showList}
        ariaActiveDescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
      />

      {showList && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] overflow-hidden max-h-72 overflow-y-auto">
          <p className="text-xs text-slate-400 px-3 pt-2 pb-1 font-medium uppercase tracking-wider sticky top-0 bg-white dark:bg-[#0f1c35]">
            {value.trim() ? t('transport.trainOperatorResults') : t('transport.popularOperators')}
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
                  <TrainOperatorLogo operator={operator} />
                  <span className="font-medium truncate">{operator.name}</span>
                  <span className="ml-auto flex items-center justify-end gap-2 shrink-0 w-20">
                    <CountryFlag code={operator.country} size="md" />
                    <span className="w-10 text-right font-semibold text-xs text-slate-500 dark:text-slate-400 truncate">
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
          <Train className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          {value.trim()
            ? t('transport.trainOperatorNoResults', { value: value.trim() })
            : t('transport.trainOperatorStartTyping')}
        </div>
      )}
    </div>
  );
};
