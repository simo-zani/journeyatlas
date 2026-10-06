import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { searchDestinations, foldText, type DestinationSuggestion } from '@/lib/countries';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { Coordinates, Destination } from '@/lib/types';

// ─── Picker input ─────────────────────────────────────────────────────────────

/**
 * Input con icona a sinistra e azione a destra, usato dai picker città,
 * aeroporti e piattaforma.
 *
 * Non si appoggia a `pl-11` sull'<input>: `.input-field` è definito in
 * index.css DOPO `@tailwind utilities` e vince il conflitto di padding, quindi
 * l'icona assolutamente posizionata finiva sopra il placeholder. Qui l'icona
 * è un fratello flex del campo, quindi il padding la gestisce il layout e non
 * c'è nulla da sovrascrivere. Stesso approccio di `DestinationPicker`.
 */
export const PickerInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  role?: string;
  ariaLabel?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaActiveDescendant?: string;
  /** Serve per il focus programmatico (es. rilasciare il campo dopo la scelta). */
  inputRef?: React.Ref<HTMLInputElement>;
}> = ({
  value,
  onChange,
  onFocus,
  onKeyDown,
  placeholder,
  leading,
  trailing,
  role,
  ariaLabel,
  ariaControls,
  ariaExpanded,
  ariaActiveDescendant,
  inputRef,
}) => (
  <div className="flex items-center gap-2 input-field focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15">
    {leading}
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      role={role}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-autocomplete={role === 'combobox' ? 'list' : undefined}
      aria-activedescendant={ariaActiveDescendant}
      className="w-full min-w-0 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
    />
    {trailing}
  </div>
);

// ─── City picker (Nominatim, singolo risultato) ───────────────────────────────

export interface CityValue {
  city: string;
  coords: Coordinates | null;
}

export interface CityPickerProps {
  value: CityValue;
  onChange: (value: CityValue) => void;
  /** Mete del viaggio: hanno la priorità assoluta nei suggerimenti. Chi non
   *  ha un viaggio (es. il profilo) passa un array vuoto e ottiene la ricerca
   *  libera. */
  tripDestinations: Destination[];
  placeholder?: string;
  /** Etichetta per l'input quando non è visibile (schermi da letto). */
  ariaLabel?: string;
}

interface CityOption {
  key: string;
  city: string;
  country: string;
  countryCode: string | null;
  coords: Coordinates | null;
}

