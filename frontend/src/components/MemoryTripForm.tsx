import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarClock, CalendarDays, CalendarRange, Loader2, Plane, X } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { CompanionsSection } from '@/components/CompanionsSection';
import { CountryFlag } from '@/components/CountryFlag';
import { CoverPicker } from '@/components/CoverPicker';
import { Input } from '@/components/Input';
import { ItineraryEditor } from '@/components/ItineraryEditor';
import { AirportPicker } from '@/components/trip/AirportPicker';
import { DeleteTripButton } from '@/components/trip/DeleteTripButton';
import { useAuth } from '@/auth/AuthContext';
import { createTrip, updateTrip } from '@/lib/api';
import type { Airport } from '@/lib/airports';
import { countryOptions } from '@/lib/countryCodes';
import { initialCover, saveCover, type CoverValue } from '@/lib/tripCover';
import { monthEnd, monthStart } from '@/lib/tripDates';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import { useCompanions } from '@/lib/useCompanions';
import type { Destination, Stopover, Trip } from '@/lib/types';

type Precision = 'day' | 'month';

interface MemoryTripFormProps {
  /** Viaggio-ricordo da modificare; assente = nuovo. */
  initial?: Trip | null;
  onSuccess: (trip: Trip) => void;
  /** Se presente (modifica, solo proprietario) mostra "Elimina viaggio". */
  onDeleted?: () => void;
}

