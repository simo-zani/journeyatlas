import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Loader2, Plus, Route } from 'lucide-react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { AirportPicker } from '@/components/trip/AirportPicker';
import { AirlinePicker } from '@/components/trip/AirlinePicker';
import { StationPicker } from '@/components/trip/StationPicker';
import { TrainOperatorPicker } from '@/components/trip/TrainOperatorPicker';
import { PortPicker } from '@/components/trip/PortPicker';
import { FerryOperatorPicker } from '@/components/trip/FerryOperatorPicker';
import { TransportCard } from '@/components/trip/TransportCard';
import {
  createTransport,
  deleteTransport,
  fetchTransports,
  updateTransport,
  type TransportInput,
} from '@/lib/api';
import { loadAirports, nearestAirportTz, type Airport } from '@/lib/airports';
import { loadAirlines, type Airline } from '@/lib/airlines';
import { loadTrainStations, type TrainStation } from '@/lib/trainStations';
import { loadTrainOperators, type TrainOperator } from '@/lib/trainOperators';
import { loadFerryPorts, type FerryPort } from '@/lib/ferryPorts';
import { loadFerryOperators, type FerryOperator } from '@/lib/ferryOperators';
import { useHomeCity } from '@/lib/useHomeCity';
import { DEFAULT_HOME_TZ } from '@/lib/flightTime';
import {
  TRANSPORT_TYPES,
  TRANSPORT_ICONS,
  BAGGAGE_OPTIONS,
  TRAIN_OPTIONS,
  FERRY_OPTIONS,
  type BaggageOption,
} from '@/lib/transportMeta';
import type { Destination, TransportRow, TransportType } from '@/lib/types';

interface TransportSectionProps {
  tripId: string;
  /** Mete del viaggio: alimentano gli aeroporti consigliati nel form volo. */
  tripDestinations: Destination[];
}

interface FormState {
  open: boolean;
  editing: TransportRow | null;
}

const FLIGHT_PLACEHOLDERS: Record<'departure' | 'arrival' | 'number', string> = {
  departure: 'FCO',
  arrival: 'BKK',
  number: 'AZ 084',
};

const TRAIN_PLACEHOLDERS: Record<'departure' | 'arrival' | 'number', string> = {
  departure: 'Milano Centrale',
  arrival: 'Roma Termini',
  number: 'FR 9540',
};

/** Legge il valore "a muro" da una stringa ISO salvata, senza conversione di
 * fuso: si troncano i primi 16 caratteri ("YYYY-MM-DDTHH:mm") per ottenere
 * esattamente ciò che l'utente ha digitato, indipendentemente dal fuso corrente. */
const toLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  // iso è "2024-06-15T10:30:00" o "2024-06-15T10:30:00+00:00" — sliceare
  // è sempre corretto, new Date() dipende dal fuso del dispositivo.
  return iso.slice(0, 16);
};

