import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';
import { foldText } from '@/lib/countries';

interface CountrySelectProps {
  /** Codice paese scelto, o stringa vuota se nessuno. */
  value: string;
  onChange: (code: string) => void;
  options: { code: string; name: string }[];
  /** Voce in cima all'elenco per azzerare la scelta (e testo mostrato quando non c'è nulla). */
  noneLabel: string;
  searchPlaceholder: string;
  id?: string;
}

/**
 * Menu paesi con ricerca: si scrive per filtrare, frecce + Invio per scegliere. L'elenco sta nel
 * flusso (non in sovrimpressione) così, dentro una modale, non viene tagliato dal bordo.
 */
export const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, options, noneLabel, searchPlaceholder, id }) => {
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const selected = options.find((o) => o.code === value) ?? null;

  const filtered = useMemo(() => {
    const q = foldText(query);
    return q ? options.filter((o) => foldText(o.name).includes(q)) : options;
  }, [options, query]);

  // riga 0 = "nessuna", poi i paesi filtrati
  const rows = useMemo(() => (query.trim() ? filtered : [{ code: '', name: noneLabel }, ...filtered]), [filtered, query, noneLabel]);

  useEffect(() => setActive(0), [query, open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, listId]);

  const pick = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Esc chiude solo l'elenco, non la modale
      if (open) e.stopPropagation();
      setOpen(false);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && rows[active]) {
      e.preventDefault();
      pick(rows[active].code);
    }
  };

  return (
    <div ref={ref}>
      <div className="flex items-center gap-2 input-field focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15">
        {open || !selected ? (
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
        ) : (
          <CountryFlag code={selected.code} label={selected.name} />
        )}
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={open ? query : (selected?.name ?? '')}
          placeholder={open ? searchPlaceholder : noneLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="w-full min-w-0 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={searchPlaceholder}
          onClick={() => setOpen((o) => !o)}
          className="text-slate-400 cursor-pointer"
        >
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="mt-2 max-h-[288px] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          {rows.length === 0 && <li className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">—</li>}
          {rows.map((o, i) => (
            <li key={o.code || 'none'} id={`${listId}-${i}`} role="option" aria-selected={o.code === value}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o.code)}
                onMouseEnter={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                  i === active ? 'bg-light-blue/10 dark:bg-slate-800' : ''
                } ${o.code === value ? 'font-bold text-gold' : ''}`}
              >
                {o.code ? <CountryFlag code={o.code} label={o.name} /> : <span className="w-6 shrink-0" />}
                <span className="truncate">{o.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
