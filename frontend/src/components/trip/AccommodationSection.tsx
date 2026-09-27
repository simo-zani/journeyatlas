import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accessibility,
  AirVent,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CircleParking,
  Coffee,
  CookingPot,
  Disc3,
  Dumbbell,
  ExternalLink,
  Heater,
  ImageOff,
  ImagePlus,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Moon,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sofa,
  Star,
  Trees,
  Tv,
  Umbrella,
  WashingMachine,
  Waves,
  Wifi,
  X,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { DeleteButton } from '@/components/trip/DeleteButton';
import { CountryFlag } from '@/components/CountryFlag';
import {
  createAccommodation,
  deleteAccommodation,
  fetchAccommodations,
  updateAccommodation,
  type AccommodationInput,
} from '@/lib/api';

import { supabase } from '@/lib/supabase';
import type { AccommodationRow, Coordinates, Destination } from '@/lib/types';
import {
  searchDestinations,
  foldText,
  type DestinationSuggestion,
} from '@/lib/countries';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import { useAuth } from '@/auth/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCOMMODATION_TYPES = ['hotel', 'apartment'] as const;

const PHOTO_BUCKET = 'accommodation-photos';
/** Budget dell'oggetto finito: è il tetto del bucket e quello che si carica. */
const PHOTO_MAX_BYTES = 400 * 1024;
/** Limite del file che l'utente può scegliere, ben sopra l'output compresso. */
const PHOTO_MAX_INPUT_BYTES = 5 * 1024 * 1024;
const PHOTO_MAX_SIDE = 800;

const BOOKING_PLATFORMS = [
  { name: 'Booking.com', match: 'booking', domain: 'booking.com' },
  { name: 'Airbnb', match: 'airbnb', domain: 'airbnb.com' },
  { name: 'Expedia', match: 'expedia', domain: 'expedia.com' },
  { name: 'Hotels.com', match: 'hotels', domain: 'hotels.com' },
  { name: 'Agoda', match: 'agoda', domain: 'agoda.com' },
  { name: 'VRBO', match: 'vrbo', domain: 'vrbo.com' },
  { name: 'TripAdvisor', match: 'tripadvisor', domain: 'tripadvisor.com' },
  { name: 'Trivago', match: 'trivago', domain: 'trivago.com' },
  { name: 'Google Hotels', match: 'google', domain: 'google.com' },
] as const;

/**
 * Gli optional vengono salvati per CHIAVE (non per etichetta tradotta), così il
 * dato resta valido passando da una lingua all'altra. L'elenco è l'unica fonte
 * di verità: iTranslation espone `accommodation.amenity.<key>`.
 */
const ALL_AMENITIES = [
  { key: 'pool', Icon: Waves },
  { key: 'parking', Icon: CircleParking },
  { key: 'ac', Icon: AirVent },
  { key: 'gym', Icon: Dumbbell },
  { key: 'beach', Icon: Umbrella },
  { key: 'tennis', Icon: Disc3 },
  { key: 'wifi', Icon: Wifi },
  { key: 'breakfast', Icon: Coffee },
  { key: 'spa', Icon: Bath },
  { key: 'petFriendly', Icon: PawPrint },
  { key: 'kitchen', Icon: CookingPot },
  { key: 'balcony', Icon: Trees },
  { key: 'livingRoom', Icon: Sofa },
  { key: 'laundry', Icon: WashingMachine },
  { key: 'tv', Icon: Tv },
  { key: 'heating', Icon: Heater },
  { key: 'reception24h', Icon: Moon },
  { key: 'selfCheckIn', Icon: KeyRound },
  { key: 'accessibility', Icon: Accessibility },
  { key: 'security', Icon: ShieldCheck },
] as const;

const AMENITY_KEYS: string[] = ALL_AMENITIES.map((a) => a.key);

/**
 * Icona per chiave. La card mostra solo l'icona degli optional: il nome
 * leggibile resta nel `title` (tooltip) e nell'`aria-label`, così non si perde
 * per chi non può vedere l'icona.
 */
const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
  Object.fromEntries(ALL_AMENITIES.map(({ key, Icon }) => [key, Icon]));

/** Icone di contesto sulle card: più grandi dei 16px di default. */
const CARD_ICON_SIZE = 'w-5 h-5';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString() : '';
const formatTime = (t: string | null) =>
  t ? t.slice(0, 5) : '';
const formatCost = (n: number | null, currency: string | null) =>
  n != null ? `${n} ${currency ?? 'EUR'}` : '';

const isWithinTrip = (d: string, start: string | null, end: string | null) =>
  (!start || d >= start) && (!end || d <= end);
const formatBytes = (bytes: number) =>
  bytes >= 1024 ? `${Math.round(bytes / 1024)} KB` : `${bytes} B`;