const todayIso = () => {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** In un viaggio rapido i ritorni nella stessa città non contano: niente doppioni. */
const withoutDuplicateCities = (list: Destination[]) =>
  list.filter(
    (d, i) => !d.city || list.findIndex((x) => x.city.toLowerCase() === d.city.toLowerCase() && x.countryCode === d.countryCode) === i,
  );

/**
 * Viaggio passato registrato in fretta ("ricordo"): paesi visitati, città e
 * scali se li si ricorda, date (anche solo il mese), compagni e copertina. Non
 * ha il gestionale del viaggio: tutto quello che lo riguarda si modifica da qui.
 */
export const MemoryTripForm: React.FC<MemoryTripFormProps> = ({ initial, onSuccess, onDeleted }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const options = useMemo(() => countryOptions(i18n.language), [i18n.language]);
  const nameOf = (code: string) => options.find((o) => o.code === code)?.name ?? code;

  // ---------------------------------------------------------------- mete
  const [destinations, setDestinations] = useState<Destination[]>(() => withoutDuplicateCities(initial?.destinations ?? []));
  const countries = [...new Set(destinations.map((d) => (d.countryCode ?? '').toUpperCase()).filter(Boolean))];
  const cities = destinations.filter((d) => d.city);

  // ---------------------------------------------------------------- scali
  const [stopovers, setStopovers] = useState<Stopover[]>(initial?.stopovers ?? []);
  const [airportQuery, setAirportQuery] = useState('');
  // Scelto un aeroporto dall'elenco lo si aggiunge agli scali e il campo torna vuoto.
  const addStopover = (airport: Airport) => {
    if (!stopovers.some((s) => s.iata === airport.iata)) {
      setStopovers((prev) => [
        ...prev,
        {
          iata: airport.iata,
          name: airport.name,
          city: airport.city,
          countryCode: airport.country.toUpperCase(),
          lat: airport.lat,
          lon: airport.lon,
        },
      ]);
    }
    // dopo l'onChange con il codice IATA che il selettore emette insieme alla scelta
    setTimeout(() => setAirportQuery(''), 0);
  };

  // ---------------------------------------------------------------- date
  const [precision, setPrecision] = useState<Precision>(initial?.date_precision ?? 'month');
  const [start, setStart] = useState(
    initial?.start_date ? (initial.date_precision === 'month' ? initial.start_date.slice(0, 7) : initial.start_date) : '',
  );
  const [end, setEnd] = useState(
    initial?.end_date ? (initial.date_precision === 'month' ? initial.end_date.slice(0, 7) : initial.end_date) : '',
  );
  // Cambiando precisione le date si convertono (giorno → mese e viceversa) invece di sparire.
  const switchPrecision = (next: Precision) => {
    if (next === precision) return;
    if (next === 'month') {
      setStart((v) => v.slice(0, 7));
      setEnd((v) => v.slice(0, 7));
    } else {
      setStart((v) => (v ? monthStart(v) : ''));
      setEnd((v) => (v ? monthEnd(v) : ''));
    }
    setPrecision(next);
  };
  const startDate = start ? (precision === 'month' ? monthStart(start) : start) : '';
  const endDate = end ? (precision === 'month' ? monthEnd(end) : end) : startDate && precision === 'month' ? monthEnd(start) : startDate;
  const endBeforeStart = !!startDate && !!endDate && endDate < startDate;
  const startInFuture = !!startDate && startDate > todayIso();

  // ---------------------------------------------------------------- compagni, nome, copertina
  const companionsState = useCompanions(initial?.id ?? null, user?.id ?? null);
  const [name, setName] = useState(initial?.name ?? '');
  const [cover, setCover] = useState<CoverValue>(() => initialCover(initial));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const year = startDate.slice(0, 4);
  const autoName = countries.length
    ? `${countries.slice(0, 3).map(nameOf).join(', ')}${countries.length > 3 ? ` +${countries.length - 3}` : ''}${year ? ` · ${year}` : ''}`
    : '';
  const canSubmit = countries.length > 0 && !!startDate && !endBeforeStart && !startInFuture;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canSubmit) return;
    setError(null);
    setSubmitting(true);
    const input = {
      name: name.trim() || autoName,
      start_date: startDate,
      end_date: endDate || startDate,
      destinations,
      stopovers,
      is_memory: true,
      date_precision: precision,
    };
    try {
      let trip = initial ? await updateTrip(initial.id, input) : await createTrip(user.id, input);
      trip = await saveCover(trip, user.id, cover, initial?.cover_image_url ?? null);
      await companionsState.persist(trip.id);
      onSuccess(trip);
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : t('common.error'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[32px]">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* In cima: nome e copertina, uno sopra l'altra a tutta larghezza */}
      <div className="space-y-5">
        <Input
          label={t('memory.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={autoName || t('memory.namePlaceholder')}
        />
        <CoverPicker
          value={cover}
          onChange={setCover}
          defaultUnsplashQuery={cities[0] ? `${cities[0].city}, ${cities[0].country}` : countries[0] ? nameOf(countries[0]) : ''}
          className="flex flex-col"
          minHeight={170}
          inlineUnsplash
        />
      </div>

      {/* Paesi e città: due ricerche, un solo elenco raggruppato per paese */}
      <ItineraryEditor value={destinations} onChange={setDestinations} mode="memory" />

      {/* Scali: facoltativi */}
      <div>
        <label className="label !flex items-center gap-2">
          <Plane className={`${MODAL_ICON_SIZE} shrink-0`} />
          {t('memory.stopovers')}
        </label>
        <AirportPicker
          value={airportQuery}
          onChange={setAirportQuery}
          onSelect={addStopover}
          searchOnly
          tripDestinations={cities}
          placeholder={t('memory.stopoversPlaceholder')}
          ariaLabel={t('memory.stopovers')}
        />
        {stopovers.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {stopovers.map((s) => (
              <li
                key={s.iata}
                title={s.name}
                className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-sm font-semibold"
              >
                <CountryFlag code={s.countryCode} size="xs" />
                <span className="font-mono">{s.iata}</span>
                <span className="font-medium text-slate-500 dark:text-slate-400">{s.city}</span>
                <button
                  type="button"
                  onClick={() => setStopovers((prev) => prev.filter((x) => x.iata !== s.iata))}
                  aria-label={t('common.remove')}
                  title={t('common.remove')}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-error hover:bg-error/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('memory.stopoversHint')}</p>
      </div>

      {/* Date: esatte o solo il mese */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="label !m-0 !flex items-center gap-2">
            <CalendarClock className={`${MODAL_ICON_SIZE} shrink-0`} />
            {t('memory.dates')}
          </span>
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-900/5 dark:bg-white/5 border border-[var(--border-subtle)]">
            {(
              [
                ['month', CalendarRange, t('memory.precisionMonth')],
                ['day', CalendarDays, t('memory.precisionDay')],
              ] as const
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => switchPrecision(value)}
                aria-pressed={precision === value}
                className={`relative flex items-center gap-1.5 h-[32px] px-[14px] rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  precision === value
                    ? 'text-slate-950'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {precision === value && (
                  <motion.span
                    layoutId="memory-precision-active"
                    className="absolute inset-0 rounded-full bg-gold shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="w-5 h-5 relative" />
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={precision === 'month' ? t('memory.startMonth') : t('memory.startDay')}
            type={precision === 'month' ? 'month' : 'date'}
            value={start}
            max={precision === 'month' ? todayIso().slice(0, 7) : todayIso()}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <Input
            label={precision === 'month' ? t('memory.endMonth') : t('memory.endDay')}
            type={precision === 'month' ? 'month' : 'date'}
            value={end}
            min={start || undefined}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        {endBeforeStart && <p className="text-sm text-error">{t('memory.endBeforeStart')}</p>}
        {startInFuture && <p className="text-sm text-error">{t('memory.startInFuture')}</p>}
      </div>

      {user && <CompanionsSection state={companionsState} currentUserId={user.id} isOwner={!initial || initial.owner_id === user.id} />}

      <div className="flex items-center justify-between gap-3 pt-2">
        {initial && onDeleted ? <DeleteTripButton trip={initial} onDeleted={onDeleted} /> : <span />}
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};