export const TransportSection: React.FC<TransportSectionProps> = ({
  tripId,
  tripDestinations,
}) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<TransportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ open: false, editing: null });
  // Servono alla card (logo, città, fuso orario), non solo al form: si
  // caricano una volta qui e si passano giù, invece di un fetch per card.
  const [airports, setAirports] = useState<Airport[] | null>(null);
  const [airlines, setAirlines] = useState<Airline[] | null>(null);
  const [stations, setStations] = useState<TrainStation[] | null>(null);
  const [trainOperators, setTrainOperators] = useState<TrainOperator[] | null>(null);
  const [ferryPorts, setFerryPorts] = useState<FerryPort[] | null>(null);
  const [ferryOperators, setFerryOperators] = useState<FerryOperator[] | null>(null);
  const [showHomeTz, setShowHomeTz] = useState<boolean>(() => {
    return localStorage.getItem('journeyatlas_show_home_tz') === 'true';
  });
  const homeCity = useHomeCity();

  const handleToggleHomeTz = () => {
    setShowHomeTz((prev) => {
      const next = !prev;
      localStorage.setItem('journeyatlas_show_home_tz', String(next));
      return next;
    });
  };

  // Il fuso di riferimento del viaggiatore: quello dell'aeroporto più vicino
  // a casa sua, non un valore fisso sull'Italia — la città di casa non ha un
  // fuso proprio nei dati, ma l'aeroporto più vicino sì (vedi nearestAirportTz).
  const homeTz = useMemo(
    () => (airports && homeCity?.coords ? nearestAirportTz(airports, homeCity.coords) : null) ?? DEFAULT_HOME_TZ,
    [airports, homeCity]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchTransports(tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [tripId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let active = true;
    void loadAirports().then((all) => {
      if (active) setAirports(all);
    });
    void loadAirlines().then((all) => {
      if (active) setAirlines(all);
    });
    void loadTrainStations().then((all) => {
      if (active) setStations(all);
    });
    void loadTrainOperators().then((all) => {
      if (active) setTrainOperators(all);
    });
    void loadFerryPorts().then((all) => {
      if (active) setFerryPorts(all);
    });
    void loadFerryOperators().then((all) => {
      if (active) setFerryOperators(all);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (input: TransportInput) => {
    if (form.editing) {
      await updateTransport(form.editing.id, input);
    } else {
      await createTransport(tripId, input);
    }
    setForm({ open: false, editing: null });
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteTransport(id);
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          type="button"
          role="switch"
          aria-checked={showHomeTz}
          onClick={handleToggleHomeTz}
          className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200/70 dark:hover:bg-white/[0.1] active:scale-[0.97] border border-slate-200/70 dark:border-white/10 transition-all duration-200 cursor-pointer select-none"
          title={t('transport.toggleHomeTzTooltip')}
        >
          <Clock
            className={`w-3.5 h-3.5 text-gold shrink-0 transition-transform duration-300 ease-out ${
              showHomeTz ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
            }`}
          />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('transport.showHomeTz')}
          </span>
          <span
            className={`relative inline-flex h-[18px] w-[32px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-300 ease-in-out ${
              showHomeTz ? 'bg-gold' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
                showHomeTz ? 'translate-x-[14px]' : 'translate-x-0'
              }`}
            />
          </span>
        </button>

        <Button onClick={() => setForm({ open: true, editing: null })}>
          <Plus className="w-5 h-5" />
          {t('transport.add')}
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-16 h-16 text-gold animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Route className="w-10 h-10" />
          </div>
          <p className="empty-state-title">{t('transport.empty')}</p>
          <p className="empty-state-message">{t('transport.emptySub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((transport) => (
            <TransportCard
              key={transport.id}
              transport={transport}
              airports={airports}
              airlines={airlines}
              stations={stations}
              trainOperators={trainOperators}
              ferryPorts={ferryPorts}
              ferryOperators={ferryOperators}
              homeTz={homeTz}
              showHomeTz={showHomeTz}
              onEdit={() => setForm({ open: true, editing: transport })}
              onDelete={() => handleDelete(transport.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={form.open}
        onClose={() => setForm({ open: false, editing: null })}
        title={form.editing ? t('transport.edit') : t('transport.add')}
      >
        <TransportForm
          initial={form.editing}
          onSubmit={handleSubmit}
          onCancel={() => setForm({ open: false, editing: null })}
          tripDestinations={tripDestinations}
        />
      </Modal>
    </div>
  );
};

interface TransportFormProps {
  initial: TransportRow | null;
  onSubmit: (input: TransportInput) => Promise<void>;
  onCancel: () => void;
  /** Mete del viaggio: alimentano gli aeroporti consigliati. */
  tripDestinations: Destination[];
}

export const TransportForm: React.FC<TransportFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  tripDestinations,
}) => {
  const { t } = useTranslation();
  const [type, setType] = useState<TransportType>(initial?.transport_type ?? 'flight');
  const [departure, setDeparture] = useState(initial?.departure_airport ?? '');
  const [arrival, setArrival] = useState(initial?.arrival_airport ?? '');
  const [departureAt, setDepartureAt] = useState(toLocalInput(initial?.departure_datetime ?? null));
  const [arrivalAt, setArrivalAt] = useState(toLocalInput(initial?.arrival_datetime ?? null));
  const [departureTerminal, setDepartureTerminal] = useState(initial?.departure_terminal ?? '');
  const [arrivalTerminal, setArrivalTerminal] = useState(initial?.arrival_terminal ?? '');
  const [airline, setAirline] = useState(initial?.airline ?? '');
  const [flightNumber, setFlightNumber] = useState(initial?.flight_number ?? '');
  const [bookingRef, setBookingRef] = useState(initial?.booking_ref ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [hasBackpack, setHasBackpack] = useState(initial?.has_backpack ?? false);
  const [hasCarryOn, setHasCarryOn] = useState(initial?.has_carry_on ?? false);
  const [hasCheckedBaggage, setHasCheckedBaggage] = useState(initial?.has_checked_baggage ?? false);
  const [hasSeat, setHasSeat] = useState(initial?.has_seat ?? false);
  const [hasCabin, setHasCabin] = useState(initial?.has_cabin ?? false);
  const [hasCarOnFerry, setHasCarOnFerry] = useState(initial?.has_car_on_ferry ?? false);
  const [hasDeckPassage, setHasDeckPassage] = useState(initial?.has_deck_passage ?? false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleToggleTrainOption = (key: 'has_seat' | 'has_cabin') => {
    if (key === 'has_seat') {
      setHasSeat((prev) => !prev);
      setHasCabin(false);
    } else {
      setHasCabin((prev) => !prev);
      setHasSeat(false);
    }
  };

  const handleToggleFerryOption = (key: 'has_car_on_ferry' | 'has_deck_passage' | 'has_seat' | 'has_cabin') => {
    if (key === 'has_car_on_ferry') {
      setHasCarOnFerry((prev) => !prev);
    } else if (key === 'has_deck_passage') {
      setHasDeckPassage((prev) => !prev);
      setHasSeat(false);
      setHasCabin(false);
    } else if (key === 'has_seat') {
      setHasSeat((prev) => !prev);
      setHasDeckPassage(false);
      setHasCabin(false);
    } else if (key === 'has_cabin') {
      setHasCabin((prev) => !prev);
      setHasDeckPassage(false);
      setHasSeat(false);
    }
  };

  const baggageState: Record<BaggageOption['key'], boolean> = {
    has_backpack: hasBackpack,
    has_carry_on: hasCarryOn,
    has_checked_baggage: hasCheckedBaggage,
  };
  const baggageSetters: Record<BaggageOption['key'], (v: boolean) => void> = {
    has_backpack: setHasBackpack,
    has_carry_on: setHasCarryOn,
    has_checked_baggage: setHasCheckedBaggage,
  };

  const isFlight = type === 'flight';
  const isTrain = type === 'train';
  const isFerry = type === 'ferry';
  const placeholders = isFlight
    ? FLIGHT_PLACEHOLDERS
    : isTrain
    ? TRAIN_PLACEHOLDERS
    : ({ departure: '', arrival: '', number: '' } as Record<'departure' | 'arrival' | 'number', string>);
  const departureLabel = isFlight
    ? t('transport.departureAirport')
    : isTrain
    ? t('transport.departureStation')
    : isFerry
    ? t('transport.departurePort')
    : t('transport.departureStation');
  const arrivalLabel = isFlight
    ? t('transport.arrivalAirport')
    : isTrain
    ? t('transport.arrivalStation')
    : isFerry
    ? t('transport.arrivalPort')
    : t('transport.arrivalStation');
  const companyLabel = isFlight
    ? t('transport.airline')
    : isTrain
    ? t('transport.trainOperator')
    : isFerry
    ? t('transport.ferryOperator')
    : t('transport.operator');
  const numberLabel = isFlight ? t('transport.flightNumber') : t('transport.vehicleNumber');

  const canSubmit = departure.trim().length > 0 && arrival.trim().length > 0;

  // Un mezzo può benissimo partire o arrivare fuori dalle date "ufficiali"
  // del viaggio: un volo di rientro notturno atterra spesso il giorno dopo
  // l'ultimo pernottamento, senza che quella sia una notte in più di viaggio.
  // Niente vincolo di range qui: solo l'ordine tra i due orari ha senso.
  const arrivalBeforeDeparture = departureAt && arrivalAt < departureAt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (arrivalBeforeDeparture) {
      setError(t('transport.arrivalBeforeDeparture'));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        transport_type: type,
        departure_airport: departure,
        arrival_airport: arrival,
        departure_datetime: departureAt
          ? departureAt.length === 16 ? `${departureAt}:00` : departureAt
          : null,
        arrival_datetime: arrivalAt
          ? arrivalAt.length === 16 ? `${arrivalAt}:00` : arrivalAt
          : null,
        departure_terminal: departureTerminal || null,
        arrival_terminal: arrivalTerminal || null,
        airline: airline || null,
        flight_number: flightNumber || null,
        booking_ref: bookingRef || null,
        notes: notes || null,
        has_backpack: isFlight ? hasBackpack : false,
        has_carry_on: isFlight ? hasCarryOn : false,
        has_checked_baggage: isFlight ? hasCheckedBaggage : false,
        has_seat: isTrain || isFerry ? hasSeat : false,
        has_cabin: isTrain || isFerry ? hasCabin : false,
        has_car_on_ferry: isFerry ? hasCarOnFerry : false,
        has_deck_passage: isFerry ? hasDeckPassage : false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div>
        <label className="label">{t('transport.typeLabel')}</label>
        <div className="flex flex-wrap gap-2">
          {TRANSPORT_TYPES.map((transportType) => {
            const Icon = TRANSPORT_ICONS[transportType];
            const selected = type === transportType;
            return (
              <button
                key={transportType}
                type="button"
                onClick={() => setType(transportType)}
                aria-pressed={selected}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  selected
                    ? 'border-gold bg-gold/15 text-gold-dark dark:text-gold-light'
                    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-gold hover:text-gold'
                }`}
              >
                <Icon className="w-5 h-5" />
                {t(`transport.type.${transportType}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        {isFlight ? (
          <>
            <div>
              <label className="label">{`${departureLabel} *`}</label>
              <AirportPicker
                value={departure}
                onChange={setDeparture}
                tripDestinations={tripDestinations}
                placeholder={placeholders.departure}
                ariaLabel={departureLabel}
              />
            </div>
            <div>
              <label className="label">{`${arrivalLabel} *`}</label>
              <AirportPicker
                value={arrival}
                onChange={setArrival}
                tripDestinations={tripDestinations}
                placeholder={placeholders.arrival}
                ariaLabel={arrivalLabel}
              />
            </div>
          </>
        ) : isTrain ? (
          <>
            <div>
              <label className="label">{`${departureLabel} *`}</label>
              <StationPicker
                value={departure}
                onChange={setDeparture}
                tripDestinations={tripDestinations}
                placeholder={placeholders.departure}
                ariaLabel={departureLabel}
              />
            </div>
            <div>
              <label className="label">{`${arrivalLabel} *`}</label>
              <StationPicker
                value={arrival}
                onChange={setArrival}
                tripDestinations={tripDestinations}
                placeholder={placeholders.arrival}
                ariaLabel={arrivalLabel}
              />
            </div>
          </>
        ) : isFerry ? (
          <>
            <div>
              <label className="label">{`${departureLabel} *`}</label>
              <PortPicker
                value={departure}
                onChange={setDeparture}
                tripDestinations={tripDestinations}
                placeholder={placeholders.departure}
                ariaLabel={departureLabel}
              />
            </div>
            <div>
              <label className="label">{`${arrivalLabel} *`}</label>
              <PortPicker
                value={arrival}
                onChange={setArrival}
                tripDestinations={tripDestinations}
                placeholder={placeholders.arrival}
                ariaLabel={arrivalLabel}
              />
            </div>
          </>
        ) : (
          <>
            <Input
              label={`${departureLabel} *`}
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              required
              placeholder={placeholders.departure}
            />
            <Input
              label={`${arrivalLabel} *`}
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              required
              placeholder={placeholders.arrival}
            />
          </>
        )}
      </div>

      {isFlight && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <Input
            label={t('transport.departureTerminal')}
            value={departureTerminal}
            onChange={(e) => setDepartureTerminal(e.target.value)}
            placeholder={t('transport.terminalPlaceholder')}
          />
          <Input
            label={t('transport.arrivalTerminal')}
            value={arrivalTerminal}
            onChange={(e) => setArrivalTerminal(e.target.value)}
            placeholder={t('transport.terminalPlaceholder')}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        <Input
          label={t('transport.departureAt')}
          type="datetime-local"
          value={departureAt}
          onChange={(e) => setDepartureAt(e.target.value)}
        />
        <Input
          label={t('transport.arrivalAt')}
          type="datetime-local"
          value={arrivalAt}
          onChange={(e) => setArrivalAt(e.target.value)}
        />
      </div>

      {arrivalBeforeDeparture && (
        <p className="text-sm text-error" role="alert">
          {t('transport.arrivalBeforeDeparture')}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        {isFlight ? (
          <div>
            <label className="label">{companyLabel}</label>
            <AirlinePicker
              value={airline}
              onChange={setAirline}
              ariaLabel={companyLabel}
            />
          </div>
        ) : isTrain ? (
          <div>
            <label className="label">{companyLabel}</label>
            <TrainOperatorPicker
              value={airline}
              onChange={setAirline}
              ariaLabel={companyLabel}
            />
          </div>
        ) : isFerry ? (
          <div>
            <label className="label">{companyLabel}</label>
            <FerryOperatorPicker
              value={airline}
              onChange={setAirline}
              ariaLabel={companyLabel}
            />
          </div>
        ) : (
          <Input
            label={companyLabel}
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
          />
        )}
        <Input
          label={numberLabel}
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          placeholder={placeholders.number}
        />
      </div>

      {isFlight && (
        <div>
          <label className="label">{t('transport.baggageLabel')}</label>
          <div className="flex flex-wrap gap-2">
            {BAGGAGE_OPTIONS.map(({ key, icon: Icon, labelKey }) => {
              const active = baggageState[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => baggageSetters[key](!active)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    active
                      ? 'border-gold bg-gold/15 text-gold-dark dark:text-gold-light'
                      : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-gold hover:text-gold'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isTrain && (
        <div>
          <label className="label">{t('transport.trainOptionsLabel')}</label>
          <div className="flex flex-wrap gap-2">
            {TRAIN_OPTIONS.map(({ key, icon: Icon, labelKey }) => {
              const active = key === 'has_seat' ? hasSeat : hasCabin;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleToggleTrainOption(key)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    active
                      ? 'border-gold bg-gold/15 text-gold-dark dark:text-gold-light'
                      : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-gold hover:text-gold'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isFerry && (
        <div>
          <label className="label">{t('transport.ferryOptionsLabel')}</label>
          <div className="flex flex-wrap gap-2">
            {FERRY_OPTIONS.map(({ key, icon: Icon, labelKey }) => {
              const active =
                key === 'has_car_on_ferry'
                  ? hasCarOnFerry
                  : key === 'has_deck_passage'
                  ? hasDeckPassage
                  : key === 'has_seat'
                  ? hasSeat
                  : hasCabin;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleToggleFerryOption(key)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    active
                      ? 'border-gold bg-gold/15 text-gold-dark dark:text-gold-light'
                      : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-gold hover:text-gold'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Input
        label={t('transport.bookingRef')}
        value={bookingRef}
        onChange={(e) => setBookingRef(e.target.value)}
        placeholder={t('transport.bookingRefPlaceholder')}
      />
      <Input label={t('transport.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="tertiary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};