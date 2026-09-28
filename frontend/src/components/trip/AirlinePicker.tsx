import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plane, Search, X } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { PickerInput } from '@/components/trip/CityPicker';
import { airlineByName, loadAirlines, searchAirlines, type Airline } from '@/lib/airlines';
import { MODAL_ICON_SIZE } from '@/lib/ui';

export interface AirlinePickerProps {
  /** Testo libero mostrato nel campo: il nome della compagnia scelta, altrimenti
   *  quello digitato. È anche il valore salvato, quindi resta una stringa. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * Logo della compagnia, con l'iniziale al posto se l'immagine non si carica.
 *
 * Il logo è un PNG esterno: se il file non c'è più o la rete lo blocca, senza
 * questo fallback nella lista compare un buco e nel campo un'icona spaiata.
 */
const AirlineLogo: React.FC<{ airline: Airline; className?: string }> = ({
  airline,
  className = 'w-6 h-6',
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [airline.logo]);

  if (!airline.logo || failed) {
    return (
      <span
        className={`${className} rounded-md bg-gold/15 text-gold text-[10px] font-bold flex items-center justify-center shrink-0 uppercase`}
        aria-hidden="true"
      >
        {airline.name.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={airline.logo}
      alt=""
      aria-hidden="true"
      width={24}
      height={24}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} object-contain shrink-0`}
    />
  );
};

export const AirlinePicker: React.FC<AirlinePickerProps> = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const [airlines, setAirlines] = useState<Airline[] | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipReopen = useRef(false);
  const uid = useId();
  const listboxId = `airline-listbox-${uid}`;

  // L'elenco è un chunk separato: entra nel bundle solo quando si apre un form
  // di trasporto, non all'avvio dell'app.
  useEffect(() => {
    let active = true;
    void loadAirlines().then((all) => {
      if (active) setAirlines(all);
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

  /** Il logo e il codice si mostrano solo se il testo è il nome esatto di una
   *  compagnia dell'elenco: digitando "ita" non deve comparire il badge AZ. */
  const selected = useMemo(
    () => (airlines ? airlineByName(airlines, value) : null),
    [airlines, value]
  );

  const options = useMemo(
    () => (airlines ? searchAirlines(airlines, value) : []),
    [airlines, value]
  );

  const pick = (airline: Airline) => {
    skipReopen.current = true;
    onChange(airline.name);
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

  // Scegliere dalla lista non è una digitazione: senza questo controllo la lista
  // si riaprirebbe con la compagnia scelta in cima, come se fosse un risultato.
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
        placeholder={placeholder ?? t('transport.airlinePlaceholder')}
        leading={
          selected ? (
            <AirlineLogo airline={selected} />
          ) : (
            <Search className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          )
        }
        trailing={
          airlines === null ? (
            <Loader2 className={`${MODAL_ICON_SIZE} text-gold animate-spin shrink-0`} />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              aria-label={t('transport.airlineClear')}
              className="text-slate-400 hover:text-error transition-colors shrink-0"
            >
              <X className={MODAL_ICON_SIZE} />
            </button>
          ) : null
        }
        role="combobox"
        ariaLabel={ariaLabel ?? t('transport.airline')}
        ariaControls={listboxId}
        ariaExpanded={showList}
        ariaActiveDescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
      />

      {showList && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] overflow-hidden max-h-72 overflow-y-auto">
          <p className="text-xs text-slate-400 px-3 pt-2 pb-1 font-medium uppercase tracking-wider sticky top-0 bg-white dark:bg-[#0f1c35]">
            {t('transport.airlineResults')}
          </p>
          <ul id={listboxId} role="listbox">
            {options.map((airline, i) => (
              <li
                key={airline.iata}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={activeIndex === i}
              >
                <button
                  type="button"
                  // Impedisce che il mousedown chiuda il dropdown prima del click.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(airline)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                    activeIndex === i ? 'bg-gold/10' : 'hover:bg-gold/10'
                  }`}
                >
                  <AirlineLogo airline={airline} />
                  <span className="font-medium truncate">{airline.name}</span>
                  <span className="ml-auto flex items-center gap-2 shrink-0">
                    <CountryFlag code={airline.country} size="sm" />
                    <span className="font-semibold text-slate-500 dark:text-slate-300">
                      {airline.iata}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && options.length === 0 && airlines !== null && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] px-3 py-2 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Plane className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          {value.trim()
            ? t('transport.airlineNoResults', { value: value.trim() })
            : t('transport.airlineStartTyping')}
        </div>
      )}
    </div>
  );
};
