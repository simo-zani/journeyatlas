import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { MODAL_ICON_SIZE } from '@/lib/ui';

const STEP = 15;
const SLOTS: string[] = Array.from({ length: (24 * 60) / STEP }, (_, i) => {
  const m = i * STEP;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
});

const toMinutes = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5));

/** "9" → 09:00, "930" → 09:30, "9.5" → 09:05, "2130" → 21:30. Null se non è un orario valido. */
export const parseTime = (raw: string): string | null => {
  const s = raw.trim();
  if (!s) return '';
  let h: number;
  let m: number;
  const sep = s.match(/^(\d{1,2})[:.,\s](\d{1,2})$/);
  if (sep) {
    h = Number(sep[1]);
    m = Number(sep[2]);
  } else if (/^\d{1,4}$/.test(s)) {
    if (s.length <= 2) {
      h = Number(s);
      m = 0;
    } else {
      h = Number(s.slice(0, s.length - 2));
      m = Number(s.slice(-2));
    }
  } else {
    return null;
  }
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
};

interface TimeFieldProps {
  /** Etichetta visibile sopra il campo; se omessa serve `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  /** Orario di inizio: nell'elenco di un orario di fine mostra la durata risultante. */
  durationFrom?: string;
  clearLabel?: string;
}

/**
 * Campo orario con elenco a passi di 15 minuti (come i calendari): si sceglie con un tocco
 * oppure si digita liberamente ("930", "9.30", "21") e il valore viene normalizzato a HH:MM.
 */
export const TimeField: React.FC<TimeFieldProps> = ({
  label,
  ariaLabel,
  value,
  onChange,
  disabled,
  durationFrom,
  clearLabel = 'Clear',
}) => {
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const shown = draft ?? value;

  const slots = useMemo(() => {
    // un orario scelto a mano (es. 09:07) deve comparire in lista, in ordine
    if (value && !SLOTS.includes(value)) return [...SLOTS, value].sort();
    return SLOTS;
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setDraft(null);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // all'apertura porta in vista l'orario scelto (o le 09:00 se vuoto)
  useEffect(() => {
    if (!open) return;
    const target = value || '09:00';
    let idx = slots.findIndex((s) => s >= target);
    if (idx < 0) idx = slots.length - 1;
    setActive(idx);
    const el = listRef.current?.children[idx] as HTMLElement | undefined;
    if (el && listRef.current) listRef.current.scrollTop = Math.max(0, el.offsetTop - 2 * el.offsetHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const commit = (raw: string) => {
    const parsed = parseTime(raw);
    if (parsed !== null) onChange(parsed);
    setDraft(null);
  };

  const pick = (slot: string) => {
    onChange(slot);
    setDraft(null);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((a) => Math.min(slots.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      if (draft !== null) {
        e.preventDefault();
        commit(draft);
        setOpen(false);
      } else if (open) {
        e.preventDefault();
        pick(slots[active]);
      }
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      setDraft(null);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-2 input-field focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15 transition-opacity duration-200 ${
          disabled ? 'opacity-40 pointer-events-none' : ''
        }`}
      >
        <input
          id={id}
          aria-label={label ? undefined : ariaLabel}
          value={shown}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="off"
          placeholder="--:--"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            if (draft !== null) commit(draft);
          }}
          onKeyDown={onKeyDown}
          className="w-full min-w-0 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 tabular-nums"
        />
        {value && !disabled ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange('');
              setDraft(null);
            }}
            aria-label={clearLabel}
            className="text-slate-400 hover:text-error transition-colors shrink-0"
          >
            <X className={MODAL_ICON_SIZE} />
          </button>
        ) : (
          <Clock className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
        )}
      </div>

      {open && !disabled && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] py-1"
        >
          {slots.map((slot, i) => {
            const selected = slot === value;
            const diff = durationFrom ? toMinutes(slot) - toMinutes(durationFrom) : 0;
            return (
              <li key={slot} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(slot)}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full text-left px-4 py-1.5 flex items-center justify-between text-sm tabular-nums ${
                    i === active ? 'bg-gold/10' : ''
                  } ${selected ? 'text-gold font-semibold' : ''}`}
                >
                  <span>{slot}</span>
                  {durationFrom && diff > 0 && (
                    <span className="text-xs text-slate-400 font-normal">{formatDuration(diff)}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
