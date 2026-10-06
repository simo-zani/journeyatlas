import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, Check, ChevronDown, List, Loader2, MapPin, PieChart, Pencil, Plus } from 'lucide-react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { ActivityIcon } from '@/components/ActivityIcon';
import { ConfirmIconButton } from '@/components/ConfirmIconButton';
import { IconPicker } from '@/components/IconPicker';
import { useIsStuck } from '@/lib/useIsStuck';
import { CollapsibleLabel } from '@/components/CollapsibleLabel';
import { motion } from 'framer-motion';
import { useSidebarExpanded } from '@/lib/useSidebarExpanded';
import { OperatorLogo } from '@/components/OperatorLogo';
import { TimeField } from '@/components/TimeField';
import { OperatorPicker } from '@/components/trip/OperatorPicker';
import { CityPicker, type CityValue } from '@/components/trip/CityPicker';
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
import type { ActivityCategoryRow, ActivityRow, Destination } from '@/lib/types';

const ACTIVITY_STATUSES = ['planned', 'booked', 'completed'] as const;
const NEW_CATEGORY = '__new__';

// Stesse misure dei filtri del calendario (pillola alta 38px, testo xs bold).
const FILTER_SELECT =
  'input-field !h-[38px] !w-full !py-0 !pl-[18px] !pr-10 !text-xs !font-bold !rounded-xl !bg-slate-900/80 !border-slate-700/60 !text-slate-300 !shadow-md backdrop-blur-xl cursor-pointer appearance-none';

/** Selettore filtro: larghezza fissa uguale per tutti, freccia staccata dal bordo. */
const FilterSelect: React.FC<{ children: React.ReactNode; icon?: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  children,
  icon,
  className = '',
  ...props
}) => (
  <div className="relative w-44 shrink-0">
    {icon}
    <select className={`${FILTER_SELECT} ${icon ? '!pl-10' : ''} ${className}`} {...props}>
      {children}
    </select>
    <ChevronDown className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

type SortBy = 'date' | 'category';
type ViewMode = 'list' | 'chart';

interface ActivitySectionProps {
  tripId: string;
  userId: string;
  tripStart: string | null;
  tripEnd: string | null;
  tripDestinations?: Destination[];
}

interface FormState {
  open: boolean;
  editing: ActivityRow | null;
}

const isWithinTrip = (d: string, start: string | null, end: string | null) =>
  (!start || d >= start) && (!end || d <= end);

const formatDateShort = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : '';
// Postgres `time` comes back as HH:MM:SS — the picker only ever collects
// HH:MM, so the trailing seconds are noise here.
const formatTime = (t: string | null) => (t ? t.slice(0, 5) : '');

/** Durata tra due orari HH:MM ("3 h", "1 h 30 min"); null se manca uno dei due o la fine non segue l'inizio. */
const formatDuration = (start: string | null, end: string | null): string | null => {
  if (!start || !end) return null;
  const toMin = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5));
  const diff = toMin(end) - toMin(start);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
};

