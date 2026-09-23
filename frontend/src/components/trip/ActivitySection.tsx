import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, Check, List, Loader2, PieChart, Pencil, Plus } from 'lucide-react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { ActivityIcon } from '@/components/ActivityIcon';
import { ConfirmIconButton } from '@/components/ConfirmIconButton';
import { IconPicker } from '@/components/IconPicker';
import { DeleteButton } from '@/components/trip/DeleteButton';
import { ActivityCategoryChart } from '@/components/trip/ActivityCategoryChart';
import {
  ACTIVITY_CATEGORIES,
  createActivity,
  createActivityCategory,
  deleteActivity,
  fetchActivities,
  fetchActivityCategories,
  updateActivity,
  type ActivityInput,
} from '@/lib/api';
import { buildCategoryColorMap, CATEGORY_OTHER_VAR, getCategoryColor } from '@/lib/categoryColors';
import type { ActivityCategoryRow, ActivityRow } from '@/lib/types';

const ACTIVITY_STATUSES = ['planned', 'booked', 'completed'] as const;
const NEW_CATEGORY = '__new__';

type SortBy = 'date' | 'category';
type ViewMode = 'list' | 'chart';

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
const formatDateShort = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : '';
// Postgres `time` comes back as HH:MM:SS — the picker only ever collects
// HH:MM, so the trailing seconds are noise here.
const formatTime = (t: string | null) => (t ? t.slice(0, 5) : '');

/** Human "when" line for an activity: handles a plain date+time, an
 * all-day event, a same-day time range (start–end) and a multi-day span.
 * "All day" itself isn't spelled out — the absence of a time already says
 * that, same as it did before the all-day flag existed. */
const formatActivityWhen = (a: ActivityRow): string => {
  const spansDays = !!a.end_date && a.end_date !== a.activity_date;

  if (spansDays) {
    return `${formatDateShort(a.activity_date)} → ${formatDateShort(a.end_date)}`;
  }
  if (a.all_day) {
    return formatDate(a.activity_date);
  }
  const timeLabel =
    a.activity_time && a.end_time
      ? `${formatTime(a.activity_time)}–${formatTime(a.end_time)}`
      : formatTime(a.activity_time);
  return [formatDate(a.activity_date), timeLabel].filter(Boolean).join(' · ');
};

