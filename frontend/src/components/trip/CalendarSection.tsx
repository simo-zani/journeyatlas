import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BedDouble,
  Bus,
  Calendar as CalendarIcon,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ListFilter,
  Loader2,
  MapPin,
  Mountain,
  Plane,
  Route,
  Ship,
  Ticket,
  TrainFront,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { fetchAccommodations, fetchActivities, fetchTransports } from '@/lib/api';
import type {
  AccommodationRow,
  ActivityRow,
  TransportRow,
  TransportType,
  Trip,
} from '@/lib/types';

interface CalendarSectionProps {
  trip: Trip;
  onSelectTab?: (tab: 'activities' | 'accommodations' | 'transport') => void;
}

export type EventType =
  | 'activity'
  | 'transport'
  | 'accommodation_checkin'
  | 'accommodation_checkout';

export interface UnifiedEvent {
  id: string;
  type: EventType;
  title: string;
  subtitle?: string | null;
  date: string; // YYYY-MM-DD
  time?: string | null; // HH:mm
  location?: string | null;
  bookingRef?: string | null;
  category?: string | null;
  status?: string | null;
  transportType?: TransportType;
  raw: ActivityRow | TransportRow | AccommodationRow;
}

type FilterType = 'all' | 'activities' | 'transports' | 'accommodations' | 'bookings';
type ViewMode = 'agenda' | 'month';

const TRANSPORT_ICONS: Record<TransportType, LucideIcon> = {
  flight: Plane,
  train: TrainFront,
  bus: Bus,
  ferry: Ship,
  car: Car,
  other: Route,
};