export const ActivitySection: React.FC<ActivitySectionProps> = ({ tripId, userId, tripStart, tripEnd, tripDestinations }) => {
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
    // Ordine per chiave (non per etichetta tradotta): il colore dipende dalla posizione,
    // quindi cambiando lingua l'ordine - e i colori - devono restare identici.
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [activities, categories]);

  // Per il menu dei filtri l'ordine è invece quello alfabetico delle etichette mostrate.
  const categoryOptions = useMemo(
    () => [...allCategories].sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b))),
    [allCategories, categoryLabel]
  );

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

  const [filterBarSentinelRef, filterBarStuck] = useIsStuck(56);
  // Durante la conferma di eliminazione gli altri pulsanti della card spariscono.
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  // Con la sidebar estesa lo spazio si riduce: le viste mostrano solo l'icona.
  const compact = useSidebarExpanded();

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
    <div className="space-y-6">
      {/* Barra filtri: stessa posizione, altezza e comportamento sticky di quella del calendario */}
      <div ref={filterBarSentinelRef} className="h-0 !mt-0" aria-hidden="true" />
      <div
        className={`!mt-0 sticky top-14 z-20 py-1.5 before:content-[''] before:absolute before:-z-10 before:inset-x-[-50vw] before:top-[-120px] before:bottom-[-12px] before:backdrop-blur-md before:bg-[var(--surface-0)]/60 before:pointer-events-none before:[mask-image:linear-gradient(to_bottom,black_80%,transparent)] before:transition-opacity before:duration-500 before:ease-out ${filterBarStuck ? 'before:opacity-100' : 'before:opacity-0'} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-2 flex-wrap py-1">
          <FilterSelect
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
          </FilterSelect>
          <FilterSelect
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter category"
          >
            <option value="all">{t('activity.filterAllCategory')}</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            icon={
              <ArrowUpDown className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            }
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            aria-label={t('activity.sortLabel')}
          >
            <option value="date">{t('activity.sortByDate')}</option>
            <option value="category">{t('activity.sortByCategory')}</option>
          </FilterSelect>
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <div className="flex items-center gap-1 bg-slate-900/80 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 dark:border-white/10 p-1 rounded-full shrink-0 shadow-md">
            {(
              [
                ['list', List, t('activity.viewListShort'), t('activity.viewList')],
                ['chart', PieChart, t('activity.viewChartShort'), t('activity.viewChart')],
              ] as const
            ).map(([mode, Icon, label, title]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                aria-label={title}
                title={compact ? title : undefined}
                className={`relative flex items-center justify-center py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-[color,background-color,padding] duration-300 cursor-pointer ${
                  compact ? 'px-3.5' : 'px-5'
                } ${
                  viewMode === mode ? 'text-slate-950' : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
                }`}
              >
                {viewMode === mode && (
                  <motion.span
                    layoutId="activity-view-active"
                    className="absolute inset-0 rounded-full bg-gold shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="w-5 h-5 shrink-0 relative" />
                <span className="relative flex">
                  <CollapsibleLabel compact={compact}>{label}</CollapsibleLabel>
                </span>
              </button>
            ))}
          </div>
          <Button className="!h-[38px] !min-h-0 !py-0 !px-5 !text-xs" onClick={() => setForm({ open: true, editing: null })}>
            <Plus className="w-5 h-5" />
            {t('activity.add')}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {sorted.map((activity) => {
            const color = activity.category ? getCategoryColor(activity.category, colorMap) : CATEGORY_OTHER_VAR;

            return (
              <Card key={activity.id} noPadding className="overflow-hidden flex flex-col">
                {/* Testata: sfumatura nel colore della categoria, icona grande e titolo */}
                <div
                  className="relative px-5 py-5"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${color} 26%, transparent) 0%, color-mix(in srgb, ${color} 6%, transparent) 55%, transparent 100%)`,
                  }}
                >
                  <div className="flex items-center gap-5">
                    <ActivityIcon icon={activity.icon} className="w-14 h-14 shrink-0" size={44} />
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-poppins font-bold text-lg leading-7 line-clamp-2 break-words"
                        title={activity.name}
                      >
                        {activity.name}
                      </h3>
                      {activity.category && (
                        <span
                          className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                            color,
                          }}
                        >
                          {categoryLabel(activity.category)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-5 pt-5 pb-6 flex-1 space-y-5">
                  {/* Riquadri data e orario, come check-in/check-out degli alloggi */}
                  {(activity.activity_date || activity.activity_time || activity.all_day) && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-900/5 dark:bg-white/5 px-3 py-2.5 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('activity.date')}</p>
                        <p className="text-sm font-semibold mt-0.5">
                          {activity.end_date && activity.end_date !== activity.activity_date
                            ? `${formatDateShort(activity.activity_date)} → ${formatDateShort(activity.end_date)}`
                            : formatDateShort(activity.activity_date) || '—'}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-900/5 dark:bg-white/5 px-3 py-2.5 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('activity.time')}</p>
                        <p className="text-sm font-semibold mt-0.5">
                          {activity.all_day
                            ? t('activity.allDay')
                            : activity.activity_time
                              ? activity.end_time
                                ? `${formatTime(activity.activity_time)} – ${formatTime(activity.end_time)}`
                                : formatTime(activity.activity_time)
                              : '—'}
                          {!activity.all_day && formatDuration(activity.activity_time, activity.end_time) && (
                            <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                              ({formatDuration(activity.activity_time, activity.end_time)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {(activity.location_city || activity.location_address) && (
                    <div className="!mt-6 flex items-start justify-center gap-2 text-sm text-center text-slate-600 dark:text-slate-400">
                      <MapPin className="w-5 h-5 shrink-0 text-light-blue mt-0.5" />
                      <span className="min-w-0 break-words">
                        {[activity.location_city, activity.location_address].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  )}

                  {activity.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{activity.description}</p>
                  )}
                </div>

                {/* Piede: stato e prenotazione a sinistra, azioni a destra */}
                <div
                  className="px-5 py-3 flex items-center justify-between gap-3"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
                    <Badge variant={activity.status === 'completed' ? 'success' : activity.status === 'booked' ? 'info' : 'warning'}>
                      {t(`activity.status.${activity.status}`)}
                    </Badge>
                    {(activity.booking_ref || activity.booking_operator) && (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0"
                        title={[activity.booking_operator, activity.booking_ref].filter(Boolean).join(' · ')}
                      >
                        <OperatorLogo
                          name={activity.booking_operator}
                          logo={activity.booking_operator_logo}
                          className="w-5 h-5"
                        />
                        {activity.booking_ref ? (
                          <span className="font-mono font-semibold truncate">{activity.booking_ref}</span>
                        ) : (
                          <span className="font-semibold truncate">{activity.booking_operator}</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {activity.status !== 'completed' && confirmingDeleteId !== activity.id && (
                      <ConfirmIconButton
                        icon={Check}
                        label={t('activity.markCompleted')}
                        tone="success"
                        onConfirm={() => handleQuickComplete(activity.id)}
                      />
                    )}
                    {confirmingDeleteId !== activity.id && (
                      <button
                        onClick={() => setForm({ open: true, editing: activity })}
                        className="p-2 rounded-xl text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                        aria-label={t('common.edit')}
                        title={t('common.edit')}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                    <DeleteButton
                      onConfirmingChange={(on) => setConfirmingDeleteId(on ? activity.id : null)}
                      onDelete={() => handleDelete(activity.id)}
                    />
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
          tripDestinations={tripDestinations}
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
  /** Mete del viaggio: suggerite per prime nel campo città. */
  tripDestinations?: Destination[];
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
  tripDestinations = [],
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
  const [activityTime, setActivityTime] = useState(initial?.activity_time?.slice(0, 5) ?? '');
  const [allDay, setAllDay] = useState(initial?.all_day ?? false);
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [endTime, setEndTime] = useState(initial?.end_time?.slice(0, 5) ?? '');
  const [locationCity, setLocationCity] = useState<CityValue>({ city: initial?.location_city ?? '', coords: null });
  const [locationAddress, setLocationAddress] = useState(initial?.location_address ?? '');
  const [category, setCategory] = useState<string>(
    isCustomInitial && !initialCustomExists ? NEW_CATEGORY : (initial?.category ?? '')
  );
  const [customCategoryName, setCustomCategoryName] = useState(
    isCustomInitial && !initialCustomExists ? initial?.category ?? '' : ''
  );
  const [icon, setIcon] = useState<string | null>(initial?.icon ?? null);
  const [status, setStatus] = useState<ActivityRow['status']>(initial?.status ?? 'planned');
  const [bookingRef, setBookingRef] = useState(initial?.booking_ref ?? '');
  const [operator, setOperator] = useState(initial?.booking_operator ?? '');
  const [operatorLogo, setOperatorLogo] = useState<string | null>(initial?.booking_operator_logo ?? null);
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
        location_city: locationCity.city.trim() || null,
        location_address: locationAddress.trim() || null,
        category: resolvedCategory,
        icon,
        status,
        booking_ref: bookingRef || null,
        booking_operator: operator.trim() || null,
        booking_operator_logo: operator.trim() ? operatorLogo : null,
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

      <div className="space-y-3">
        <button
          type="button"
          role="switch"
          aria-checked={allDay}
          onClick={() => setAllDay((v) => !v)}
          className="flex items-center gap-3 cursor-pointer select-none w-fit"
        >
          <span
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              allDay ? 'bg-gold' : 'bg-slate-300 dark:bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                allDay ? 'translate-x-5' : ''
              }`}
            />
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('activity.allDay')}</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TimeField
            label={t('activity.time')}
            value={activityTime}
            onChange={setActivityTime}
            disabled={allDay}
            clearLabel={t('common.clear', { defaultValue: 'Cancella' })}
          />
          <TimeField
            label={t('activity.endTime')}
            value={endTime}
            onChange={setEndTime}
            disabled={allDay}
            durationFrom={activityTime && (!endDate || endDate === activityDate) ? activityTime : undefined}
            clearLabel={t('common.clear', { defaultValue: 'Cancella' })}
          />
        </div>
      </div>

      <div>
        <label className="label">{t('activity.city')}</label>
        <CityPicker
          value={locationCity}
          onChange={setLocationCity}
          tripDestinations={tripDestinations}
          placeholder={t('cityPicker.placeholder')}
        />
      </div>

      <Input
        label={t('activity.address')}
        value={locationAddress}
        onChange={(e) => setLocationAddress(e.target.value)}
        placeholder={t('activity.addressPlaceholder')}
      />

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

      <OperatorPicker
        name={operator}
        logo={operatorLogo}
        onChange={(n, l) => {
          setOperator(n);
          setOperatorLogo(l);
        }}
      />

      <Input label={t('activity.bookingRef')} value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} placeholder={t('activity.bookingRefPlaceholder')} />

      <Input label={t('activity.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label={t('activity.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="tertiary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};
