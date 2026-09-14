import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Pencil, PlaneTakeoff, PlaneLanding, Plus } from 'lucide-react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { DeleteButton } from '@/components/trip/DeleteButton';
import {
  createFlight,
  deleteFlight,
  fetchFlights,
  updateFlight,
  type FlightInput,
} from '@/lib/api';
import type { FlightRow } from '@/lib/types';

interface FlightSectionProps {
  tripId: string;
}

interface FormState {
  open: boolean;
  editing: FlightRow | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

const toLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDateTime = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString() : '';

export const FlightSection: React.FC<FlightSectionProps> = ({ tripId }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<FlightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ open: false, editing: null });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchFlights(tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [tripId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (input: FlightInput) => {
    if (form.editing) {
      await updateFlight(form.editing.id, input);
    } else {
      await createFlight(tripId, input);
    }
    setForm({ open: false, editing: null });
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteFlight(id);
    await load();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setForm({ open: true, editing: null })}>
          <Plus className="w-5 h-5" />
          {t('flight.add')}
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✈️</div>
          <p className="empty-state-title">{t('flight.empty')}</p>
          <p className="empty-state-message">{t('flight.emptySub')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((flight) => (
            <Card key={flight.id} compact>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-poppins font-bold text-lg">{flight.departure_airport}</span>
                    <PlaneTakeoff className="w-5 h-5 text-deep-blue dark:text-gold shrink-0" />
                    <PlaneLanding className="w-5 h-5 text-light-blue shrink-0" />
                    <span className="font-poppins font-bold text-lg">{flight.arrival_airport}</span>
                  </div>

                  {formatDateTime(flight.departure_datetime) && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {t('flight.departure')}: {formatDateTime(flight.departure_datetime)}
                    </p>
                  )}
                  {formatDateTime(flight.arrival_datetime) && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('flight.arrival')}: {formatDateTime(flight.arrival_datetime)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(flight.airline || flight.flight_number) && (
                    <Badge variant="info">
                      {[flight.airline, flight.flight_number].filter(Boolean).join(' · ')}
                    </Badge>
                  )}
                  <button
                    onClick={() => setForm({ open: true, editing: flight })}
                    className="p-2.5 rounded-lg text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                    aria-label={t('common.edit')}
                    title={t('common.edit')}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <DeleteButton onDelete={() => handleDelete(flight.id)} />
                </div>
              </div>

              {flight.booking_ref && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {t('flight.bookingRef')}: {flight.booking_ref}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={form.open}
        onClose={() => setForm({ open: false, editing: null })}
        title={form.editing ? t('flight.edit') : t('flight.add')}
      >
        <FlightForm
          initial={form.editing}
          onSubmit={handleSubmit}
          onCancel={() => setForm({ open: false, editing: null })}
        />
      </Modal>
    </div>
  );
};

interface FlightFormProps {
  initial: FlightRow | null;
  onSubmit: (input: FlightInput) => Promise<void>;
  onCancel: () => void;
}

const FlightForm: React.FC<FlightFormProps> = ({ initial, onSubmit, onCancel }) => {
  const { t } = useTranslation();
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

  const canSubmit = departure.trim().length > 0 && arrival.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={`${t('flight.departureAirport')} *`}
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          required
          placeholder="FCO"
        />
        <Input
          label={`${t('flight.arrivalAirport')} *`}
          value={arrival}
          onChange={(e) => setArrival(e.target.value)}
          required
          placeholder="BKK"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('flight.departureAt')}
          type="datetime-local"
          value={departureAt}
          onChange={(e) => setDepartureAt(e.target.value)}
        />
        <Input
          label={t('flight.arrivalAt')}
          type="datetime-local"
          value={arrivalAt}
          onChange={(e) => setArrivalAt(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={t('flight.airline')} value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="e.g. ITA Airways" />
        <Input label={t('flight.flightNumber')} value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="AZ 084" />
      </div>

      <Input
        label={t('flight.bookingRef')}
        value={bookingRef}
        onChange={(e) => setBookingRef(e.target.value)}
        placeholder={t('flight.bookingRefPlaceholder')}
      />
      <Input label={t('flight.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

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