export const CalendarSection: React.FC<CalendarSectionProps> = ({ trip, onSelectTab }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [transports, setTransports] = useState<TransportRow[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationRow[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Month view cursor date
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (trip.start_date) {
      const d = new Date(`${trip.start_date}T00:00:00`);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [actData, transData, accData] = await Promise.all([
        fetchActivities(trip.id),
        fetchTransports(trip.id),
        fetchAccommodations(trip.id),
      ]);
      setActivities(actData);
      setTransports(transData);
      setAccommodations(accData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [trip.id, t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Convert raw rows into unified events
  const allEvents = useMemo<UnifiedEvent[]>(() => {
    const list: UnifiedEvent[] = [];

    // 1. Activities
    for (const act of activities) {
      if (act.activity_date) {
        list.push({
          id: `act-${act.id}`,
          type: 'activity',
          title: act.name,
          subtitle: act.category ? act.category.toUpperCase() : null,
          date: act.activity_date,
          time: act.activity_time ? act.activity_time.slice(0, 5) : null,
          location: [act.location_city, act.location_address].filter(Boolean).join(', ') || null,
          bookingRef: act.booking_ref || null,
          category: act.category || null,
          status: act.status,
          raw: act,
        });
      }
    }

    // 2. Transports (Departure and optional arrival)
    for (const tr of transports) {
      if (tr.departure_datetime) {
        const depDate = tr.departure_datetime.slice(0, 10);
        const depTime = tr.departure_datetime.slice(11, 16);
        const title = `${tr.departure_airport || ''} ➔ ${tr.arrival_airport || ''}`;
        const subtitle = [
          tr.transport_type ? tr.transport_type.toUpperCase() : null,
          tr.airline,
          tr.flight_number,
        ]
          .filter(Boolean)
          .join(' · ');

        list.push({
          id: `tr-dep-${tr.id}`,
          type: 'transport',
          title: title || t('transport.title', 'Trasporto'),
          subtitle,
          date: depDate,
          time: depTime,
          location: `${tr.departure_airport} ➔ ${tr.arrival_airport}`,
          bookingRef: tr.booking_ref || null,
          transportType: tr.transport_type,
          raw: tr,
        });
      }
    }

    // 3. Accommodations (Check-in and Check-out)
    for (const acc of accommodations) {
      if (acc.check_in_date) {
        list.push({
          id: `acc-in-${acc.id}`,
          type: 'accommodation_checkin',
          title: `${t('calendar.checkIn', 'Check-in')}: ${acc.name}`,
          subtitle: acc.type ? acc.type.toUpperCase() : null,
          date: acc.check_in_date,
          time: acc.check_in_time ? acc.check_in_time.slice(0, 5) : '15:00',
          location: acc.address || null,
          bookingRef: acc.booking_ref || null,
          raw: acc,
        });
      }
      if (acc.check_out_date) {
        list.push({
          id: `acc-out-${acc.id}`,
          type: 'accommodation_checkout',
          title: `${t('calendar.checkOut', 'Check-out')}: ${acc.name}`,
          subtitle: acc.type ? acc.type.toUpperCase() : null,
          date: acc.check_out_date,
          time: acc.check_out_time ? acc.check_out_time.slice(0, 5) : '11:00',
          location: acc.address || null,
          bookingRef: acc.booking_ref || null,
          raw: acc,
        });
      }
    }

    return list;
  }, [activities, transports, accommodations, t]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      if (filterType === 'activities') return ev.type === 'activity';
      if (filterType === 'transports') return ev.type === 'transport';
      if (filterType === 'accommodations') {
        return ev.type === 'accommodation_checkin' || ev.type === 'accommodation_checkout';
      }
      if (filterType === 'bookings') return Boolean(ev.bookingRef && ev.bookingRef.trim().length > 0);
      return true;
    });
  }, [allEvents, filterType]);

  // Calendar Day Range (from trip start to trip end, or derived from events)
  const tripDays = useMemo(() => {
    const dates: string[] = [];

    if (trip.start_date && trip.end_date) {
      let curr = new Date(`${trip.start_date}T00:00:00`);
      const end = new Date(`${trip.end_date}T00:00:00`);
      while (curr <= end && dates.length < 120) {
        dates.push(curr.toISOString().slice(0, 10));
        curr = new Date(curr.getTime() + 86400000);
      }
    } else {
      // Collect unique event dates sorted
      const uniqueDates = Array.from(new Set(allEvents.map((e) => e.date))).sort();
      dates.push(...uniqueDates);
    }

    return dates;
  }, [trip.start_date, trip.end_date, allEvents]);

  // Group filtered events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, UnifiedEvent[]>();
    for (const ev of filteredEvents) {
      const existing = map.get(ev.date) || [];
      existing.push(ev);
      map.set(ev.date, existing);
    }

    // Sort events within each day by time
    map.forEach((items) => {
      items.sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;
        return a.title.localeCompare(b.title);
      });
    });

    return map;
  }, [filteredEvents]);

  // Total counts for filter badges
  const counts = useMemo(() => {
    const actCount = allEvents.filter((e) => e.type === 'activity').length;
    const transCount = allEvents.filter((e) => e.type === 'transport').length;
    const accCount = allEvents.filter((e) => e.type === 'accommodation_checkin' || e.type === 'accommodation_checkout').length;
    const bookCount = allEvents.filter((e) => Boolean(e.bookingRef && e.bookingRef.trim())).length;
    return {
      all: allEvents.length,
      activities: actCount,
      transports: transCount,
      accommodations: accCount,
      bookings: bookCount,
    };
  }, [allEvents]);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(i18n.language?.startsWith('it') ? 'it-IT' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Month grid helpers
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDayOfWeek = (monthStart.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = monthEnd.getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getEventBadgeColor = (type: EventType) => {
    switch (type) {
      case 'activity':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/30';
      case 'transport':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/30';
      case 'accommodation_checkin':
      case 'accommodation_checkout':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30';
      default:
        return 'bg-gold/15 text-gold-light ring-1 ring-gold/30';
    }
  };

  const getEventIcon = (event: UnifiedEvent) => {
    if (event.type === 'activity') return Mountain;
    if (event.type === 'transport') {
      return event.transportType ? TRANSPORT_ICONS[event.transportType] : Route;
    }
    return BedDouble;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return <Card className="text-error p-6">{error}</Card>;
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      {/* Top Controls Bar with Filters & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 flex-1">
          <button
            onClick={() => setFilterType('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              filterType === 'all'
                ? 'bg-deep-blue text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                : 'bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-900/10 dark:hover:bg-white/10'
            }`}
          >
            {t('calendar.filterAll', 'Tutti')} ({counts.all})
          </button>

          <button
            onClick={() => setFilterType('activities')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              filterType === 'activities'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20'
            }`}
          >
            <Mountain className="w-5 h-5" />
            {t('calendar.filterActivities', 'Attività')} ({counts.activities})
          </button>

          <button
            onClick={() => setFilterType('transports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              filterType === 'transports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20'
            }`}
          >
            <Route className="w-5 h-5" />
            {t('calendar.filterTransports', 'Mezzi')} ({counts.transports})
          </button>

          <button
            onClick={() => setFilterType('accommodations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              filterType === 'accommodations'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            <BedDouble className="w-5 h-5" />
            {t('calendar.filterAccommodations', 'Alloggi')} ({counts.accommodations})
          </button>

          <button
            onClick={() => setFilterType('bookings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              filterType === 'bookings'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Ticket className="w-5 h-5" />
            {t('calendar.filterBookings', 'Con Prenotazione')} ({counts.bookings})
          </button>
        </div>

        {/* View Mode Toggle: Agenda vs Month */}
        <div className="flex items-center gap-2 bg-slate-900/5 dark:bg-white/5 p-1.5 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-deep-blue text-white dark:bg-gold dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-900/5 dark:hover:bg-white/5'
            }`}
          >
            <ListFilter className="w-5 h-5 shrink-0" />
            <span>{t('calendar.viewAgenda', 'Agenda')}</span>
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
              viewMode === 'month'
                ? 'bg-deep-blue text-white dark:bg-gold dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-900/5 dark:hover:bg-white/5'
            }`}
          >
            <CalendarIcon className="w-5 h-5 shrink-0" />
            <span>{t('calendar.viewMonth', 'Mese')}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Agenda or Month */}
      {viewMode === 'agenda' ? (
        <div className="space-y-6">
          {tripDays.length === 0 ? (
            <Card className="p-12 text-center">
              <CalendarDays className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                {t('calendar.empty', 'Nessun elemento nel calendario')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                {t('calendar.emptySub', 'Aggiungi attività, mezzi di trasporto o alloggi per visualizzarli qui giorno per giorno.')}
              </p>
              {onSelectTab && (
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button variant="secondary" size="sm" onClick={() => onSelectTab('activities')}>
                    <Mountain className="w-4 h-4 mr-1.5" />
                    {t('tripSection.activities')}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onSelectTab('transport')}>
                    <Route className="w-4 h-4 mr-1.5" />
                    {t('tripSection.transport')}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onSelectTab('accommodations')}>
                    <BedDouble className="w-4 h-4 mr-1.5" />
                    {t('tripSection.accommodations')}
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            tripDays.map((dateStr, idx) => {
              const dayEvents = eventsByDate.get(dateStr) || [];
              const dayNumber = idx + 1;
              const hasEvents = dayEvents.length > 0;

              return (
                <Card
                  key={dateStr}
                  className={`overflow-hidden transition-all duration-200 ${
                    hasEvents
                      ? 'border-slate-200/80 dark:border-white/10 shadow-sm'
                      : 'opacity-75 bg-slate-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-gold/20 text-deep-blue dark:text-gold-light ring-1 ring-gold/40">
                        {t('calendar.day', { number: dayNumber })}
                      </span>
                      <span className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">
                        {formatDateHeader(dateStr)}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      {dayEvents.length === 1
                        ? `1 ${t('calendar.event', 'evento')}`
                        : `${dayEvents.length} ${t('calendar.events', 'eventi')}`}
                    </span>
                  </div>

                  {/* Day Events List */}
                  {dayEvents.length === 0 ? (
                    <p className="text-sm italic text-slate-400 dark:text-slate-500 py-2">
                      {t('calendar.noEventsThisDay', 'Nessun impegno programmato per questo giorno')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {dayEvents.map((ev) => {
                        const Icon = getEventIcon(ev);
                        const badgeColor = getEventBadgeColor(ev.type);

                        return (
                          <div
                            key={ev.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/[0.03] dark:bg-white/[0.03] hover:bg-slate-900/[0.06] dark:hover:bg-white/[0.06] transition-colors border border-slate-200/40 dark:border-white/5"
                          >
                            <div className="flex items-start sm:items-center gap-4 min-w-0">
                              {/* Time badge */}
                              <div className="w-20 shrink-0 flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                <Clock className="w-4 h-4 text-gold shrink-0" />
                                <span>{ev.time || '--:--'}</span>
                              </div>

                              {/* Event Icon badge */}
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${badgeColor}`}
                              >
                                <Icon className="w-6 h-6" />
                              </div>

                              {/* Title, Subtitle, Location */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                                    {ev.title}
                                  </h4>
                                  {ev.subtitle && (
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                                      · {ev.subtitle}
                                    </span>
                                  )}
                                </div>
                                {ev.location && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                    <span className="truncate">{ev.location}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Booking Reference Badge */}
                            {ev.bookingRef && (
                              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto ml-auto sm:ml-0">
                                <button
                                  onClick={() => handleCopyRef(ev.bookingRef!)}
                                  className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer"
                                  title={t('common.copy', 'Copia codice')}
                                >
                                  <Ticket className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  <span>{ev.bookingRef}</span>
                                  {copiedRef === ev.bookingRef ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 ml-1" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* Month View Grid */
        <Card className="p-6">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold capitalize text-slate-900 dark:text-slate-100">
              {currentMonth.toLocaleDateString(i18n.language?.startsWith('it') ? 'it-IT' : 'en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty prefix slots */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[88px] rounded-xl opacity-20" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventsByDate.get(dateStr) || [];
              const isTripDay = tripDays.includes(dateStr);
              const isSelected = selectedDay === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={`min-h-[72px] sm:min-h-[88px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-gold border-gold bg-gold/10'
                      : isTripDay
                        ? 'border-gold/30 bg-gold/5 dark:bg-gold/[0.04] hover:border-gold/60'
                        : 'border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isTripDay ? 'text-gold-dark dark:text-gold-light' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                    )}
                  </div>

                  {/* Mini Event Badges/Dots */}
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[10px] font-medium truncate px-1.5 py-0.5 rounded bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-semibold text-slate-400">
                        +{dayEvents.length - 2} altri
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Details Preview in Month View */}
          {selectedDay && (
            <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-white/5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                {formatDateHeader(selectedDay)}
              </h4>
              {(eventsByDate.get(selectedDay) || []).length === 0 ? (
                <p className="text-sm italic text-slate-400">
                  {t('calendar.noEventsThisDay', 'Nessun impegno programmato per questo giorno')}
                </p>
              ) : (
                <div className="space-y-2">
                  {(eventsByDate.get(selectedDay) || []).map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-200/40 dark:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500">{ev.time || '--:--'}</span>
                        <span className="text-sm font-semibold">{ev.title}</span>
                      </div>
                      {ev.bookingRef && (
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {ev.bookingRef}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
