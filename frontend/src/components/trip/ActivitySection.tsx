import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { DeleteButton } from '@/components/trip/DeleteButton';
import {
  createActivity,
  deleteActivity,
  fetchActivities,
  updateActivity,
  type ActivityInput,
} from '@/lib/api';
import type { ActivityRow } from '@/lib/types';

const ACTIVITY_CATEGORIES = ['attrazione', 'ristorante', 'transport', 'evento', 'altro'] as const;
const ACTIVITY_STATUSES = ['planned', 'booked', 'completed'] as const;

interface ActivitySectionProps {
  tripId: string;
  userId: string;
  tripStart: string | null;
  tripEnd: string | null;
}

interface FormState {
  open: boolean;
  editing: ActivityRow | null;
}

const isWithinTrip = (d: string, start: string | null, end: string | null) =>
  (!start || d >= start) && (!end || d <= end);

const formatDate = (d: string | null) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString() : '');
const formatTime = (t: string | null) => t ?? '';

export const ActivitySection: React.FC<ActivitySectionProps> = ({ tripId, userId, tripStart, tripEnd }) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ActivityRow['status']>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [form, setForm] = useState<FormState>({ open: false, editing: null });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setActivities(await fetchActivities(tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [tripId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = activities.filter(
    (a) =>
      (filterStatus === 'all' || a.status === filterStatus) &&
      (filterCategory === 'all' || a.category === filterCategory)
  );

  const handleSubmit = async (input: ActivityInput) => {
    if (form.editing) {
      await updateActivity(form.editing.id, input);
    } else {
      await createActivity(tripId, userId, input);
    }
    setForm({ open: false, editing: null });
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteActivity(id);
    await load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-3">
          <select
            className="input-field w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            aria-label="Filter status"
          >
            <option value="all">{t('activity.filterAllStatus')}</option>
            {ACTIVITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`activity.status.${s}`)}
              </option>
            ))}
          </select>
          <select
            className="input-field w-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter category"
          >
            <option value="all">{t('activity.filterAllCategory')}</option>
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`activity.category.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:ml-auto">
          <Button onClick={() => setForm({ open: true, editing: null })}>
            <Plus className="w-5 h-5" />
            {t('activity.add')}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-16 h-16 text-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <p className="empty-state-title">{t('activity.empty')}</p>
          <p className="empty-state-message">{t('activity.emptySub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((activity) => (
            <Card key={activity.id} compact>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-poppins font-bold text-lg">{activity.name}</h3>
                  {(formatDate(activity.activity_date) || formatTime(activity.activity_time)) && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {[formatDate(activity.activity_date), formatTime(activity.activity_time)]
                        .filter(Boolean)
                        .join(' · ')}
                      {activity.location_city ? ` · ${activity.location_city}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setForm({ open: true, editing: activity })}
                    className="p-2.5 rounded-lg text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                    aria-label={t('common.edit')}
                    title={t('common.edit')}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <DeleteButton onDelete={() => handleDelete(activity.id)} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={activity.status === 'completed' ? 'success' : activity.status === 'booked' ? 'info' : 'warning'}>
                  {t(`activity.status.${activity.status}`)}
                </Badge>
                {activity.category && (
                  <Badge variant="gold">{t(`activity.category.${activity.category}`)}</Badge>
                )}
              </div>

              {activity.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  {activity.description}
                </p>
              )}

              {activity.booking_ref && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {t('activity.bookingRef')}: {activity.booking_ref}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={form.open}
        onClose={() => setForm({ open: false, editing: null })}
        title={form.editing ? t('activity.edit') : t('activity.add')}
      >
        <ActivityForm
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

interface ActivityFormProps {
  initial: ActivityRow | null;
  tripStart: string | null;
  tripEnd: string | null;
  onSubmit: (input: ActivityInput) => Promise<void>;
  onCancel: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ initial, tripStart, tripEnd, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [activityDate, setActivityDate] = useState(initial?.activity_date ?? '');
  const [activityTime, setActivityTime] = useState(initial?.activity_time ?? '');
  const [locationCity, setLocationCity] = useState(initial?.location_city ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [status, setStatus] = useState<ActivityRow['status']>(initial?.status ?? 'planned');
  const [bookingRef, setBookingRef] = useState(initial?.booking_ref ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dateOutOfRange = activityDate ? !isWithinTrip(activityDate, tripStart, tripEnd) : false;
  const canSubmit = name.trim().length > 0 && !dateOutOfRange;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description: description || null,
        activity_date: activityDate || null,
        activity_time: activityTime || null,
        location_city: locationCity || null,
        category: category || null,
        status,
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

      <Input
        label={`${t('activity.name')} *`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('activity.date')}</label>
          <Input
            type="date"
            value={activityDate}
            min={tripStart ?? undefined}
            max={tripEnd ?? undefined}
            onChange={(e) => setActivityDate(e.target.value)}
          />
        </div>
        <Input label={t('activity.time')} type="time" value={activityTime} onChange={(e) => setActivityTime(e.target.value)} />
      </div>
      {dateOutOfRange && (
        <p className="text-sm text-error" role="alert">
          {t('trip.dateOutOfRange', { range: [tripStart, tripEnd].filter(Boolean).join(' — ') })}
        </p>
      )}

      <Input label={t('activity.city')} value={locationCity} onChange={(e) => setLocationCity(e.target.value)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('activity.categoryLabel')}</label>
          <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">—</option>
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`activity.category.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('activity.statusTitle')}</label>
          <select
            className="input-field"
            value={status}
            onChange={(e) => setStatus(e.target.value as ActivityRow['status'])}
          >
            {ACTIVITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`activity.status.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input label={t('activity.bookingRef')} value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} placeholder={t('activity.bookingRefPlaceholder')} />

      <Input label={t('activity.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label={t('activity.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

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