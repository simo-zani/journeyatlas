import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin, Pencil, Plus } from 'lucide-react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { DeleteButton } from '@/components/trip/DeleteButton';
import {
  createAccommodation,
  deleteAccommodation,
  fetchAccommodations,
  updateAccommodation,
  type AccommodationInput,
} from '@/lib/api';
import type { AccommodationRow } from '@/lib/types';

const ACCOMMODATION_TYPES = ['hotel', 'airbnb', 'house', 'apartment'] as const;

interface AccommodationSectionProps {
  tripId: string;
  tripStart: string | null;
  tripEnd: string | null;
}

interface FormState {
  open: boolean;
  editing: AccommodationRow | null;
}

const isWithinTrip = (d: string, start: string | null, end: string | null) =>
  (!start || d >= start) && (!end || d <= end);

const formatDate = (d: string | null) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString() : '');
const formatTime = (t: string | null) => t ?? '';
const formatCost = (n: number | null, currency: string | null) =>
  n != null ? `${n} ${currency ?? 'EUR'}` : '';

export const AccommodationSection: React.FC<AccommodationSectionProps> = ({ tripId, tripStart, tripEnd }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<AccommodationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ open: false, editing: null });

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

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (input: AccommodationInput) => {
    if (form.editing) {
      await updateAccommodation(form.editing.id, input);
    } else {
      await createAccommodation(tripId, input);
    }
    setForm({ open: false, editing: null });
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteAccommodation(id);
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
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛏️</div>
          <p className="empty-state-title">{t('accommodation.empty')}</p>
          <p className="empty-state-message">{t('accommodation.emptySub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((acc) => (
            <Card key={acc.id} compact>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-poppins font-bold text-lg">{acc.name}</h3>
                  <Badge variant="gold" className="mt-1">
                    {t(`accommodation.type.${acc.type}`)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setForm({ open: true, editing: acc })}
                    className="p-2.5 rounded-lg text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                    aria-label={t('common.edit')}
                    title={t('common.edit')}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <DeleteButton onDelete={() => handleDelete(acc.id)} />
                </div>
              </div>

              {acc.address && (
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {acc.address}
                </p>
              )}

              {(acc.check_in_date || acc.check_out_date) && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {acc.check_in_date
                    ? `${formatDate(acc.check_in_date)}${acc.check_in_time ? ` ${formatTime(acc.check_in_time)}` : ''}`
                    : ''}
                  {acc.check_in_date && acc.check_out_date ? ' → ' : ''}
                  {acc.check_out_date
                    ? `${formatDate(acc.check_out_date)}${acc.check_out_time ? ` ${formatTime(acc.check_out_time)}` : ''}`
                    : ''}
                </p>
              )}

              {formatCost(acc.cost_total, acc.currency) && (
                <p className="text-sm font-semibold text-deep-blue dark:text-gold mt-2">
                  {formatCost(acc.cost_total, acc.currency)}
                </p>
              )}

              {acc.booking_ref && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('accommodation.bookingRef')}: {acc.booking_ref}
                </p>
              )}
            </Card>
          ))}
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
          onSubmit={handleSubmit}
          onCancel={() => setForm({ open: false, editing: null })}
        />
      </Modal>
    </div>
  );
};

interface AccommodationFormProps {
  initial: AccommodationRow | null;
  tripStart: string | null;
  tripEnd: string | null;
  onSubmit: (input: AccommodationInput) => Promise<void>;
  onCancel: () => void;
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({ initial, tripStart, tripEnd, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<AccommodationRow['type']>(initial?.type ?? 'hotel');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [checkInDate, setCheckInDate] = useState(initial?.check_in_date ?? '');
  const [checkInTime, setCheckInTime] = useState(initial?.check_in_time ?? '');
  const [checkOutDate, setCheckOutDate] = useState(initial?.check_out_date ?? '');
  const [checkOutTime, setCheckOutTime] = useState(initial?.check_out_time ?? '');
  const [cost, setCost] = useState(initial?.cost_total != null ? String(initial.cost_total) : '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'EUR');
  const [bookingRef, setBookingRef] = useState(initial?.booking_ref ?? '');
  const [contactInfo, setContactInfo] = useState(initial?.contact_info != null ? String(initial.contact_info) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const checkInInRange = checkInDate ? isWithinTrip(checkInDate, tripStart, tripEnd) : true;
  const checkOutInRange = checkOutDate ? isWithinTrip(checkOutDate, tripStart, tripEnd) : true;
  const checkOutAfterIn = !checkOutDate || !checkInDate || checkOutDate >= checkInDate;
  const canSubmit = name.trim().length > 0 && checkInInRange && checkOutInRange && checkOutAfterIn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        type,
        address: address || null,
        check_in_date: checkInDate || null,
        check_in_time: checkInTime || null,
        check_out_date: checkOutDate || null,
        check_out_time: checkOutTime || null,
        cost_total: cost ? Number(cost) : null,
        currency: currency || null,
        booking_ref: bookingRef || null,
        contact_info: contactInfo || null,
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

      <Input
        label={`${t('accommodation.name')} *`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div>
        <label className="label">{t('accommodation.typeLabel')}</label>
        <select
          className="input-field"
          value={type}
          onChange={(e) => setType(e.target.value as AccommodationRow['type'])}
        >
          {ACCOMMODATION_TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {t(`accommodation.type.${ty}`)}
            </option>
          ))}
        </select>
      </div>

      <Input label={t('accommodation.address')} value={address} onChange={(e) => setAddress(e.target.value)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('accommodation.checkInDate')}</label>
          <Input
            type="date"
            value={checkInDate}
            min={tripStart ?? undefined}
            max={tripEnd ?? undefined}
            onChange={(e) => setCheckInDate(e.target.value)}
            aria-label={t('accommodation.checkInDate')}
          />
        </div>
        <div>
          <label className="label">{t('accommodation.checkInTime')}</label>
          <Input
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            aria-label={t('accommodation.checkInTime')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('accommodation.checkOutDate')}</label>
          <Input
            type="date"
            value={checkOutDate}
            min={checkInDate || tripStart || undefined}
            max={tripEnd ?? undefined}
            onChange={(e) => setCheckOutDate(e.target.value)}
            aria-label={t('accommodation.checkOutDate')}
          />
        </div>
        <div>
          <label className="label">{t('accommodation.checkOutTime')}</label>
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
          {t('trip.dateOutOfRange', { range: [tripStart, tripEnd].filter(Boolean).join(' — ') })}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('accommodation.cost')}
          type="number"
          min="0"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <Input label={t('accommodation.currency')} value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="EUR" />
      </div>

      <Input
        label={t('accommodation.bookingRef')}
        value={bookingRef}
        onChange={(e) => setBookingRef(e.target.value)}
        placeholder={t('accommodation.bookingRefPlaceholder')}
      />
      <Input label={t('accommodation.contactInfo')} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
      <Input label={t('accommodation.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

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