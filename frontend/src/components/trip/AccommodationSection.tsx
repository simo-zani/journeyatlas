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
  DoorOpen,
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
import { PickerInput, CityPicker, type CityValue } from '@/components/trip/CityPicker';
import {
  createAccommodation,
  deleteAccommodation,
  fetchAccommodations,
  updateAccommodation,
  type AccommodationInput,
} from '@/lib/api';

import { supabase } from '@/lib/supabase';
import type { AccommodationRow, Destination } from '@/lib/types';
import { TennisRacketIcon } from '@/components/TennisRacketIcon';
import { fileToLogoDataUrl } from '@/lib/logoImage';
import { TimeField } from '@/components/TimeField';
import { useIsStuck } from '@/lib/useIsStuck';
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
  { key: 'tennis', Icon: TennisRacketIcon },
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

/** Data senza anno: la card mostra la notte di fine soggiorno, l'anno è
 *  ridondante (è quello del viaggio) e ruba spazio nelle card strette. */
const formatDayMonth = (d: string | null) =>
  d
    ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })
    : '';
/**
 * Su iPhone un link a `maps.apple.com` fa comparire il foglio di sistema
 * "Apri in", che elenca Maps, Google e Waze se sono installati. Su desktop e
 * Android si va diretti a Google Maps. L'iPad in modalità desktop si dichiara
 * come Mac nel user agent, quindi per non mandarlo su Google controllo anche i
 * punti touch.
 */
const isAppleMobile = () => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return /Mac/.test(ua) && navigator.maxTouchPoints > 1;
};

/**
 * Vince sempre l'indirizzo scritto dall'utente. Le `coordinates` memorizzate
 * arrivano dal picker città (vedi l'invio del form) e sono il centro del
 * paese, non la struttura: usarle portava il pin in mezzo alla città. Le
 * coordinate restano solo come ripiego se non c'è nessun testo da cercare.
 * L'indirizzo viene prima della città perché i geocoder risolvono meglio
 * l'elemento più specifico per primo.
 */