/** Aggiunge https:// se l'utente ha digitato solo il dominio ("airbnb.com/x"). */
const normalizeUrl = (raw: string): string | null => {
  const value = raw.trim();
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

/** True se la stringa sembra un URL utilizzabile (per il messaggio d'errore). */
const looksLikeUrl = (raw: string) => normalizeUrl(raw) !== null;

const platformDomain = (name: string | null): string | null => {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  return BOOKING_PLATFORMS.find((p) => n.includes(p.match))?.domain ?? null;
};

/**
 * Path dell'oggetto nel bucket. È deterministico (`<userId>/<accId>.jpg`) così
 * un cambio foto sovrascrive lo stesso file invece di accumularne di nuovi.
 * Resta comunque `photo_path` nel DB a fare da fonte di verità: in un viaggio
 * condiviso la foto può essere stata caricata da un altro partecipante, e il
 * path derivato da `user.id` punterebbe alla cartella sbagliata.
 */
const photoPathFor = (userId: string, accId: string) => `${userId}/${accId}.jpg`;

/**
 * Crop quadrato centrato, lato max 800px, JPEG entro PHOTO_MAX_BYTES.
 *
 * L'utente può scegliere un file fino a PHOTO_MAX_INPUT_BYTES (5 MB): non è il
 * peso che finisce su Supabase, ma quello in partenza. Qui si scala sempre per
 * il lato massimo e poi si stringe: prima la qualità, poi la risoluzione.
 * L'ultimo livello (400px) sta sotto ~100 KB, quindi l'output rispetta sempre il
 * tetto del bucket e non serve più rifiutare la foto a valle.
 */
async function compressAccommodationPhoto(file: File): Promise<Blob> {
  // imageOrientation 'from-image' legge l'EXIF: senza, le foto dei telefoni
  // ruotate vengono salvate di traverso.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const srcSide = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - srcSide) / 2;
  const sy = (bitmap.height - srcSide) / 2;

  const renderSquare = (side: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = side;
    canvas.height = side;
    canvas.getContext('2d')!.drawImage(bitmap, sx, sy, srcSide, srcSide, 0, 0, side, side);
    return canvas;
  };

  const levels = [
    { side: Math.min(srcSide, PHOTO_MAX_SIDE), qualities: [0.85, 0.75, 0.65, 0.55, 0.45, 0.35] },
    { side: 560, qualities: [0.8, 0.6, 0.4] },
    { side: 400, qualities: [0.8, 0.6, 0.4] },
  ];

  let best: Blob | null = null;
  try {
    for (const level of levels) {
      if (level.side > srcSide) continue;
      const canvas = renderSquare(level.side);
      for (const quality of level.qualities) {
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, 'image/jpeg', quality)
        );
        if (!blob) continue;
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= PHOTO_MAX_BYTES) return blob;
      }
    }
  } finally {
    bitmap.close();
  }
  return best ?? new Blob();
}

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  label: string;
  open: boolean;
  onToggle: () => void;
  optional?: boolean;
  /** Testo mostrato a destra, es. "3" per gli optional selezionati. */
  badge?: string;
}> = ({ label, open, onToggle, optional, badge }) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between py-2 px-0 text-left group"
    >
      <span className="flex items-center gap-2 min-w-0 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-gold transition-colors">
        <span className="truncate">{label}</span>
        {optional && (
          <span className="shrink-0 text-xs font-normal normal-case tracking-normal text-slate-400 dark:text-slate-500">
            {t('accommodation.optional')}
          </span>
        )}
        {badge && (
          <span className="shrink-0 max-w-[12rem] truncate text-xs font-semibold normal-case tracking-normal px-2 py-0.5 rounded-full bg-gold/15 text-gold">
            {badge}
          </span>
        )}
      </span>
      {open ? (
        <ChevronUp className={`${MODAL_ICON_SIZE} text-slate-400`} />
      ) : (
        <ChevronDown className={`${MODAL_ICON_SIZE} text-slate-400`} />
      )}
    </button>
  );
};

// ─── Platform logo ────────────────────────────────────────────────────────────

/**
 * Logo della piattaforma di prenotazione. Usa il favicon servito dal CDN di
 * Google (più affidabile dei favicon diretti dei siti, che spesso bloccano le
 * richieste esterne) e cade su una badge con l'iniziale se l'immagine non
 * carica.
 */
const PlatformLogo: React.FC<{ platform: string; className?: string }> = ({
  platform,
  className = MODAL_ICON_SIZE,
}) => {
  const domain = platformDomain(platform);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [domain]);

  if (!domain || failed) {
    return (
      <span
        aria-hidden="true"
        className={`${className} shrink-0 inline-flex items-center justify-center rounded bg-slate-200 dark:bg-white/10 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-300`}
      >
        {platform.trim().charAt(0) || '?'}
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt=""
      loading="lazy"
      className={`${className} shrink-0 object-contain rounded`}
      onError={() => setFailed(true)}
    />
  );
};

// ─── Picker input ─────────────────────────────────────────────────────────────

/**
 * Input con icona a sinistra e azione a destra, usato dai picker città e
 * piattaforma.
 *
 * Non si appoggia a `pl-11` sull'<input>: `.input-field` è definito in
 * index.css DOPO `@tailwind utilities` e vince il conflitto di padding, quindi
 * l'icona assolutamente posizionata finiva sopra il placeholder. Qui l'icona
 * è un fratello flex del campo, quindi il padding la gestisce il layout e non
 * c'è nulla da sovrascrivere. Stesso approccio di `DestinationPicker`.
 */
