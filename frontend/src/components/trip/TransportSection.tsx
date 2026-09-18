import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bus,
  Car,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plane,
  Plus,
  Route,
  Ship,
  TrainFront,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { DeleteButton } from '@/components/trip/DeleteButton';
import {
  createTransport,
  deleteTransport,
  fetchTransports,
  updateTransport,
  type TransportInput,
} from '@/lib/api';
import type { TransportRow, TransportType } from '@/lib/types';

interface TransportSectionProps {
  tripId: string;
}

interface FormState {
  open: boolean;
  editing: TransportRow | null;
}

const TRANSPORT_TYPES: TransportType[] = ['flight', 'train', 'bus', 'ferry', 'car', 'other'];

const TRANSPORT_ICONS: Record<TransportType, LucideIcon> = {
  flight: Plane,
  train: TrainFront,
  bus: Bus,
  ferry: Ship,
  car: Car,
  other: MoreHorizontal,
};

const FLIGHT_PLACEHOLDERS: Record<'departure' | 'arrival' | 'number', string> = {
  departure: 'FCO',
  arrival: 'BKK',
  number: 'AZ 084',
};

const pad = (n: number) => String(n).padStart(2, '0');

const toLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDateTime = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString() : '';

export const TransportSection: React.FC<TransportSectionProps> = ({ tripId }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<TransportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ open: false, editing: null });

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
      <div className="flex justify-end mb-4">
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
        <div className="space-y-4">
          {items.map((transport) => {
            const TypeIcon = TRANSPORT_ICONS[transport.transport_type] ?? MoreHorizontal;
            return (
              <Card key={transport.id} compact>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TypeIcon className="w-5 h-5 text-deep-blue dark:text-gold shrink-0" />
                      <span className="font-poppins font-bold text-lg">{transport.departure_airport}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-poppins font-bold text-lg">{transport.arrival_airport}</span>
                    </div>

                    {formatDateTime(transport.departure_datetime) && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {t('transport.departureAt')}: {formatDateTime(transport.departure_datetime)}
                      </p>
                    )}
                    {formatDateTime(transport.arrival_datetime) && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('transport.arrivalAt')}: {formatDateTime(transport.arrival_datetime)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="info">
                      {t(`transport.type.${transport.transport_type}`)}
                    </Badge>
                    {(transport.airline || transport.flight_number) && (
                      <Badge variant="info">
                        {[transport.airline, transport.flight_number].filter(Boolean).join(' · ')}
                      </Badge>
                    )}
                    <button
                      onClick={() => setForm({ open: true, editing: transport })}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                      aria-label={t('common.edit')}
                      title={t('common.edit')}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <DeleteButton onDelete={() => handleDelete(transport.id)} />
                  </div>
                </div>

                {transport.booking_ref && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {t('transport.bookingRef')}: {transport.booking_ref}
                  </p>
                )}
              </Card>
            );
          })}
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
        />
      </Modal>
    </div>
  );
};

interface TransportFormProps {
  initial: TransportRow | null;
  onSubmit: (input: TransportInput) => Promise<void>;
  onCancel: () => void;
}

const TransportForm: React.FC<TransportFormProps> = ({ initial, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [type, setType] = useState<TransportType>(initial?.transport_type ?? 'flight');
  const [departure, setDeparture] = useState(initial?.departure_airport ?? '');
  const [arrival, setArrival] = useState(initial?.arrival_airport ?? '');
  const [departureAt, setDepartureAt] = useState(toLocalInput(initial?.departure_datetime ?? null));
  const [arrivalAt, setArrivalAt] = useState(toLocalInput(initial?.arrival_datetime ?? null));
  const [airline, setAirline] = useState(initial?.airline ?? '');
  const [flightNumber, setFlightNumber] = useState(initial?.flight_number ?? '');
  const [bookingRef, setBookingRef] = useState(initial?.booking_ref ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isFlight = type === 'flight';
  const placeholders = isFlight
    ? FLIGHT_PLACEHOLDERS
    : ({ departure: '', arrival: '', number: '' } as Record<'departure' | 'arrival' | 'number', string>);
  const departureLabel = isFlight ? t('transport.departureAirport') : t('transport.departureStation');
  const arrivalLabel = isFlight ? t('transport.arrivalAirport') : t('transport.arrivalStation');
  const companyLabel = isFlight ? t('transport.airline') : t('transport.operator');
  const numberLabel = isFlight ? t('transport.flightNumber') : t('transport.vehicleNumber');

  const canSubmit = departure.trim().length > 0 && arrival.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        transport_type: type,
        departure_airport: departure,
        arrival_airport: arrival,
        departure_datetime: departureAt
          ? new Date(departureAt).toISOString()
          : null,
        arrival_datetime: arrivalAt ? new Date(arrivalAt).toISOString() : null,
        airline: airline || null,
        flight_number: flightNumber || null,
        booking_ref: bookingRef || null,
        notes: notes || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={companyLabel} value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="e.g. ITA Airways" />
        <Input
          label={numberLabel}
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          placeholder={placeholders.number}
        />
      </div>

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