const mapsUrl = (row: AccommodationRow) => {
  const place = [row.address, row.city].filter(Boolean).join(', ');
  const query = place || (row.coordinates ? `${row.coordinates.lat},${row.coordinates.lon}` : '');
  if (!query) return null;
  return isAppleMobile()
    ? `https://maps.apple.com/?q=${encodeURIComponent(query)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

/** Numero di notti = check-out meno check-in. Entrambe le date sono stringhe
 *  'YYYY-MM-DD' interpretate come mezzanotte UTC, quindi la differenza in
 *  giorni è esatta e immune ai fusi orari. */
const countNights = (checkIn: string | null, checkOut: string | null) => {
  if (!checkIn || !checkOut) return null;
  const ms = new Date(`${checkOut}T00:00:00Z`).getTime() - new Date(`${checkIn}T00:00:00Z`).getTime();
  const nights = Math.round(ms / 86400000);
  return nights > 0 ? nights : null;
};
const formatTime = (t: string | null) =>
  t ? t.slice(0, 5) : '';

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
const PlatformLogo: React.FC<{ platform: string; logo?: string | null; className?: string }> = ({
  platform,
  logo,
  className = MODAL_ICON_SIZE,
}) => {
  const domain = platformDomain(platform);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [domain]);

  // Logo caricato a mano: ha la precedenza sul favicon
  if (logo) {
    return <img src={logo} alt="" className={`${className} shrink-0 object-contain rounded`} />;
  }

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

// ─── Platform picker ──────────────────────────────────────────────────────────

interface PlatformPickerProps {
  value: string;
  onChange: (v: string) => void;
  /** Logo personalizzato, per le piattaforme non presenti in elenco. */
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
  placeholder?: string;
}

const PlatformPicker: React.FC<PlatformPickerProps> = ({ value, onChange, logo, onLogoChange, placeholder }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
          // passando a una piattaforma nota il logo personalizzato non serve più
          if (platformDomain(v)) onLogoChange(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        leading={
          value.trim() ? (
            <PlatformLogo platform={value} logo={logo} />
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
                <PlatformLogo platform={value} logo={logo} />
                <span className="flex-1 truncate">
                  {t('accommodation.bookingPlatformCustom', { value: value.trim() })}
                </span>
                <Check className={`${MODAL_ICON_SIZE} text-gold shrink-0`} />
              </button>
            </li>
          )}
        </ul>
      )}

      {/* Piattaforma non in elenco: logo facoltativo, ritagliato e ridotto a pochi KB */}
      {value.trim() && !platformDomain(value) && (
        <div className="mt-2 flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setUploadError(false);
              try {
                onLogoChange(await fileToLogoDataUrl(file));
              } catch {
                setUploadError(true);
              }
            }}
          />
          {logo ? (
            <img
              src={logo}
              alt=""
              className="w-10 h-10 rounded-xl object-contain border border-slate-200 dark:border-white/10"
            />
          ) : (
            <span className="w-10 h-10 rounded-xl border border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400">
              <ImagePlus className={MODAL_ICON_SIZE} />
            </span>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm font-semibold text-gold hover:underline cursor-pointer"
          >
            {logo ? t('accommodation.platformLogoChange') : t('accommodation.platformLogoUpload')}
          </button>
          {logo && (
            <button
              type="button"
              onClick={() => onLogoChange(null)}
              className="text-sm text-slate-500 hover:text-error cursor-pointer"
            >
              {t('accommodation.platformLogoRemove')}
            </button>
          )}
          {uploadError && <span className="text-sm text-error">{t('accommodation.platformLogoError')}</span>}
        </div>
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
  /** Sola lettura (ruolo viewer): nasconde e disabilita ogni modifica. */
  readOnly?: boolean;
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
  readOnly = false,
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
   * Le card seguono il soggiorno dal più vecchio al più recente. Le date sono
   * stringhe 'YYYY-MM-DD', quindi il confronto lessicografico coincide con
   * quello cronologico: niente Date da parsare, niente rischi di fuso orario.
   * Chi non ha una data di check-in non ha posizione cronologica e va in
   * fondo; a parità di data l'ordine di inserimento è conservato, perché
   * sort è stabile. Copia l'array: `items` è lo stato e non va mutato.
   */
  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (!a.check_in_date && !b.check_in_date) return 0;
        if (!a.check_in_date) return 1;
        if (!b.check_in_date) return -1;
        if (a.check_in_date === b.check_in_date) return 0;
        return a.check_in_date < b.check_in_date ? -1 : 1;
      }),
    [items]
  );

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
    if (readOnly) return;
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
    if (readOnly) return;
    await deleteAccommodation(acc.id);
    // Pulizia della foto: l'alloggio non esiste più, l'oggetto no.
    await discardPhotoObject(acc.photo_path, null);
    await load();
  };

  const [addBarSentinelRef, addBarStuck] = useIsStuck(56);

  return (
    <div className="space-y-6">
      {/* Barra con il pulsante: stessa posizione, altezza e comportamento sticky del tab Attività */}
      {!readOnly && (
      <>
      <div ref={addBarSentinelRef} className="h-0 !mt-0" aria-hidden="true" />
      <div
        className={`!mt-0 sticky top-14 z-20 py-1.5 before:content-[''] before:absolute before:-z-10 before:inset-x-[-50vw] before:top-[-120px] before:bottom-[-12px] before:backdrop-blur-md before:bg-[var(--surface-0)]/60 before:pointer-events-none before:[mask-image:linear-gradient(to_bottom,black_80%,transparent)] before:transition-opacity before:duration-500 before:ease-out ${addBarStuck ? 'before:opacity-100' : 'before:opacity-0'} flex items-center justify-end`}
      >
        <div className="py-1">
          <Button className="!h-[38px] !min-h-0 !py-0 !px-5 !text-xs" onClick={() => setForm({ open: true, editing: null })}>
            <Plus className="w-5 h-5" />
            {t('accommodation.add')}
          </Button>
        </div>
      </div>
      </>
      )}

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛏️</div>
          <p className="empty-state-title">{t('accommodation.empty')}</p>
          <p className="empty-state-message">{t('accommodation.emptySub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {sorted.map((acc) => {
      const hasFooterRow = Boolean(
        acc.contact_phone || acc.contact_email || acc.booking_platform || acc.booking_url
      );
      const nights = countNights(acc.check_in_date, acc.check_out_date);
      // Le camere si contano solo negli hotel: un appartamento è per
      // definizione l'intero, quindi il numero non ha senso lì.
      const rooms = acc.rooms_count != null && acc.rooms_count > 0 ? acc.rooms_count : null;
      const bathrooms =
        acc.type === 'apartment' && acc.bathrooms_count != null && acc.bathrooms_count > 0
          ? acc.bathrooms_count
          : null;
      const roomsLabel =
        rooms == null
          ? ''
          : t(acc.type === 'hotel' ? 'accommodation.roomsValue' : 'accommodation.apartmentRoomsValue', { count: rooms });
      const maps = mapsUrl(acc);
      return (
            <Card key={acc.id} noPadding>
              {/* Photo header */}
              {acc.photo_url && (
                <div className="relative h-36 overflow-hidden rounded-t-xl">
                  <img
                    src={acc.photo_url}
                    alt={acc.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              {/* px-5 = 20px ai lati e sotto l'ultima riga della card (badge
                  tipo/stelle/camere). Sopra resta 16px, il margine sotto cui è
                  centrato il titolo. La foto sta fuori da questo div e resta a
                  filo del bordo. */}
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex min-h-14 items-center">
                    {/* Due righe sempre: se il nome è corto o manca, lo spazio
                        vuoto tiene allineati i metadati di tutte le card. Il
                        titolo è centrato in quello spazio, così il margine
                        sopra (fine foto) e sotto (indirizzo) si compensano
                        invece di essere sbilanciati. Il line-clamp sta sul
                        <h3> perché si porta dietro `display: -webkit-box`. */}
                    <h3
                      className="font-poppins font-bold text-lg leading-7 line-clamp-2 break-words"
                      title={acc.name}
                    >
                      {acc.name}
                    </h3>
                  </div>
                  {!readOnly && (
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
                  )}
                </div>

                {/* Location — il contenitore esiste sempre (min-h-10 = 2 righe
                    di text-sm) così le card senza indirizzo non "tirano su"
                    quelle sotto. mt-4 = il padding sopra il titolo, così il
                    titolo ha lo stesso margine sotto e sopra. Il link è un <a>
                    vero, non un click JavaScript: è il foglio "Apri in" di iOS a
                    fare il resto, e su desktop va su Google Maps. */}
                <p className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-4 min-h-10">
                  {maps && (
                    <a
                      href={maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-1.5 min-w-0 hover:text-light-blue hover:underline transition-colors"
                    >
                      <MapPin className={`${CARD_ICON_SIZE} shrink-0 mt-px`} />
                      <span
                        className="line-clamp-2 min-w-0"
                        title={[acc.city, acc.address].filter(Boolean).join(', ')}
                      >
                        {[acc.city, acc.address].filter(Boolean).join(', ')}
                      </span>
                    </a>
                  )}
                </p>

                {/* Arrivo e partenza nella stessa cella, divisi da un filetto;
                    la cella di destra mostra le notti. Anno omesso: nella card
                    è ridondante (è quello del viaggio) e stretto non ci sta. */}
                {(acc.check_in_date || acc.check_out_date || nights) && (
                  <div className="flex gap-2 mt-2 text-sm">
                    {(acc.check_in_date || acc.check_out_date) && (
                      <div className="flex-[2] min-w-0 bg-slate-100 dark:bg-white/5 rounded-xl px-2 py-2 text-center">
                        <div className="flex items-stretch justify-center">
                          {acc.check_in_date && (
                            <div className="px-2 min-w-0">
                              <p className="text-xs text-slate-400 mb-0.5">
                                {t('accommodation.checkIn')}
                              </p>
                              <p className="font-semibold">
                                {formatDayMonth(acc.check_in_date)}
                                {acc.check_in_time && (
                                  <span className="font-normal text-slate-400"> ({formatTime(acc.check_in_time)})</span>
                                )}
                              </p>
                            </div>
                          )}
                          {acc.check_in_date && acc.check_out_date && (
                            <span
                              aria-hidden="true"
                              className="mx-1 w-px shrink-0 bg-slate-300 dark:bg-slate-600"
                            />
                          )}
                          {acc.check_out_date && (
                            <div className="px-2 min-w-0">
                              <p className="text-xs text-slate-400 mb-0.5">
                                {t('accommodation.checkOut')}
                              </p>
                              <p className="font-semibold">
                                {formatDayMonth(acc.check_out_date)}
                                {acc.check_out_time && (
                                  <span className="font-normal text-slate-400"> ({formatTime(acc.check_out_time)})</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {nights && (
                      <div className="flex-1 min-w-0 bg-slate-100 dark:bg-white/5 rounded-xl px-2 py-2 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">
                          {t('accommodation.nights')}
                        </p>
                        <p
                          className="font-semibold flex items-center justify-center gap-1.5"
                          title={t('accommodation.nightsValue', { count: nights })}
                        >
                          <Moon className={`${CARD_ICON_SIZE} shrink-0`} />
                          {nights}
                        </p>
                      </div>
                    )}
                  </div>
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
                              <PlatformLogo platform={acc.booking_platform} logo={acc.booking_platform_logo} className="w-6 h-6" />
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
                      {rooms != null && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400"
                          title={roomsLabel}
                        >
                          <DoorOpen className={`${CARD_ICON_SIZE} shrink-0`} />
                          {roomsLabel}
                        </span>
                      )}
                      {bathrooms != null && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400"
                          title={t('accommodation.bathroomsValue', { count: bathrooms })}
                        >
                          <Bath className={`${CARD_ICON_SIZE} shrink-0`} />
                          {t('accommodation.bathroomsValue', { count: bathrooms })}
                        </span>
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

      {!readOnly && (
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
      )}
    </div>
  );
};

// ─── Form ─────────────────────────────────────────────────────────────────────

interface AccommodationFormProps {
  initial: AccommodationRow | null;
  tripStart: string | null;
  tripEnd: string | null;
  /** Opzionale: il calendario apre il form per la modifica inline e non ha
   *  il contesto mete del viaggio, quindi il picker città resta senza
   *  suggerimenti e passa in ricerca libera. */
  tripDestinations?: Destination[];
  onSubmit: (input: AccommodationInput, photo: PhotoSelection) => Promise<void>;
  onCancel: () => void;
}

export const AccommodationForm: React.FC<AccommodationFormProps> = ({
  initial,
  tripStart,
  tripEnd,
  tripDestinations = [],
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
  const [checkInTime, setCheckInTime] = useState(initial?.check_in_time?.slice(0, 5) ?? '');
  const [checkOutDate, setCheckOutDate] = useState(initial?.check_out_date ?? '');
  const [checkOutTime, setCheckOutTime] = useState(initial?.check_out_time?.slice(0, 5) ?? '');
  const [cost, setCost] = useState(initial?.cost_total != null ? String(initial.cost_total) : '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'EUR');
  const [bookingRef, setBookingRef] = useState(initial?.booking_ref ?? '');
  const [bookingUrl, setBookingUrl] = useState(initial?.booking_url ?? '');
  const [bookingPlatform, setBookingPlatform] = useState(initial?.booking_platform ?? '');
  const [bookingPlatformLogo, setBookingPlatformLogo] = useState<string | null>(initial?.booking_platform_logo ?? null);
  // 0 = non valutata. Fuori dal range 1-5 non può arrivare dal DB (CHECK),
  // ma un valore legacy strutturato non deve rompere il render.
  const [stars, setStars] = useState<number>(() => {
    const s = initial?.stars ?? 0;
    return s >= 1 && s <= STAR_MAX ? s : 0;
  });
  // Stringa vuota = non specificato. Solo hotel: su un appartamento la camera
  // è l'appartamento stesso (vedi l'invio, che azzera il campo).
  const [bathroomsCount, setBathroomsCount] = useState(
    initial?.bathrooms_count != null && initial.bathrooms_count > 0 ? String(initial.bathrooms_count) : ''
  );
  const [roomsCount, setRoomsCount] = useState(
    initial?.rooms_count != null && initial.rooms_count > 0 ? String(initial.rooms_count) : ''
  );
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
        // Idem per le camere: l'appartamento è già l'intero, quindi il conteggio
        // (e il numero salvato in precedenza) si azzera. Il > 0 tiene fuori anche
        // lo 0 digitato a mano, che il CHECK del DB rifiuterebbe.
        // Camere (hotel) o stanze (appartamento): stessa colonna, etichetta diversa.
        rooms_count: Number(roomsCount) > 0 ? Number(roomsCount) : null,
        // I bagni valgono solo per gli appartamenti.
        bathrooms_count: type === 'apartment' && Number(bathroomsCount) > 0 ? Number(bathroomsCount) : null,
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
        booking_platform_logo: bookingPlatform.trim() ? bookingPlatformLogo : null,
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

      {/* Hotel: numero di camere. Appartamento: numero di stanze e di bagni. Facoltativi. */}
      {type === 'hotel' ? (
        <Input
          label={t('accommodation.rooms')}
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={roomsCount}
          onChange={(e) => setRoomsCount(e.target.value)}
          placeholder="2"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('accommodation.apartmentRooms')}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={roomsCount}
            onChange={(e) => setRoomsCount(e.target.value)}
            placeholder="3"
          />
          <Input
            label={t('accommodation.bathrooms')}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={bathroomsCount}
            onChange={(e) => setBathroomsCount(e.target.value)}
            placeholder="2"
          />
        </div>
      )}

      {/* City */}
      <div>
        <label className="label">{t('accommodation.city')}</label>
        <CityPicker
          value={city}
          onChange={setCity}
          tripDestinations={tripDestinations}
          placeholder={t('cityPicker.placeholder')}
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
              <TimeField
                value={checkInTime}
                onChange={setCheckInTime}
                ariaLabel={t('accommodation.checkInTime')}
                clearLabel={t('common.clear', { defaultValue: 'Cancella' })}
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
              <TimeField
                value={checkOutTime}
                onChange={setCheckOutTime}
                ariaLabel={t('accommodation.checkOutTime')}
                clearLabel={t('common.clear', { defaultValue: 'Cancella' })}
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
              logo={bookingPlatformLogo}
              onLogoChange={setBookingPlatformLogo}
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