export const CityPicker: React.FC<CityPickerProps> = ({
  value,
  onChange,
  tripDestinations,
  placeholder,
  ariaLabel,
}) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState(value.city);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const skipSync = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Più picker possono stare sulla stessa pagina (alloggio, profilo): gli id
  // di listbox e opzioni devono essere univoci per attributi come aria-controls.
  const uid = useId();
  const listboxId = `city-listbox-${uid}`;
  // Testo già confermato con un click: non va interrogato Nominatim di nuovo,
  // altrimenti l'effetto sotto ripartirebbe e riaprirebbe la lista.
  // Parte dal valore iniziale: una città già salvata non è una ricerca da fare, altrimenti
  // all'apertura di un form in modifica l'elenco si aprirebbe da solo appena arrivano i risultati.
  const accepted = useRef(value.city.trim());

  // Il testo digitato vive nello stato locale; `onChange` viene chiamato a ogni
  // keystroke così il form resta un campo libero. Il flag evita che il reset a
  // `value.city` (dopo una pick) faccia ripartire la ricerca.
  useEffect(() => {
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    setQuery(value.city);
  }, [value.city]);

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
      abort.current?.abort();
    };
  }, []);

  // ── Ricerca ───────────────────────────────────────────────────────────────
  // Non parte se il testo è già stato scelto: `pick()` scrive il nome in `query`
  // e senza questo controllo l'effetto si riattiverebbe, chiamerebbe Nominatim e
  // riaprirebbe la lista, obbligando a un secondo click.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      abort.current?.abort();
      setSuggestions([]);
      setLoading(false);
      setSearchError(false);
      return;
    }
    if (trimmed === accepted.current) {
      abort.current?.abort();
      return;
    }
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setLoading(true);
    setSearchError(false);
    const timer = setTimeout(async () => {
      try {
        const res = await searchDestinations(trimmed, ctrl.signal, i18n.language);
        setSuggestions(res);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setSearchError(true);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, i18n.language]);

  // Le mete del viaggio hanno la priorità assoluta e, con query vuota, sono
  // TUTTE: appena il campo prende il fuoco l'utente vede subito dove sta
  // andando, senza dover scrivere nulla.
  const options: CityOption[] = useMemo(() => {
    const q = foldText(query);
    const matches = (d: Destination) => {
      if (!d.city) return false;
      if (!q) return true;
      const city = foldText(d.city);
      // Iniziare per la query batte "conterla": con "bos" l'utente vuole
      // Boston, non tutte le città che hanno "bos" da qualche parte.
      return city.startsWith(q) || city.includes(q) || foldText(d.country ?? '').includes(q);
    };
    const fromTrip = tripDestinations.filter(matches).map((d) => ({
      key: `trip-${d.city}`,
      city: d.city,
      country: d.country ?? '',
      countryCode: null,
      coords: d.coords ?? null,
    }));
    const fromNominatim = suggestions
      .filter((s) => !fromTrip.some((t) => t.city.toLowerCase() === s.city.toLowerCase()))
      .map((s) => ({
        key: `osm-${s.city}-${s.country}`,
        city: s.city,
        country: s.country,
        countryCode: s.countryCode,
        coords: s.coords,
      }));
    return [...fromTrip, ...fromNominatim];
  }, [tripDestinations, suggestions, query]);

  // Un solo header "mete del viaggio" sopra il gruppo, non uno per riga.
  const tripOptionCount = useMemo(
    () => tripDestinations.filter((d) => d.city).length,
    [tripDestinations]
  );

  useEffect(() => setActiveIndex(-1), [options.length]);

  const pick = (option: CityOption) => {
    skipSync.current = true;
    // Segna il testo come già scelto: l'effetto di ricerca lo salta, quindi la
    // lista non si riapre e il click successivo non serve.
    accepted.current = option.city.trim();
    onChange({ city: option.city, coords: option.coords });
    setQuery(option.city);
    setOpen(false);
    setActiveIndex(-1);
    setSuggestions([]);
    setSearchError(false);
    setLoading(false);
    abort.current?.abort();
    // Il campo ha già il valore: si rilascia il focus invece di lasciare il
    // cursore in un input che non serve più.
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

  // Mantiene l'opzione attiva visibile durante la navigazione da tastiera.
  // Si cerca per id, non per indice: il <ul> contiene anche le righe di
  // intestazione, quindi la posizione non coincide con quella delle opzioni.
  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(`${listboxId}-opt-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listboxId]);

  // Con 0-1 caratteri non si interroga Nominatim, ma le mete del viaggio
  // (se ce ne sono) sono comunque un suggerimento utile.
  const searching = query.trim().length >= 2;
  const showList = open && (searching || tripOptionCount > 0);
  const showTripHeader = tripOptionCount > 0 && options.some((o) => o.key.startsWith('trip-'));
  const showWorldHeader = searching && suggestions.length > 0;

  return (
    <div ref={ref} className="relative">
      <PickerInput
        value={query}
        onChange={(v) => {
          // Digitare a mano invalida la scelta precedente: altrimenti tornare
          // indietro di un carattere e riscriverlo non ripartirebbe nulla.
          accepted.current = '';
          setQuery(v);
          onChange({ city: v, coords: null });
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        placeholder={placeholder ?? t('cityPicker.placeholder')}
        leading={<Search className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />}
        trailing={
          loading ? (
            <Loader2 className={`${MODAL_ICON_SIZE} text-gold animate-spin shrink-0`} />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                accepted.current = '';
                setQuery('');
                onChange({ city: '', coords: null });
              }}
              aria-label={t('cityPicker.clear')}
              className="text-slate-400 hover:text-error transition-colors shrink-0"
            >
              <X className={MODAL_ICON_SIZE} />
            </button>
          ) : null
        }
        role="combobox"
        ariaLabel={ariaLabel ?? t('cityPicker.label')}
        ariaControls={listboxId}
        ariaExpanded={showList}
        ariaActiveDescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
      />

      {showList && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] overflow-hidden max-h-72 overflow-y-auto">
          {searchError && (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              {t('cityPicker.searchError')}
            </p>
          )}

          {showTripHeader && (
            <p className="text-xs text-slate-400 px-3 pt-2 pb-1 font-medium uppercase tracking-wider sticky top-0 bg-white dark:bg-[#0f1c35]">
              {t('cityPicker.tripHint')}
            </p>
          )}

          {!loading && !searchError && options.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              {t('cityPicker.noResults', { value: query.trim() })}
            </p>
          )}

          <ul id={listboxId} role="listbox">
            {options.map((option, i) => {
              const isSeparatorBefore =
                showWorldHeader &&
                i === Math.min(tripOptionCount, options.length) &&
                !option.key.startsWith('trip-');
              return (
                <React.Fragment key={option.key}>
                  {isSeparatorBefore && (
                    <li
                      role="presentation"
                      className="text-xs text-slate-400 px-3 pt-2 pb-1 font-medium uppercase tracking-wider border-t border-slate-200 dark:border-slate-700 mt-1"
                    >
                      {t('cityPicker.world')}
                    </li>
                  )}
                  <li id={`${listboxId}-opt-${i}`} role="option" aria-selected={activeIndex === i}>
                    <button
                      type="button"
                      // Impedisce che il mousedown chiuda il dropdown prima del click.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(option)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                        activeIndex === i ? 'bg-gold/10' : 'hover:bg-gold/10'
                      }`}
                    >
                      {option.countryCode ? (
                        <CountryFlag
                          code={option.countryCode}
                          label={`${option.city}, ${option.country}`}
                        />
                      ) : (
                        <MapPin className={`${MODAL_ICON_SIZE} text-gold shrink-0`} />
                      )}
                      <span className="font-medium truncate">{option.city}</span>
                      {option.country && (
                        <span className="text-slate-400 text-xs truncate">{option.country}</span>
                      )}
                    </button>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