export const ActivitySection: React.FC<ActivitySectionProps> = ({ tripId, userId, tripStart, tripEnd }) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [categories, setCategories] = useState<ActivityCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ActivityRow['status']>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [form, setForm] = useState<FormState>({ open: false, editing: null });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [actData, catData] = await Promise.all([fetchActivities(tripId), fetchActivityCategories(tripId)]);
      setActivities(actData);
      setCategories(catData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [tripId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryLabel = useCallback(
    (c: string) => t(`activity.category.${c}`, { defaultValue: c }),
    [t]
  );

  // Full, stably-sorted list of every category in play for this trip — the
  // single source of truth for color assignment, so a filter or sort never
  // repaints an existing category's color.
  const allCategories = useMemo(() => {
    const names = new Set<string>([
      ...(ACTIVITY_CATEGORIES as readonly string[]),
      ...categories.map((c) => c.name),
    ]);
    activities.forEach((a) => a.category && names.add(a.category));
    return Array.from(names).sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b)));
  }, [activities, categories, categoryLabel]);

  const colorMap = useMemo(() => buildCategoryColorMap(allCategories), [allCategories]);

  const filtered = useMemo(
    () =>
      activities.filter(
        (a) =>
          (filterStatus === 'all' || a.status === filterStatus) &&
          (filterCategory === 'all' || a.category === filterCategory)
      ),
    [activities, filterStatus, filterCategory]
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'date') {
      arr.sort((a, b) => {
        const da = a.activity_date ?? '9999-99-99';
        const db = b.activity_date ?? '9999-99-99';
        if (da !== db) return da.localeCompare(db);
        return (a.activity_time ?? '99:99').localeCompare(b.activity_time ?? '99:99');
      });
    } else {
      arr.sort((a, b) => {
        const ca = a.category ? categoryLabel(a.category) : '￿';
        const cb = b.category ? categoryLabel(b.category) : '￿';
        return ca !== cb ? ca.localeCompare(cb) : a.name.localeCompare(b.name);
      });
    }
    return arr;
  }, [filtered, sortBy, categoryLabel]);

  const handleSubmit = async (input: ActivityInput) => {
    const category = input.category ?? null;
    if (
      category &&
      !(ACTIVITY_CATEGORIES as readonly string[]).includes(category) &&
      !categories.some((c) => c.name === category)
    ) {
      await createActivityCategory(tripId, category);
    }
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

  const handleQuickComplete = async (id: string) => {
    setError(null);
    try {
      await updateActivity(id, { status: 'completed' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-3">
          <select
            className="input-field input-field-inline"
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
            className="input-field input-field-inline"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter category"
          >
            <option value="all">{t('activity.filterAllCategory')}</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              className="input-field input-field-inline pl-9"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              aria-label={t('activity.sortLabel')}
            >
              <option value="date">{t('activity.sortByDate')}</option>
              <option value="category">{t('activity.sortByCategory')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <div className="flex items-center gap-1 bg-slate-900/5 dark:bg-white/5 p-1 rounded-full shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              title={t('activity.viewList')}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-deep-blue text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/5'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              aria-pressed={viewMode === 'chart'}
              title={t('activity.viewChart')}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-deep-blue text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/5'
              }`}
            >
              <PieChart className="w-5 h-5" />
            </button>
          </div>
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
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <p className="empty-state-title">{t('activity.empty')}</p>
          <p className="empty-state-message">{t('activity.emptySub')}</p>
        </div>
      ) : viewMode === 'chart' ? (
        <Card className="card-static">
          <ActivityCategoryChart activities={filtered} colorMap={colorMap} categoryLabel={categoryLabel} />
        </Card>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-title">{t('activity.noMatches')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((activity) => {
            const color = activity.category ? getCategoryColor(activity.category, colorMap) : CATEGORY_OTHER_VAR;

            return (
              <Card key={activity.id} noPadding className="overflow-hidden">
                <div className="flex gap-4 p-5" style={{ borderLeft: `4px solid ${color}` }}>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                      color,
                    }}
                  >
                    <ActivityIcon icon={activity.icon} className="w-7 h-7" size={28} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-poppins font-bold text-lg truncate">{activity.name}</h3>
                        {(activity.activity_date || activity.location_city) && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {formatActivityWhen(activity)}
                            {activity.location_city ? ` · ${activity.location_city}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {activity.status !== 'completed' && (
                          <ConfirmIconButton
                            icon={Check}
                            label={t('activity.markCompleted')}
                            tone="success"
                            onConfirm={() => handleQuickComplete(activity.id)}
                          />
                        )}
                        <button
                          onClick={() => setForm({ open: true, editing: activity })}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
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
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                            color,
                          }}
                        >
                          {categoryLabel(activity.category)}
                        </span>
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
        title={form.editing ? t('activity.edit') : t('activity.add')}
      >
        <ActivityForm
          initial={form.editing}
          tripStart={tripStart}
          tripEnd={tripEnd}
          customCategories={categories}
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
  customCategories: ActivityCategoryRow[];
  onSubmit: (input: ActivityInput) => Promise<void>;
  onCancel: () => void;
  /** Pre-fills the date field when creating a new activity (e.g. "+" from a
   * specific day in the Calendar) — ignored when editing (`initial` set). */
  defaultDate?: string;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  initial,
  tripStart,
  tripEnd,
  customCategories,
  onSubmit,
  onCancel,
  defaultDate,
}) => {
  const { t } = useTranslation();
  const isCustomInitial =
    !!initial?.category && !(ACTIVITY_CATEGORIES as readonly string[]).includes(initial.category);
  const initialCustomExists = customCategories.some((c) => c.name === initial?.category);

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [activityDate, setActivityDate] = useState(initial?.activity_date ?? defaultDate ?? '');
  const [activityTime, setActivityTime] = useState(initial?.activity_time ?? '');
  const [allDay, setAllDay] = useState(initial?.all_day ?? false);
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [endTime, setEndTime] = useState(initial?.end_time ?? '');
  const [locationCity, setLocationCity] = useState(initial?.location_city ?? '');
  const [category, setCategory] = useState<string>(
    isCustomInitial && !initialCustomExists ? NEW_CATEGORY : (initial?.category ?? '')
  );
  const [customCategoryName, setCustomCategoryName] = useState(
    isCustomInitial && !initialCustomExists ? initial?.category ?? '' : ''
  );
  const [icon, setIcon] = useState<string | null>(initial?.icon ?? null);
  const [status, setStatus] = useState<ActivityRow['status']>(initial?.status ?? 'planned');
  const [bookingRef, setBookingRef] = useState(initial?.booking_ref ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dateOutOfRange = activityDate ? !isWithinTrip(activityDate, tripStart, tripEnd) : false;
  const endDateOutOfRange = endDate ? !isWithinTrip(endDate, tripStart, tripEnd) : false;
  const endDateBeforeStart = endDate && activityDate ? endDate < activityDate : false;
  const canSubmit =
    name.trim().length > 0 &&
    !dateOutOfRange &&
    !endDateOutOfRange &&
    !endDateBeforeStart &&
    (category !== NEW_CATEGORY || customCategoryName.trim().length > 0);

  const resolvedCategory = category === NEW_CATEGORY ? customCategoryName.trim() || null : category || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description: description || null,
        activity_date: activityDate || null,
        activity_time: allDay ? null : activityTime || null,
        all_day: allDay,
        end_date: endDate || null,
        end_time: allDay ? null : endTime || null,
        location_city: locationCity || null,
        category: resolvedCategory,
        icon,
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

      <div className="flex items-end gap-3">
        <IconPicker value={icon} onChange={setIcon} ariaLabel={t('activity.iconLabel')} />
        <div className="flex-1">
          <Input
            label={`${t('activity.name')} *`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

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
        <div>
          <label className="label">{t('activity.endDate')}</label>
          <Input
            type="date"
            value={endDate}
            min={activityDate || tripStart || undefined}
            max={tripEnd ?? undefined}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder={t('activity.endDatePlaceholder')}
          />
        </div>
      </div>
      {(dateOutOfRange || endDateOutOfRange) && (
        <p className="text-sm text-error" role="alert">
          {t('trip.dateOutOfRange', { range: [tripStart, tripEnd].filter(Boolean).join(' — ') })}
        </p>
      )}
      {endDateBeforeStart && (
        <p className="text-sm text-error" role="alert">
          {t('activity.endDateBeforeStart')}
        </p>
      )}

      <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="w-5 h-5 rounded accent-gold cursor-pointer"
        />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('activity.allDay')}</span>
      </label>

      {!allDay && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('activity.time')}
            type="time"
            value={activityTime}
            onChange={(e) => setActivityTime(e.target.value)}
          />
          <Input
            label={t('activity.endTime')}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
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
            {customCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            <option value={NEW_CATEGORY}>{t('activity.newCategory')}</option>
          </select>
          {category === NEW_CATEGORY && (
            <div className="mt-2">
              <Input
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder={t('activity.newCategoryPlaceholder')}
                autoFocus
              />
            </div>
          )}
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