const PickerInput: React.FC<{
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

const STAR_MAX = 5;

/** `sm` per la card (accanto al badge), `md` per il selettore nel form. */
const STAR_SIZE = {
  sm: { icon: 'w-5 h-5', gap: 'gap-0.5', pad: 'p-0.5' },
  md: { icon: 'w-6 h-6', gap: 'gap-1', pad: 'p-1' },
} as const;

/**
 * Stelle 1-5. Usato sia come input nel form (interattivo) sia sulla card
 * (sola lettura): la logica di riempimento resta in un posto solo.
 * 0 = non valutata, e cliccare di nuovo sulla stessa stella azzera.
 */
const StarRating: React.FC<{
  value: number;
  onChange?: (v: number) => void;
  size?: keyof typeof STAR_SIZE;
  className?: string;
}> = ({ value, onChange, size = 'md', className = '' }) => {
  const { t } = useTranslation();
  const [hover, setHover] = useState(0);
  const readOnly = !onChange;
  const shown = readOnly ? value : hover || value;
  const { icon, gap, pad } = STAR_SIZE[size];

  return (
    <div
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={
        readOnly
          ? t('accommodation.starsLabel', { count: value, max: STAR_MAX })
          : t('accommodation.stars')
      }
      onMouseLeave={() => setHover(0)}
      className={`inline-flex items-center ${gap} ${className}`}
    >
      {Array.from({ length: STAR_MAX }, (_, i) => i + 1).map((n) => {
        const filled = n <= shown;
        const star = (
          <Star
            aria-hidden="true"
            className={`${icon} transition-colors ${
              filled ? 'text-gold fill-gold' : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        );
        if (readOnly) return <span key={n}>{star}</span>;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            role="radio"
            aria-checked={n === value}
            aria-label={t('accommodation.starsValue', { count: n, max: STAR_MAX })}
            className={`${pad} rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold`}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
};

// ─── City picker (Nominatim, singolo risultato) ───────────────────────────────

interface CityValue {
  city: string;
  coords: Coordinates | null;
}

interface CityPickerProps {
  value: CityValue;
  onChange: (value: CityValue) => void;
  tripDestinations: Destination[];
  placeholder?: string;
}

interface CityOption {
  key: string;
  city: string;
  country: string;
  countryCode: string | null;
  coords: Coordinates | null;
}

const CityPicker: React.FC<CityPickerProps> = ({
  value,
  onChange,
  tripDestinations,
  placeholder,
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
  // Testo già confermato con un click: non va interrogato Nominatim di nuovo,
  // altrimenti l'effetto sotto ripartirebbe e riaprirebbe la lista.
  const accepted = useRef('');

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
    document
      .getElementById(`acc-city-opt-${activeIndex}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

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
        placeholder={placeholder ?? t('accommodation.cityPlaceholder')}
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
              aria-label={t('accommodation.cityClear')}
              className="text-slate-400 hover:text-error transition-colors shrink-0"
            >
              <X className={MODAL_ICON_SIZE} />
            </button>
          ) : null
        }
        role="combobox"
        ariaLabel={t('accommodation.city')}
        ariaControls="acc-city-listbox"
        ariaExpanded={showList}
        ariaActiveDescendant={activeIndex >= 0 ? `acc-city-opt-${activeIndex}` : undefined}
      />

      {showList && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] overflow-hidden max-h-72 overflow-y-auto">
          {searchError && (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              {t('accommodation.citySearchError')}
            </p>
          )}

          {showTripHeader && (
            <p className="text-xs text-slate-400 px-3 pt-2 pb-1 font-medium uppercase tracking-wider sticky top-0 bg-white dark:bg-[#0f1c35]">
              {t('accommodation.cityHint')}
            </p>
          )}

          {!loading && !searchError && options.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              {t('accommodation.cityNoResults', { value: query.trim() })}
            </p>
          )}

          <ul id="acc-city-listbox" role="listbox">
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
                      {t('accommodation.cityWorld')}
                    </li>
                  )}
                  <li
                    id={`acc-city-opt-${i}`}
                    role="option"
                    aria-selected={activeIndex === i}
                  >
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

// ─── Platform picker ──────────────────────────────────────────────────────────

interface PlatformPickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const PlatformPicker: React.FC<PlatformPickerProps> = ({ value, onChange, placeholder }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // L'input resta un campo libero: si filtra la lista ma un nome non presente
  // in elenco (es. "Sito diretto dell'hotel") è comunque accettato.
  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return BOOKING_PLATFORMS;
    return BOOKING_PLATFORMS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.match.includes(q)
    );
  }, [value]);

  const isCustom = value.trim().length > 0 && filtered.length === 0;
  const showList = open && (filtered.length > 0 || isCustom);

  return (
    <div ref={ref} className="relative">
      <PickerInput
        value={value}
        onChange={(v) => {
          onChange(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        leading={
          value.trim() ? (
            <PlatformLogo platform={value} />
          ) : (
            <Search className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
          )
        }
        trailing={
          value.trim() ? (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label={t('accommodation.bookingPlatformClear')}
              className="text-slate-400 hover:text-error transition-colors shrink-0"
            >
              <X className={MODAL_ICON_SIZE} />
            </button>
          ) : null
        }
        role="combobox"
        ariaLabel={t('accommodation.bookingPlatform')}
        ariaControls="acc-platform-listbox"
        ariaExpanded={showList}
      />

      {showList && (
        <ul
          id="acc-platform-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35] overflow-hidden"
        >
          {filtered.map((p) => {
            const selected = value.trim().toLowerCase() === p.name.toLowerCase();
            return (
              <li key={p.name} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(p.name);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-gold/10 text-sm"
                >
                  <PlatformLogo platform={p.name} />
                  <span className="flex-1 truncate">{p.name}</span>
                  {selected && <Check className={`${MODAL_ICON_SIZE} text-gold shrink-0`} />}
                </button>
              </li>
            );
          })}
          {isCustom && (
            <li role="option" aria-selected>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen(false)}
                className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-gold/10 text-sm"
              >
                <PlatformLogo platform={value} />
                <span className="flex-1 truncate">
                  {t('accommodation.bookingPlatformCustom', { value: value.trim() })}
                </span>
                <Check className={`${MODAL_ICON_SIZE} text-gold shrink-0`} />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

// ─── Section props ─────────────────────────────────────────────────────────────

interface AccommodationSectionProps {
  tripId: string;
  tripStart: string | null;
  tripEnd: string | null;
  tripDestinations?: Destination[];
}

interface FormState {
  open: boolean;
  editing: AccommodationRow | null;
}

/** Cosa il form chiede al parent di fare con la foto. */
interface PhotoSelection {
  /** Blob già compressa e pronto per l'upload (null se non scelta). */
  blob: Blob | null;
  /** true se l'utente ha rimosso la foto esistente in fase di modifica. */
  removed: boolean;
}

// ─── Main section ─────────────────────────────────────────────────────────────

export const AccommodationSection: React.FC<AccommodationSectionProps> = ({
  tripId,
  tripStart,
  tripEnd,
  tripDestinations = [],
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<AccommodationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ open: false, editing: null });
  /** Alloggio in attesa di conferma eliminazione: su quello nascondo "modifica". */
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAccommodations(tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [tripId, t]);

  useEffect(() => { void load(); }, [load]);

  /**
   * Carica la foto dell'alloggio e restituisce url + path dell'oggetto. Il
   * `?v=` sulla public URL evita che il browser serva dalla cache la versione
   * precedente, dato che il path resta identico.
   */
  const uploadPhoto = async (
    accId: string,
    blob: Blob
  ): Promise<{ url: string; path: string }> => {
    if (!user) throw new Error(t('accommodation.photoUploadAuthError'));
    const path = photoPathFor(user.id, accId);
    const { error: upErr } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    return { url: `${data.publicUrl}?v=${Date.now()}`, path };
  };

  /**
   * Cancella l'oggetto solo se non è quello che stiamo riusando. Se la foto
   * era stata caricata da un altro partecipante la RLS di storage nega la
   * delete (il path non sta sotto la cartella di auth.uid()): la riga viene
   * comunque aggiornata e l'oggetto orfano resta da ripulire in seguito.
   */
  const discardPhotoObject = async (previousPath: string | null, keptPath: string | null) => {
    if (!previousPath || previousPath === keptPath) return;
    const { error: rmErr } = await supabase.storage
      .from(PHOTO_BUCKET)
      .remove([previousPath]);
    if (rmErr) console.warn('AccommodationSection: photo cleanup failed', rmErr);
  };

  const handleSubmit = async (input: AccommodationInput, photo: PhotoSelection) => {
    const editing = form.editing;

    if (editing) {
      let photoUrl = editing.photo_url;
      let photoPathValue = editing.photo_path;
      if (photo.blob) {
        const uploaded = await uploadPhoto(editing.id, photo.blob);
        photoUrl = uploaded.url;
        photoPathValue = uploaded.path;
      } else if (photo.removed) {
        photoUrl = null;
        photoPathValue = null;
      }
      await updateAccommodation(editing.id, {
        ...input,
        photo_url: photoUrl,
        photo_path: photoPathValue,
      });
      // La riga è già aggiornata: se il riferimento è stato azzerato, l'oggetto
      // vecchio non è più raggiungibile e va rimosso davvero.
      await discardPhotoObject(editing.photo_path, photoPathValue);
    } else {
      // La foto si carica dopo la creazione, perché il path contiene l'id
      // dell'alloggio. Se l'upload fallisce la riga resta comunque creata:
      // si preferisce perdere la foto piuttosto che l'alloggio.
      const created = await createAccommodation(tripId, {
        ...input,
        photo_url: null,
        photo_path: null,
      });
      if (photo.blob) {
        try {
          const uploaded = await uploadPhoto(created.id, photo.blob);
          await updateAccommodation(created.id, {
            photo_url: uploaded.url,
            photo_path: uploaded.path,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : t('common.error'));
        }
      }
    }
    setForm({ open: false, editing: null });
    await load();
  };

  const handleDelete = async (acc: AccommodationRow) => {
    await deleteAccommodation(acc.id);
    // Pulizia della foto: l'alloggio non esiste più, l'oggetto no.
    await discardPhotoObject(acc.photo_path, null);
    await load();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setForm({ open: true, editing: null })}>
          <Plus className="w-5 h-5" />
          {t('accommodation.add')}
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-16 h-16 text-gold animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛏️</div>
          <p className="empty-state-title">{t('accommodation.empty')}</p>
          <p className="empty-state-message">{t('accommodation.emptySub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {items.map((acc) => {
      const hasFooterRow = Boolean(
        acc.contact_phone || acc.contact_email || acc.booking_platform || acc.booking_url
      );
      return (
            <Card key={acc.id} noPadding>
              {/* Photo header */}
              {acc.photo_url && (
                <div className="relative h-36 overflow-hidden rounded-t-2xl">
                  <img
                    src={acc.photo_url}
                    alt={acc.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {/* Due righe sempre: se il nome è corto o manca, le righe
                        vuote tengono allineati i metadati di tutte le card. */}
                    <h3
                      className="font-poppins font-bold text-lg leading-7 line-clamp-2 min-h-14 break-words"
                      title={acc.name}
                    >
                      {acc.name}
                    </h3>
                  </div>
                  <div className="flex flex-col items-center gap-0 shrink-0">
                    {confirmingDeleteId !== acc.id && (
                      <button
                        onClick={() => setForm({ open: true, editing: acc })}
                        className="p-2 rounded-xl text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                        aria-label={t('common.edit')}
                      >
                        <Pencil className={MODAL_ICON_SIZE} />
                      </button>
                    )}
                    <DeleteButton
                      stacked
                      onConfirmingChange={(on) => setConfirmingDeleteId(on ? acc.id : null)}
                      onDelete={() => handleDelete(acc)}
                    />
                  </div>
                </div>

                {/* Location — il contenitore esiste sempre (min-h-10 = 2 righe
                    di text-sm) così le card senza indirizzo non "tirano su"
                    quelle sotto. */}
                <p className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-2 min-h-10">
                  {(acc.city || acc.address) && (
                    <>
                      <MapPin className={`${CARD_ICON_SIZE} shrink-0 mt-px`} />
                      <span
                        className="line-clamp-2 min-w-0"
                        title={[acc.city, acc.address].filter(Boolean).join(', ')}
                      >
                        {[acc.city, acc.address].filter(Boolean).join(', ')}
                      </span>
                    </>
                  )}
                </p>

                {/* Dates */}
                {(acc.check_in_date || acc.check_out_date) && (
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    {acc.check_in_date && (
                      <div className="bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">
                          {t('accommodation.checkIn')}
                        </p>
                        <p className="font-semibold">{formatDate(acc.check_in_date)}</p>
                        {acc.check_in_time && (
                          <p className="text-xs text-slate-400">{formatTime(acc.check_in_time)}</p>
                        )}
                      </div>
                    )}
                    {acc.check_out_date && (
                      <div className="bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">
                          {t('accommodation.checkOut')}
                        </p>
                        <p className="font-semibold">{formatDate(acc.check_out_date)}</p>
                        {acc.check_out_time && (
                          <p className="text-xs text-slate-400">{formatTime(acc.check_out_time)}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Cost */}
                {formatCost(acc.cost_total, acc.currency) && (
                  <p className="text-sm font-semibold text-deep-blue dark:text-gold mt-2">
                    {formatCost(acc.cost_total, acc.currency)}
                  </p>
                )}

                {/* Amenities — solo icona, il nome è nel title/aria-label.
                    I valori salvati sono chiavi, tradotte qui. */}
                {acc.amenities?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2.5">
                    {acc.amenities.map((a) => {
                      const Icon = AMENITY_ICONS[a];
                      // Chiave legacy fuori elenco: senza icona non si disegna,
                      // altrimenti comparirebbe un quadratino vuoto.
                      if (!Icon) return null;
                      const label = t(`accommodation.amenity.${a}`, { defaultValue: a });
                      return (
                        <span
                          key={a}
                          role="img"
                          aria-label={label}
                          title={label}
                          className="text-gold inline-flex"
                        >
                          <Icon className={CARD_ICON_SIZE} />
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Fascia finale: contatti a sinistra e prenotazione a destra,
                    con tipo (+stelle) centrato nella riga sotto. */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  {hasFooterRow && (
                    <div className="flex items-center justify-between gap-3">
                      {(acc.contact_phone || acc.contact_email) && (
                        <div className="flex flex-col gap-1 min-w-0">
                          {acc.contact_phone && (
                            <a
                              href={`tel:${acc.contact_phone}`}
                              className="flex items-center gap-1.5 text-xs text-light-blue hover:underline min-w-0"
                            >
                              <Phone className={`${CARD_ICON_SIZE} shrink-0`} />
                              <span className="truncate">{acc.contact_phone}</span>
                            </a>
                          )}
                          {acc.contact_email && (
                            <a
                              href={`mailto:${acc.contact_email}`}
                              className="flex items-center gap-1.5 text-xs text-light-blue hover:underline min-w-0"
                            >
                              <Mail className={`${CARD_ICON_SIZE} shrink-0`} />
                              <span className="truncate">{acc.contact_email}</span>
                            </a>
                          )}
                        </div>
                      )}
                      {(acc.booking_platform || acc.booking_url) && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {acc.booking_platform && (
                            <span
                              role="img"
                              aria-label={acc.booking_platform}
                              title={acc.booking_platform}
                              className="inline-flex"
                            >
                              <PlatformLogo platform={acc.booking_platform} className="w-6 h-6" />
                            </span>
                          )}
                          {acc.booking_url && (
                            <a
                              href={acc.booking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={acc.booking_platform ?? t('accommodation.bookingUrl')}
                              aria-label={t('accommodation.openBookingLink')}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                            >
                              <ExternalLink className={CARD_ICON_SIZE} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`flex items-center justify-center ${
                      hasFooterRow ? 'mt-2' : ''
                    }`}
                  >
                    <div className="inline-flex items-center gap-2">
                      <Badge variant="gold">{t(`accommodation.type.${acc.type}`)}</Badge>
                      {acc.stars != null && acc.stars > 0 && (
                        <StarRating value={acc.stars} size="sm" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        </div>
      )}

      <Modal
        open={form.open}
        onClose={() => setForm({ open: false, editing: null })}
        title={form.editing ? t('accommodation.edit') : t('accommodation.add')}
      >
        <AccommodationForm
          initial={form.editing}
          tripStart={tripStart}
          tripEnd={tripEnd}
          tripDestinations={tripDestinations}
          onSubmit={handleSubmit}
          onCancel={() => setForm({ open: false, editing: null })}
        />
      </Modal>
    </div>
  );
};

// ─── Form ─────────────────────────────────────────────────────────────────────

interface AccommodationFormProps {
  initial: AccommodationRow | null;
  tripStart: string | null;
  tripEnd: string | null;
  tripDestinations: Destination[];
  onSubmit: (input: AccommodationInput, photo: PhotoSelection) => Promise<void>;
  onCancel: () => void;
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({
  initial,
  tripStart,
  tripEnd,
  tripDestinations,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  // ── Field state ──────────────────────────────────────────────────────────
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<'hotel' | 'apartment'>(initial?.type ?? 'hotel');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState<CityValue>({
    city: initial?.city ?? '',
    coords: initial?.coordinates ?? null,
  });
  const [checkInDate, setCheckInDate] = useState(initial?.check_in_date ?? '');
  const [checkInTime, setCheckInTime] = useState(initial?.check_in_time ?? '');
  const [checkOutDate, setCheckOutDate] = useState(initial?.check_out_date ?? '');
  const [checkOutTime, setCheckOutTime] = useState(initial?.check_out_time ?? '');
  const [cost, setCost] = useState(initial?.cost_total != null ? String(initial.cost_total) : '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'EUR');
  const [bookingRef, setBookingRef] = useState(initial?.booking_ref ?? '');
  const [bookingUrl, setBookingUrl] = useState(initial?.booking_url ?? '');
  const [bookingPlatform, setBookingPlatform] = useState(initial?.booking_platform ?? '');
  // 0 = non valutata. Fuori dal range 1-5 non può arrivare dal DB (CHECK),
  // ma un valore legacy strutturato non deve rompere il render.
  const [stars, setStars] = useState<number>(() => {
    const s = initial?.stars ?? 0;
    return s >= 1 && s <= STAR_MAX ? s : 0;
  });
  const [contactPhone, setContactPhone] = useState(initial?.contact_phone ?? '');
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? '');
  // Gli optional sono salvati per chiave, non per etichetta tradotta.
  const [amenities, setAmenities] = useState<string[]>(() =>
    (initial?.amenities ?? []).filter((a) => AMENITY_KEYS.includes(a))
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');

  // ── Photo ────────────────────────────────────────────────────────────────
  // La compressione avviene subito, alla selezione: l'anteprima mostra
  // esattamente ciò che verrà salvato (stesso crop, stessa qualità, KB reali)
  // e il blob è pronto per l'upload senza doppio lavoro.
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photo_url ?? null);
  const [photoSize, setPhotoSize] = useState<number | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // L'object URL va revocato quando la form si smonta o la foto cambia.
  const objectUrlRef = useRef<string | null>(null);
  const dragDepth = useRef(0);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  // ── Collapsible sections ─────────────────────────────────────────────────
  const [secDates, setSecDates] = useState(true);
  const [secBooking, setSecBooking] = useState(false);
  const [secContacts, setSecContacts] = useState(false);
  const [secAmenities, setSecAmenities] = useState(false);
  const [secPhoto, setSecPhoto] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Validation ───────────────────────────────────────────────────────────
  const checkInInRange = checkInDate ? isWithinTrip(checkInDate, tripStart, tripEnd) : true;
  const checkOutInRange = checkOutDate ? isWithinTrip(checkOutDate, tripStart, tripEnd) : true;
  const checkOutAfterIn = !checkOutDate || !checkInDate || checkOutDate >= checkInDate;
  const bookingUrlValid = bookingUrl.trim().length === 0 || looksLikeUrl(bookingUrl);
  const canSubmit =
    name.trim().length > 0 &&
    checkInInRange &&
    checkOutInRange &&
    checkOutAfterIn &&
    bookingUrlValid &&
    !compressing;

  // ── Photo handling ───────────────────────────────────────────────────────
  // Comune a input e drop: un solo percorso di validazione/compressione.
  const handlePhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoError(t('accommodation.photoTypeError'));
      return;
    }
    // Si pesa il file scelto, non il risultato: 5 MB in ingresso vengono
    // ridotti a 400 KB dalla compressione.
    if (file.size > PHOTO_MAX_INPUT_BYTES) {
      setPhotoError(
        t('accommodation.photoTooLarge', { size: formatBytes(PHOTO_MAX_INPUT_BYTES) })
      );
      return;
    }
    setPhotoError(null);
    setCompressing(true);
    try {
      const blob = await compressAccommodationPhoto(file);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setPhotoBlob(blob);
      setPhotoPreview(url);
      setPhotoSize(blob.size);
      setPhotoRemoved(false);
    } catch {
      setPhotoError(t('accommodation.photoReadError'));
    } finally {
      setCompressing(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset sempre, anche sui rifiuti: altrimenti scegliere due volte lo stesso
    // file troppo grande non riporterebbe più l'evento change.
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    await handlePhotoFile(file);
  };

  // Trascinare sopra i figli del dropzone genera eventi enter/leave multipli:
  // il contatore evita che l'evidenziazione lampeggi.
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handlePhotoFile(file);
  };

  const removePhoto = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPhotoBlob(null);
    setPhotoPreview(null);
    setPhotoSize(null);
    setPhotoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Amenity toggle ───────────────────────────────────────────────────────
  const toggleAmenity = (key: string) => {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const input: AccommodationInput = {
        name: name.trim(),
        type,
        // Le stelle valgono solo per gli hotel: su un appartamento non hanno
        // significato, quindi non si salvano.
        stars: type === 'hotel' && stars > 0 ? stars : null,
        address: address.trim() || null,
        city: city.city.trim() || null,
        coordinates: city.city.trim() ? city.coords : null,
        check_in_date: checkInDate || null,
        check_in_time: checkInTime || null,
        check_out_date: checkOutDate || null,
        check_out_time: checkOutTime || null,
        cost_total: cost ? Number(cost) : null,
        currency: currency.trim() || null,
        booking_ref: bookingRef.trim() || null,
        booking_url: normalizeUrl(bookingUrl),
        booking_platform: bookingPlatform.trim() || null,
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,
        amenities,
        notes: notes.trim() || null,
      };
      // photo_url e coordinates non li manda il form: se ne occupa il parent,
      // che è l'unico a conoscere l'id dell'alloggio.
      await onSubmit(input, { blob: photoBlob, removed: photoRemoved });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const divider = <div className="border-t border-slate-200 dark:border-slate-700/60 my-1" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* ── General ──────────────────────────────────────────────────── */}
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1">
        {t('accommodation.sections.general')}
      </p>

      <Input
        label={`${t('accommodation.name')} *`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Type toggle */}
      <div>
        <label className="label">{t('accommodation.typeLabel')}</label>
        <div className="grid grid-cols-2 gap-2">
          {ACCOMMODATION_TYPES.map((ty) => (
            <button
              key={ty}
              type="button"
              onClick={() => setType(ty)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                type === ty
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-gold/40'
              }`}
            >
              {ty === 'hotel' ? (
                <Building2 className={MODAL_ICON_SIZE} />
              ) : (
                <BedDouble className={MODAL_ICON_SIZE} />
              )}
              {t(`accommodation.type.${ty}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Stelle: solo per hotel, e facoltative. */}
      {type === 'hotel' && (
        <div>
          <div className="flex items-center justify-between">
            <label className="label mb-0">{t('accommodation.stars')}</label>
            {stars > 0 && (
              <button
                type="button"
                onClick={() => setStars(0)}
                className="text-xs text-slate-400 hover:text-error transition-colors"
              >
                {t('accommodation.starsClear')}
              </button>
            )}
          </div>
          <StarRating value={stars} onChange={setStars} className="mt-1.5" />
        </div>
      )}

      {/* City */}
      <div>
        <label className="label">{t('accommodation.city')}</label>
        <CityPicker
          value={city}
          onChange={setCity}
          tripDestinations={tripDestinations}
          placeholder={t('accommodation.cityPlaceholder')}
        />
      </div>

      <Input
        label={t('accommodation.address')}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t('accommodation.addressPlaceholder')}
      />

      {/* Cost */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('accommodation.cost')}
          type="number"
          min="0"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <Input
          label={t('accommodation.currency')}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder="EUR"
        />
      </div>

      <Input
        label={t('accommodation.notes')}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {divider}

      {/* ── Dates ────────────────────────────────────────────────────── */}
      <SectionHeader
        label={t('accommodation.sections.dates')}
        open={secDates}
        onToggle={() => setSecDates((v) => !v)}
      />
      {secDates && (
        <div className="space-y-3 pt-1">
          {/* Check-in: data + orario nella stessa riga (un solo blocco) */}
          <div>
            <label className="label">{t('accommodation.checkIn')}</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={checkInDate}
                min={tripStart ?? undefined}
                max={tripEnd ?? undefined}
                onChange={(e) => setCheckInDate(e.target.value)}
                aria-label={t('accommodation.checkInDate')}
              />
              <Input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                aria-label={t('accommodation.checkInTime')}
              />
            </div>
          </div>
          {/* Check-out: data + orario nella stessa riga */}
          <div>
            <label className="label">{t('accommodation.checkOut')}</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={checkOutDate}
                min={checkInDate || tripStart || undefined}
                max={tripEnd ?? undefined}
                onChange={(e) => setCheckOutDate(e.target.value)}
                aria-label={t('accommodation.checkOutDate')}
              />
              <Input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                aria-label={t('accommodation.checkOutTime')}
              />
            </div>
          </div>
          {(!checkInInRange || !checkOutInRange) && (
            <p className="text-sm text-error" role="alert">
              {t('trip.dateOutOfRange', {
                range: [tripStart, tripEnd].filter(Boolean).join(' — '),
              })}
            </p>
          )}
          {!checkOutAfterIn && checkOutDate && checkInDate && (
            <p className="text-sm text-error" role="alert">
              {t('accommodation.checkOutBeforeCheckIn')}
            </p>
          )}
        </div>
      )}

      {divider}

      {/* ── Booking ──────────────────────────────────────────────────── */}
      <SectionHeader
        label={t('accommodation.sections.booking')}
        open={secBooking}
        onToggle={() => setSecBooking((v) => !v)}
        optional
        badge={bookingPlatform.trim() || undefined}
      />
      {secBooking && (
        <div className="space-y-3 pt-1">
          <div>
            <label className="label">{t('accommodation.bookingPlatform')}</label>
            <PlatformPicker
              value={bookingPlatform}
              onChange={setBookingPlatform}
              placeholder={t('accommodation.bookingPlatformPlaceholder')}
            />
          </div>
          <Input
            label={t('accommodation.bookingUrl')}
            value={bookingUrl}
            onChange={(e) => setBookingUrl(e.target.value)}
            placeholder={t('accommodation.bookingUrlPlaceholder')}
            type="url"
            error={!bookingUrlValid ? t('accommodation.bookingUrlInvalid') : undefined}
          />
          <Input
            label={t('accommodation.bookingRef')}
            value={bookingRef}
            onChange={(e) => setBookingRef(e.target.value)}
            placeholder={t('accommodation.bookingRefPlaceholder')}
          />
        </div>
      )}

      {divider}

      {/* ── Contacts ─────────────────────────────────────────────────── */}
      <SectionHeader
        label={t('accommodation.sections.contacts')}
        open={secContacts}
        onToggle={() => setSecContacts((v) => !v)}
        optional
        badge={
          contactPhone.trim() || contactEmail.trim() ? t('accommodation.filled') : undefined
        }
      />
      {secContacts && (
        <div className="space-y-3 pt-1">
          <Input
            label={t('accommodation.contactPhone')}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder={t('accommodation.contactPhonePlaceholder')}
            type="tel"
          />
          <Input
            label={t('accommodation.contactEmail')}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder={t('accommodation.contactEmailPlaceholder')}
            type="email"
          />
        </div>
      )}

      {divider}

      {/* ── Amenities ────────────────────────────────────────────────── */}
      <SectionHeader
        label={t('accommodation.sections.amenities')}
        open={secAmenities}
        onToggle={() => setSecAmenities((v) => !v)}
        optional
        badge={amenities.length > 0 ? String(amenities.length) : undefined}
      />
      {secAmenities && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {ALL_AMENITIES.map(({ key, Icon }) => {
            const active = amenities.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleAmenity(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                  active
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-gold/40'
                }`}
              >
                {active ? (
                  <Check className={`${MODAL_ICON_SIZE} shrink-0`} />
                ) : (
                  <Icon className={`${MODAL_ICON_SIZE} shrink-0`} />
                )}
                <span className="truncate">{t(`accommodation.amenity.${key}`)}</span>
              </button>
            );
          })}
        </div>
      )}

      {divider}

      {/* ── Photo ────────────────────────────────────────────────────── */}
      <SectionHeader
        label={t('accommodation.sections.photo')}
        open={secPhoto}
        onToggle={() => setSecPhoto((v) => !v)}
        optional
        badge={photoPreview || photoRemoved ? t('accommodation.filled') : undefined}
      />
      {secPhoto && (
        <div className="pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />

          {compressing ? (
            <div className="w-full h-64 rounded-2xl bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className={`${MODAL_ICON_SIZE} animate-spin text-gold`} />
              <span className="text-sm">{t('accommodation.photoCompressing')}</span>
            </div>
          ) : photoPreview ? (
            <div className="space-y-2">
              {/* L'immagine è quadrata: si mostra intera (object-contain) così
                  l'anteprima corrisponde al crop effettivamente salvato. */}
              <div className="relative h-64 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden group">
                <img
                  src={photoPreview}
                  alt={t('accommodation.photoPreviewAlt')}
                  className="h-full w-auto max-w-full object-contain"
                />
                <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/90 text-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5 hover:bg-white"
                  >
                    <ImagePlus className={MODAL_ICON_SIZE} />
                    {t('accommodation.photoChange')}
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="bg-white/90 text-error rounded-xl px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5 hover:bg-white"
                  >
                    <X className={MODAL_ICON_SIZE} />
                    {t('common.remove')}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {t('accommodation.photoCropHint')}
                {photoSize != null && (
                  <>
                    {' · '}
                    <span className="font-medium text-slate-500 dark:text-slate-300">
                      {formatBytes(photoSize)}
                    </span>
                  </>
                )}
              </p>
            </div>
          ) : photoRemoved ? (
            <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-6 flex flex-col items-center gap-2 text-slate-400">
              <ImageOff className={MODAL_ICON_SIZE} />
              <span className="text-sm">{t('accommodation.photoRemoved')}</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-semibold text-gold hover:underline"
              >
                {t('accommodation.photoAdd')}
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                dragDepth.current += 1;
                setDragging(true);
              }}
              onDragOver={(e) => {
                // Senza preventDefault il drop non viene mai emesso.
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                dragDepth.current -= 1;
                if (dragDepth.current <= 0) {
                  dragDepth.current = 0;
                  setDragging(false);
                }
              }}
              onDrop={handleDrop}
              className={`w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 px-6 text-center transition-colors cursor-pointer ${
                dragging
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-slate-300 dark:border-slate-600 text-slate-400 hover:border-gold hover:text-gold'
              }`}
            >
              <span
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  dragging ? 'bg-gold/20' : 'bg-slate-100 dark:bg-white/5'
                }`}
              >
                <ImagePlus className="h-7 w-7" />
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
                {dragging ? t('accommodation.photoDropHere') : t('accommodation.photoAdd')}
              </span>
              <span className="text-xs text-slate-400 max-w-[26ch]">
              {t('accommodation.photoFormatHint', {
                max: formatBytes(PHOTO_MAX_INPUT_BYTES),
              })}
              </span>
            </div>
          )}

          {photoError && (
            <p className="text-sm text-error mt-2" role="alert">
              {photoError}
            </p>
          )}
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="tertiary" onClick={onCancel} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className={`${MODAL_ICON_SIZE} animate-spin`} />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};