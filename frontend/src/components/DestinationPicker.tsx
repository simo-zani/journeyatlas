import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin, Plus, X } from 'lucide-react';
import type { Destination } from '@/lib/types';
import {
  searchDestinations,
  toDestination,
  toManualDestination,
  type DestinationSuggestion,
} from '@/lib/countries';

interface DestinationPickerProps {
  value: Destination[];
  onChange: (destinations: Destination[]) => void;
}

const sameDestination = (a: Destination, b: Destination): boolean =>
  a.city.toLowerCase() === b.city.toLowerCase() &&
  a.country.toLowerCase() === b.country.toLowerCase();

const isDuplicate = (list: Destination[], candidate: Destination): boolean =>
  list.some((d) => sameDestination(d, candidate));

export const DestinationPicker: React.FC<DestinationPickerProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoadingQuery(false);
      setSearchError(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setOpen(true);
    setLoadingQuery(true);
    setSearchError(false);

    const timer = setTimeout(async () => {
      try {
        const results = await searchDestinations(trimmed, controller.signal);
        setSuggestions(results);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setSearchError(true);
      } finally {
        setLoadingQuery(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const addDestination = (destination: Destination) => {
    if (isDuplicate(value, destination)) return;
    onChange([...value, destination]);
    setQuery('');
    setOpen(false);
    setSuggestions([]);
  };

  const removeDestination = (destination: Destination) => {
    onChange(value.filter((d) => !sameDestination(d, destination)));
  };

  const trimmed = query.trim();
  const showSuggestions = open && trimmed.length > 0;

  return (
    <div className="w-full">
      <label className="label">{t('trip.destinations')}</label>
      <div ref={ref} className="relative">
        <div className="flex items-center gap-2 input-field focus-within:border-deep-blue dark:focus-within:border-gold">
          <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
            placeholder={t('trip.destinationsPlaceholder')}
          />
          {loadingQuery && <Loader2 className="w-4 h-4 text-gold animate-spin shrink-0" />}
        </div>

        {showSuggestions && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
            {searchError && (
              <p className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
                {t('trip.destinationsSearchError')}
              </p>
            )}

            {!loadingQuery && !searchError && suggestions.length > 0 && (
              <ul aria-label="suggestions">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.city}-${suggestion.country}-${index}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addDestination(toDestination(suggestion))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-light-blue/10 dark:hover:bg-slate-800 transition-colors"
                    >
                      {suggestion.flagUrl ? (
                        <img
                          src={suggestion.flagUrl}
                          alt={suggestion.country}
                          className="w-6 h-6 rounded-xl object-cover shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold truncate">
                          {suggestion.city || suggestion.country}
                        </span>
                        {suggestion.country && (
                          <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                            {suggestion.country}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!loadingQuery && suggestions.length > 0 && !searchError && (
              <div className="border-t border-slate-100 dark:border-slate-800" />
            )}

            {!loadingQuery && !searchError && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addDestination(toManualDestination(trimmed))}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-light-blue/10 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-5 h-5 text-gold shrink-0" />
                <span className="text-sm font-medium truncate">
                  {t('trip.addAsDestination', { value: trimmed })}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((destination) => (
            <span
              key={`${destination.city}-${destination.country}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-blue/10 border border-light-blue/30 text-deep-blue dark:text-slate-300 text-sm font-medium max-w-full"
            >
              <span className="min-w-0 truncate">
                {destination.city}
                {destination.country ? `, ${destination.country}` : ''}
              </span>
              <button
                type="button"
                onClick={() => removeDestination(destination)}
                aria-label={t('trip.removeDestination')}
                className="text-slate-500 hover:text-error shrink-0 p-1 -m-1"
              >
                <X className="w-5 h-5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};