import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  BedDouble,
  Bus,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
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
  Plus,
  Route,
  Ship,
  Ticket,
  TrainFront,
  type LucideIcon,
} from 'lucide-react';
import { ActivityIcon } from '@/components/ActivityIcon';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ActivityForm } from '@/components/trip/ActivitySection';
import { TransportForm } from '@/components/trip/TransportSection';
import { AccommodationForm } from '@/components/trip/AccommodationSection';
import { useAuth } from '@/auth/AuthContext';
import {
  ACTIVITY_CATEGORIES,
  createActivity,
  createActivityCategory,
  fetchAccommodations,
  fetchActivities,
  fetchActivityCategories,
  fetchTransports,
  updateAccommodation,
  updateActivity,
  updateTransport,
  type AccommodationInput,
  type ActivityInput,
  type TransportInput,
} from '@/lib/api';
import { buildCategoryColorMap, CATEGORY_OTHER_VAR, getCategoryColor } from '@/lib/categoryColors';
import { loadAirports, airportByIata, type Airport } from '@/lib/airports';
import { loadTrainStations, stationByNameOrCode, type TrainStation } from '@/lib/trainStations';
import { loadFerryPorts, portByNameOrCode, type FerryPort } from '@/lib/ferryPorts';
import type {
  AccommodationRow,
  ActivityCategoryRow,
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
  time?: string | null; // HH:mm — start time (this day's instance, if any)
  endTime?: string | null; // HH:mm — only set on the last day of the span
  allDay?: boolean;
  /** Set only when the source activity spans more than one day — which
   * numbered day (1-based) of the span this instance is. */
  spanInfo?: { dayIndex: number; totalDays: number } | null;
  location?: string | null;
  bookingRef?: string | null;
  category?: string | null;
  status?: string | null;
  transportType?: TransportType;
  /** Full display name of departure location (airport/station/port name) */
  depName?: string | null;
  /** Full display name of arrival location */
  arrName?: string | null;
  /** Operator / airline name for the transport */
  operatorName?: string | null;
  /** Flight/train/ferry number */
  vehicleNumber?: string | null;
  raw: ActivityRow | TransportRow | AccommodationRow;
}

type FilterType = 'all' | 'activities' | 'transports' | 'accommodations' | 'bookings';
type ViewMode = 'agenda' | 'day' | 'week' | 'month';

const TRANSPORT_ICONS: Record<TransportType, LucideIcon> = {
  flight: Plane,
  train: TrainFront,
  bus: Bus,
  ferry: Ship,
  car: Car,
  other: Route,
};

// Fixed colors for the two non-activity event types, matched to the badge
// classes already used elsewhere (bg-blue-500/... , bg-emerald-500/...) so
// the day/week grid and month mini-badges read as the same system.
const TRANSPORT_COLOR = '#3B82F6';
const ACCOMMODATION_COLOR = '#10B981';

const getEventIcon = (event: UnifiedEvent) => {
  if (event.type === 'activity') return Mountain;
  if (event.type === 'transport') {
    return event.transportType ? TRANSPORT_ICONS[event.transportType] : Route;
  }
  return BedDouble;
};

const formatEventTime = (ev: UnifiedEvent, t: TFunction): string => {
  if (ev.allDay) return t('calendar.allDay', 'Tutto il giorno');
  if (ev.time && ev.endTime) return `${ev.time}–${ev.endTime}`;
  return ev.time || '--:--';
};

/** Local (not UTC) YYYY-MM-DD — never `.toISOString()` here: that round-trips
 * through UTC and can shift the date by a day in any timezone ahead of UTC. */
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};

/** Supabase throws plain `{ message, code, ... }` objects, not real `Error`
 * instances — `err instanceof Error` misses those and always falls back to
 * the generic string, hiding what actually went wrong. */
const errorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return fallback;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Local (viewer's device) date/time parts for a `timestamptz` value —
 * mirrors TransportSection's own `toLocalInput`, so a flight shows the same
 * time here as it does in the Mezzi tab. Slicing the raw ISO string instead
 * (as this used to) reads the UTC wall-clock, which is wrong for anyone not
 * in UTC+0. See the Calendar reply about transport's timezone-aware storage
 * for why this can still shift if the viewer's device timezone changes. */
const localDateTimeParts = (iso: string): { date: string; time: string } => {
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
};

const MIN_EVENT_MINUTES = 15;
const HOUR_HEIGHT = 56; // px per hour in the day/week time grid

interface LanedEvent {
  ev: UnifiedEvent;
  lane: number;
  laneCount: number;
  startMin: number;
  durationMin: number;
}

/** Greedy lane assignment so overlapping timed events sit side-by-side
 * instead of on top of each other, like a normal calendar day view. */
const layoutTimedEvents = (events: UnifiedEvent[]): LanedEvent[] => {
  const withTimes = events
    .filter((e) => e.time)
    .map((e) => {
      const startMin = toMinutes(e.time!);
      const durationMin = e.endTime
        ? Math.max(MIN_EVENT_MINUTES, toMinutes(e.endTime) - startMin)
        : MIN_EVENT_MINUTES;
      return { ev: e, startMin, durationMin };
    })
    .sort((a, b) => a.startMin - b.startMin);

  const laneEnds: number[] = [];
  const placed: Array<Omit<LanedEvent, 'laneCount'>> = [];
  for (const item of withTimes) {
    let lane = laneEnds.findIndex((end) => end <= item.startMin);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.startMin + item.durationMin);
    } else {
      laneEnds[lane] = item.startMin + item.durationMin;
    }
    placed.push({ ev: item.ev, lane, startMin: item.startMin, durationMin: item.durationMin });
  }
  const laneCount = Math.max(1, laneEnds.length);
  return placed.map((p) => ({ ...p, laneCount }));
};

interface EventRowProps {
  ev: UnifiedEvent;
  color: string;
  copiedRef: string | null;
  onCopyRef: (ref: string) => void;
  onClick?: () => void;
}

/** Shared booking-ref button used in both row variants. */
const BookingRefButton: React.FC<{ bookingRef: string; copiedRef: string | null; onCopyRef: (r: string) => void; small?: boolean }> = ({ bookingRef, copiedRef, onCopyRef, small }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onCopyRef(bookingRef); }}
      className={`group flex items-center gap-1 rounded-full font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer shrink-0 ${
        small ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
      title={t('common.copy', 'Copia codice')}
    >
      <Ticket className={small ? 'w-3 h-3 text-amber-600 dark:text-amber-400' : 'w-3.5 h-3.5 text-amber-600 dark:text-amber-400'} />
      <span>{bookingRef}</span>
      {copiedRef === bookingRef ? (
        <Check className={small ? 'w-3 h-3 text-emerald-600 dark:text-emerald-400' : 'w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400'} />
      ) : (
        <Copy className={small ? 'w-2.5 h-2.5 opacity-60 group-hover:opacity-100' : 'w-3 h-3 opacity-60 group-hover:opacity-100'} />
      )}
    </button>
  );
};

/**
 * Unified agenda row — used for ALL event types.
 * Layout: [left color stripe] [time] [icon bubble] [content] [booking ref]
 *
 * Transport events get an enhanced inner layout (dep→arr route + depName + operator/number on right).
 * Activities and accommodations show title + subtitle + location.
 */
const EventRow: React.FC<EventRowProps> = ({ ev, color, copiedRef, onCopyRef, onClick }) => {
  const { t } = useTranslation();
  const Icon = getEventIcon(ev);
  const isTransport = ev.type === 'transport';

  // --- Transport-specific data ---
  const locationParts = (ev.location ?? '').split(' ➔ ');
  const depCode = isTransport ? (locationParts[0]?.trim() || null) : null;
  const arrCode = isTransport ? (locationParts[1]?.trim() || null) : null;
  const depName = isTransport ? (ev.depName ?? null) : null;
  const operatorLabel = [ev.operatorName, ev.vehicleNumber].filter(Boolean).join(' · ') || null;

  return (
    <div
      onClick={onClick}
      className={`relative flex rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/[0.07] shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Left color stripe */}
      <div className="w-[5px] shrink-0 self-stretch" style={{ background: color }} />

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex items-center gap-3 px-3.5 py-3 bg-slate-900/[0.02] dark:bg-white/[0.02] hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04] transition-colors">

        {/* Time */}
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap w-[4rem] shrink-0 text-center">
          {formatEventTime(ev, t)}
        </div>

        {/* Icon bubble — same size and style for all types */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
        >
          {ev.type === 'activity' ? (
            <ActivityIcon icon={(ev.raw as ActivityRow).icon} size={22} />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        {/* Content — transport vs other */}
        {isTransport ? (
          // Transport: route codes + dep location name + operator/number on right
          <>
            <div className="flex-1 min-w-0">
              {/* dep code ➔ arr code */}
              <div className="flex items-center gap-1.5 min-w-0">
                {depCode && <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{depCode}</span>}
                <svg width="22" height="8" viewBox="0 0 22 8" fill="none" className="shrink-0 text-slate-300 dark:text-slate-600">
                  <path d="M1 4 H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2.5 2.2" />
                  <path d="M11 1 L18 4 L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {arrCode && <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{arrCode}</span>}
              </div>
              {/* Departure location full name */}
              {depName && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 inline-block mr-0.5 -mt-px shrink-0" />
                  {depName}
                </p>
              )}
            </div>
            {/* Operator + vehicle number on the right */}
            <div className="shrink-0 text-right hidden sm:block">
              {operatorLabel && (
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{operatorLabel}</p>
              )}
              {ev.bookingRef && (
                <div className="mt-1">
                  <BookingRefButton bookingRef={ev.bookingRef} copiedRef={copiedRef} onCopyRef={onCopyRef} small />
                </div>
              )}
            </div>
            {/* On mobile, booking ref inline */}
            {ev.bookingRef && (
              <div className="shrink-0 sm:hidden">
                <BookingRefButton bookingRef={ev.bookingRef} copiedRef={copiedRef} onCopyRef={onCopyRef} small />
              </div>
            )}
          </>
        ) : (
          // Activity / Accommodation: title + subtitle + location
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{ev.title}</h4>
                {ev.spanInfo && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gold/15 text-gold-dark dark:text-gold-light shrink-0"
                    title={t('calendar.spanDay', { current: ev.spanInfo.dayIndex, total: ev.spanInfo.totalDays })}
                  >
                    <CalendarRange className="w-3 h-3" />
                    {ev.spanInfo.dayIndex}/{ev.spanInfo.totalDays}
                  </span>
                )}
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
            {ev.bookingRef && (
              <BookingRefButton bookingRef={ev.bookingRef} copiedRef={copiedRef} onCopyRef={onCopyRef} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface MonthMiniBadgeProps {
  ev: UnifiedEvent;
  color: string;
  onClick?: (e: React.MouseEvent) => void;
}

const MonthMiniBadge: React.FC<MonthMiniBadgeProps> = ({ ev, color, onClick }) => {
  const Icon = getEventIcon(ev);
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-1 text-[10px] font-semibold truncate px-1.5 py-0.5 rounded cursor-pointer hover:brightness-95"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
    >
      {ev.type === 'activity' ? (
        <ActivityIcon icon={(ev.raw as ActivityRow).icon} size={10} className="shrink-0" />
      ) : (
        <Icon className="w-2.5 h-2.5 shrink-0" />
      )}
      <span className="truncate">{ev.title}</span>
    </div>
  );
};

interface AllDayChipProps {
  ev: UnifiedEvent;
  color: string;
  compact?: boolean;
  onClick?: () => void;
}

const AllDayChip: React.FC<AllDayChipProps> = ({ ev, color, compact, onClick }) => {
  const Icon = getEventIcon(ev);
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg font-bold truncate cursor-pointer hover:brightness-95 ${compact ? 'text-[10px] px-1.5 py-1' : 'text-xs px-2.5 py-1.5'}`}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
      title={ev.title}
    >
      {ev.type === 'activity' ? (
        <ActivityIcon icon={(ev.raw as ActivityRow).icon} size={compact ? 11 : 14} className="shrink-0" />
      ) : (
        <Icon className={compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      )}
      <span className="truncate">{ev.title}</span>
    </div>
  );
};

interface TimeGridColumnProps {
  dateStr: string;
  events: UnifiedEvent[];
  colorFor: (ev: UnifiedEvent) => string;
  /** First hour rendered (0-23) — the grid is cropped above this, see
   * `computeGridStartHour`. Positions below are computed relative to it. */
  startHour: number;
  compact?: boolean;
  onEventClick?: (ev: UnifiedEvent) => void;
  /** Desktop drag-and-drop: fired on drop with the dragged event's id, this
   * column's date, and the raw (unsnapped) drop minute. */
  onEventDrop?: (evId: string, dateStr: string, minutes: number) => void;
}

/** One day's worth of timed events, absolutely positioned against a 24-hour
 * scale (cropped to start at `startHour`). Used for both the single day
 * column (Day view) and each of the 7 columns (Week view). Event blocks are
 * draggable (desktop HTML5 DnD) to move them to another time/day — dragging
 * across columns in Week view changes the day too, since `dateStr` differs
 * per column. */
const TimeGridColumn: React.FC<TimeGridColumnProps> = ({ dateStr, events, colorFor, startHour, compact, onEventClick, onEventDrop }) => {
  const laned = useMemo(() => layoutTimedEvents(events), [events]);
  const [dragOver, setDragOver] = useState(false);
  const visibleHours = 24 - startHour;

  return (
    <div
      className={`relative transition-colors ${dragOver ? 'bg-gold/5' : ''}`}
      style={{ height: HOUR_HEIGHT * visibleHours }}
      onDragOver={(e) => {
        if (!onEventDrop) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (!onEventDrop) return;
        e.preventDefault();
        setDragOver(false);
        const raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        // Delta-based, not absolute cursor position: wherever within the
        // block you grabbed it, the block moves by exactly how far the
        // cursor moved — using the drop's raw Y as the new top would offset
        // the result by that grab point every time (reported bug: always
        // ~45min late, because clicks tended to land mid-block, not at its
        // top edge).
        try {
          const { id, startMin: origStartMin, startY } = JSON.parse(raw) as {
            id: string;
            startMin: number;
            startY: number;
          };
          const deltaMin = ((e.clientY - startY) / HOUR_HEIGHT) * 60;
          onEventDrop(id, dateStr, origStartMin + deltaMin);
        } catch {
          // malformed/foreign drag payload — ignore
        }
      }}
    >
      {Array.from({ length: visibleHours }).map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-slate-200/50 dark:border-white/5"
          style={{ top: i * HOUR_HEIGHT }}
        />
      ))}
      {laned.map(({ ev, lane, laneCount, startMin, durationMin }) => {
        const color = colorFor(ev);
        const widthPct = 100 / laneCount;
        // Title + time need ~2 text lines to read cleanly — a block sized
        // strictly to its (short) duration clips the time line, which is
        // what was reported. This floor is a legibility minimum, separate
        // from MIN_EVENT_MINUTES (which only affects lane/overlap layout).
        const minBlockPx = compact ? 32 : 40;
        return (
          <div
            key={ev.id}
            draggable={!!onEventDrop}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', JSON.stringify({ id: ev.id, startMin, startY: e.clientY }));
            }}
            onClick={() => onEventClick?.(ev)}
            className={`absolute rounded-lg overflow-hidden text-left shadow-sm transition-all hover:z-[2] hover:shadow-md ${
              onEventClick ? 'cursor-pointer' : 'cursor-default'
            } ${onEventDrop ? 'active:cursor-grabbing' : ''}`}
            title={`${ev.time}${ev.endTime ? '–' + ev.endTime : ''} · ${ev.title}`}
            style={{
              top: ((startMin - startHour * 60) / 60) * HOUR_HEIGHT,
              height: Math.max((durationMin / 60) * HOUR_HEIGHT, minBlockPx),
              left: `calc(${lane * widthPct}% + 2px)`,
              width: `calc(${widthPct}% - 4px)`,
              backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`,
              borderLeft: `3px solid ${color}`,
              color,
              padding: compact ? '2px 4px' : '4px 6px',
            }}
          >
            <span className={`font-bold leading-tight flex items-center gap-1 truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {ev.type === 'activity' && <ActivityIcon icon={(ev.raw as ActivityRow).icon} size={compact ? 9 : 11} className="shrink-0" />}
              <span className="truncate">{ev.title}</span>
            </span>
            <span className={`block opacity-80 truncate ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
              {ev.time}
              {ev.endTime ? `–${ev.endTime}` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ALL_HOUR_LABELS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);

const DEFAULT_GRID_START_HOUR = 8;

/** The day/week grid opens at 8:00 by default, and only shows earlier hours
 * when there's an actual timed event before that — it crops, never hides,
 * real events. */
const computeGridStartHour = (events: UnifiedEvent[]): number => {
  const earliestHours = events
    .filter((e) => !e.allDay && e.time)
    .map((e) => Math.floor(toMinutes(e.time!) / 60));
  if (earliestHours.length === 0) return DEFAULT_GRID_START_HOUR;
  return Math.min(DEFAULT_GRID_START_HOUR, ...earliestHours);
};

export const CalendarSection: React.FC<CalendarSectionProps> = ({ trip, onSelectTab }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [transports, setTransports] = useState<TransportRow[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationRow[]>([]);
  const [customCategories, setCustomCategories] = useState<ActivityCategoryRow[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<UnifiedEvent | null>(null);
  const [creatingForDate, setCreatingForDate] = useState<string | null>(null);

  // Location lookup data — loaded lazily (each lib caches internally)
  const [airports, setAirports] = useState<Airport[]>([]);
  const [stations, setStations] = useState<TrainStation[]>([]);
  const [ferryPorts, setFerryPorts] = useState<FerryPort[]>([]);

  useEffect(() => {
    void loadAirports().then(setAirports);
    void loadTrainStations().then(setStations);
    void loadFerryPorts().then(setFerryPorts);
  }, []);

  // Week view: the day-header row and all-day strip sit above the
  // scrollable hour grid, so when that grid's vertical scrollbar appears it
  // eats into ITS width only — the header row, with no scrollbar, stays
  // full-width, and the 7 columns drift out of alignment. Measuring the
  // actual scrollbar width (varies by OS/browser, can't be hardcoded) and
  // padding the header rows by the same amount keeps every row the same
  // content width regardless of whether a scrollbar is showing.
  const weekGridRef = useRef<HTMLDivElement>(null);
  const [weekScrollbarWidth, setWeekScrollbarWidth] = useState(0);

  // Week/Day view's own header block (title + day headers + all-day strip)
  // is sticky too, right below the filter bar above it — its `top` must be
  // the filter bar's *actual* rendered height (56px navbar + this), not a
  // second guessed constant: guessing it too tall left a gap on load and,
  // once stuck, pushed the header down far enough to cover the grid's early
  // hours instead of sitting flush above them.
  const FILTER_BAR_TOP = 56; // matches its own `top-14`
  const filterBarRef = useRef<HTMLDivElement>(null);
  const [filterBarHeight, setFilterBarHeight] = useState(56);
  const weekDayStickyTop = FILTER_BAR_TOP + filterBarHeight;

  // Grid cursor date, shared by Month/Week/Day — what it means depends on
  // viewMode (a day within the month / within the week / the day itself).
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (trip.start_date) {
      const d = new Date(`${trip.start_date}T00:00:00`);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // `silent` skips the full-page loading spinner — used to refresh data
  // after an edit/drag save without the whole section unmounting and
  // remounting, which was resetting scroll position back to the top.
  const loadData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const [actData, transData, accData, catData] = await Promise.all([
          fetchActivities(trip.id),
          fetchTransports(trip.id),
          fetchAccommodations(trip.id),
          fetchActivityCategories(trip.id),
        ]);
        setActivities(actData);
        setTransports(transData);
        setAccommodations(accData);
        setCustomCategories(catData);
      } catch (err) {
        setError(errorMessage(err, t('common.error')));
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [trip.id, t]
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const el = weekGridRef.current;
    if (!el) return;
    const measure = () => setWeekScrollbarWidth(el.offsetWidth - el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewMode]);

  useEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;
    const measure = () => setFilterBarHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const categoryLabel = useCallback(
    (c: string) => t(`activity.category.${c}`, { defaultValue: c }),
    [t]
  );

  // Same stably-sorted category list (predefined + custom) that ActivitySection
  // builds, so a category gets the identical color in both places.
  const allCategories = useMemo(() => {
    const names = new Set<string>([
      ...(ACTIVITY_CATEGORIES as readonly string[]),
      ...customCategories.map((c) => c.name),
    ]);
    activities.forEach((a) => a.category && names.add(a.category));
    return Array.from(names).sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b)));
  }, [activities, customCategories, categoryLabel]);

  const categoryColorMap = useMemo(() => buildCategoryColorMap(allCategories), [allCategories]);

  const resolveEventColor = useCallback(
    (ev: UnifiedEvent): string => {
      if (ev.type === 'activity') return getCategoryColor(ev.category ?? null, categoryColorMap) || CATEGORY_OTHER_VAR;
      if (ev.type === 'transport') return TRANSPORT_COLOR;
      return ACCOMMODATION_COLOR;
    },
    [categoryColorMap]
  );

  // Convert raw rows into unified events
  const allEvents = useMemo<UnifiedEvent[]>(() => {
    const list: UnifiedEvent[] = [];

    // 1. Activities — one instance per day for multi-day activities (end_date
    // set and after activity_date), so it shows up on every day it spans.
    for (const act of activities) {
      if (!act.activity_date) continue;

      const startDate = act.activity_date;
      const endDateStr = act.end_date && act.end_date >= startDate ? act.end_date : startDate;

      const spanDates: string[] = [];
      let cursor = new Date(`${startDate}T00:00:00`);
      const endCursor = new Date(`${endDateStr}T00:00:00`);
      while (cursor <= endCursor && spanDates.length < 60) {
        spanDates.push(dateKey(cursor));
        cursor = new Date(cursor.getTime() + 86400000);
      }
      const totalDays = spanDates.length;

      spanDates.forEach((d, idx) => {
        list.push({
          id: `act-${act.id}-${d}`,
          type: 'activity',
          title: act.name,
          subtitle: act.category ? act.category.toUpperCase() : null,
          date: d,
          time: idx === 0 && act.activity_time ? act.activity_time.slice(0, 5) : null,
          endTime: idx === totalDays - 1 && act.end_time ? act.end_time.slice(0, 5) : null,
          allDay: act.all_day,
          spanInfo: totalDays > 1 ? { dayIndex: idx + 1, totalDays } : null,
          location: [act.location_city, act.location_address].filter(Boolean).join(', ') || null,
          bookingRef: act.booking_ref || null,
          category: act.category || null,
          status: act.status,
          raw: act,
        });
      });
    }

    // 2. Transports (Departure and optional arrival)
    for (const tr of transports) {
      if (tr.departure_datetime) {
        const { date: depDate, time: depTime } = localDateTimeParts(tr.departure_datetime);
        const title = `${tr.departure_airport || ''} ➔ ${tr.arrival_airport || ''}`;

        // Resolve full location names for departure and arrival
        const isFlight = tr.transport_type === 'flight';
        const isTrain = tr.transport_type === 'train';
        const isFerry = tr.transport_type === 'ferry';

        let depName: string | null = null;
        let arrName: string | null = null;

        if (isFlight && airports.length > 0) {
          const depAp = airportByIata(airports, tr.departure_airport);
          const arrAp = airportByIata(airports, tr.arrival_airport);
          depName = depAp ? depAp.name : null;
          arrName = arrAp ? arrAp.name : null;
        } else if (isTrain && stations.length > 0) {
          const depSt = stationByNameOrCode(stations, tr.departure_airport);
          const arrSt = stationByNameOrCode(stations, tr.arrival_airport);
          depName = depSt ? (depSt.city !== depSt.name ? depSt.name : depSt.city) : (tr.departure_airport || null);
          arrName = arrSt ? (arrSt.city !== arrSt.name ? arrSt.name : arrSt.city) : (tr.arrival_airport || null);
        } else if (isFerry && ferryPorts.length > 0) {
          const depPt = portByNameOrCode(ferryPorts, tr.departure_airport);
          const arrPt = portByNameOrCode(ferryPorts, tr.arrival_airport);
          depName = depPt ? (depPt.city !== depPt.name ? depPt.name : depPt.city) : (tr.departure_airport || null);
          arrName = arrPt ? (arrPt.city !== arrPt.name ? arrPt.name : arrPt.city) : (tr.arrival_airport || null);
        } else if (!isFlight) {
          // bus/car/other — use the raw string directly as dep/arr name
          depName = tr.departure_airport || null;
          arrName = tr.arrival_airport || null;
        }

        list.push({
          id: `tr-dep-${tr.id}`,
          type: 'transport',
          title: title || t('transport.title', 'Trasporto'),
          subtitle: tr.transport_type ? tr.transport_type.toUpperCase() : null,
          date: depDate,
          time: depTime,
          location: `${tr.departure_airport} ➔ ${tr.arrival_airport}`,
          bookingRef: tr.booking_ref || null,
          transportType: tr.transport_type,
          depName,
          arrName,
          operatorName: tr.airline || null,
          vehicleNumber: tr.flight_number || null,
          raw: tr,
        });
      }
    }

    // 3. Accommodations (Check-in and Check-out)
    for (const acc of accommodations) {
      // Il tipo e la città sono dati localizzati: vanno tradotti/risolti qui,
      // non mostrati grezzi.
      const subtitle = t(`accommodation.type.${acc.type}`, acc.type);
      const location = [acc.city, acc.address].filter(Boolean).join(', ') || null;
      if (acc.check_in_date) {
        list.push({
          id: `acc-in-${acc.id}`,
          type: 'accommodation_checkin',
          title: `${t('calendar.checkIn', 'Check-in')}: ${acc.name}`,
          subtitle,
          date: acc.check_in_date,
          time: acc.check_in_time ? acc.check_in_time.slice(0, 5) : '15:00',
          location,
          bookingRef: acc.booking_ref || null,
          raw: acc,
        });
      }
      if (acc.check_out_date) {
        list.push({
          id: `acc-out-${acc.id}`,
          type: 'accommodation_checkout',
          title: `${t('calendar.checkOut', 'Check-out')}: ${acc.name}`,
          subtitle,
          date: acc.check_out_date,
          time: acc.check_out_time ? acc.check_out_time.slice(0, 5) : '11:00',
          location,
          bookingRef: acc.booking_ref || null,
          raw: acc,
        });
      }
    }

    return list;
  }, [activities, transports, accommodations, airports, stations, ferryPorts, t]);

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
        dates.push(dateKey(curr));
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

  // Agenda view hides days with nothing on them — `dayNumber` in that list
  // still comes from this array's original index, so "Giorno 3" always means
  // the trip's 3rd day even when days 1-2 are hidden for being empty.
  const agendaDays = useMemo(
    () => tripDays.filter((d) => (eventsByDate.get(d) || []).length > 0),
    [tripDays, eventsByDate]
  );

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

  const eventsById = useMemo(() => {
    const map = new Map<string, UnifiedEvent>();
    allEvents.forEach((e) => map.set(e.id, e));
    return map;
  }, [allEvents]);

  const snapMinutes = (min: number) => Math.max(0, Math.min(23 * 60 + 45, Math.round(min / 15) * 15));
  const minutesToHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

  /** Drag-and-drop persistence: figures out which underlying record the
   * dragged UnifiedEvent wraps and updates only its date/time fields —
   * duration is preserved (the end time/date shift by the same amount). */
  const handleEventDrop = async (evId: string, newDate: string, rawMinutes: number) => {
    const ev = eventsById.get(evId);
    if (!ev) return;
    const startMin = snapMinutes(rawMinutes);
    const newTime = minutesToHHMM(startMin);
    setError(null);
    try {
      if (ev.type === 'activity') {
        const act = ev.raw as ActivityRow;
        let newEndTime: string | null = null;
        if (act.activity_time && act.end_time) {
          const dur = toMinutes(act.end_time.slice(0, 5)) - toMinutes(act.activity_time.slice(0, 5));
          if (dur > 0) newEndTime = minutesToHHMM(Math.min(23 * 60 + 59, startMin + dur));
        }
        // Shift end_date by the same span (in days) whenever it's set — even
        // when it equals activity_date (a same-day span, spanDays = 0): the
        // bug this fixes left a stale end_date behind on exactly that case,
        // which then sat *before* the freshly-dropped activity_date and
        // tripped the `end_date >= activity_date` check constraint.
        let newEndDate = act.end_date;
        if (act.end_date && act.activity_date) {
          const spanDays = Math.round(
            (new Date(`${act.end_date}T00:00:00`).getTime() - new Date(`${act.activity_date}T00:00:00`).getTime()) / 86400000
          );
          const newEnd = new Date(`${newDate}T00:00:00`);
          newEnd.setDate(newEnd.getDate() + spanDays);
          newEndDate = dateKey(newEnd);
        }
        await updateActivity(act.id, {
          activity_date: newDate,
          activity_time: newTime,
          end_time: newEndTime,
          end_date: newEndDate,
        });
      } else if (ev.type === 'transport') {
        const tr = ev.raw as TransportRow;
        await updateTransport(tr.id, { departure_datetime: new Date(`${newDate}T${newTime}:00`).toISOString() });
      } else if (ev.type === 'accommodation_checkin') {
        const acc = ev.raw as AccommodationRow;
        await updateAccommodation(acc.id, { check_in_date: newDate, check_in_time: newTime });
      } else {
        const acc = ev.raw as AccommodationRow;
        await updateAccommodation(acc.id, { check_out_date: newDate, check_out_time: newTime });
      }
      await loadData({ silent: true });
    } catch (err) {
      setError(errorMessage(err, t('common.error')));
    }
  };

  const handleEditActivity = async (input: ActivityInput) => {
    if (!editingEvent) return;
    const act = editingEvent.raw as ActivityRow;
    const category = input.category ?? null;
    if (
      category &&
      !(ACTIVITY_CATEGORIES as readonly string[]).includes(category) &&
      !customCategories.some((c) => c.name === category)
    ) {
      await createActivityCategory(trip.id, category);
    }
    await updateActivity(act.id, input);
    setEditingEvent(null);
    await loadData({ silent: true });
  };

  const handleEditTransport = async (input: TransportInput) => {
    if (!editingEvent) return;
    const tr = editingEvent.raw as TransportRow;
    await updateTransport(tr.id, input);
    setEditingEvent(null);
    await loadData({ silent: true });
  };

  const handleEditAccommodation = async (input: AccommodationInput) => {
    if (!editingEvent) return;
    const acc = editingEvent.raw as AccommodationRow;
    await updateAccommodation(acc.id, input);
    setEditingEvent(null);
    await loadData({ silent: true });
  };

  /** "+" quick-add — month day popup, or clicking a day header in Day/Week
   * view — opens the same Activity form used everywhere else, pre-filled
   * with that day's date. */
  const handleCreateActivity = async (input: ActivityInput) => {
    if (!user) return;
    const category = input.category ?? null;
    if (
      category &&
      !(ACTIVITY_CATEGORIES as readonly string[]).includes(category) &&
      !customCategories.some((c) => c.name === category)
    ) {
      await createActivityCategory(trip.id, category);
    }
    await createActivity(trip.id, user.id, input);
    setCreatingForDate(null);
    await loadData({ silent: true });
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

  const formatDateHeaderShort = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(i18n.language?.startsWith('it') ? 'it-IT' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Month grid helpers
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDayOfWeek = (monthStart.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = monthEnd.getDate();

  // Week grid helpers (Monday-start week containing currentDate)
  const weekStart = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    return d;
  }, [currentDate]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => dateKey(new Date(weekStart.getTime() + i * 86400000))),
    [weekStart]
  );

  // Day view helper
  const dayDateStr = dateKey(currentDate);

  const dayGridStartHour = useMemo(
    () => computeGridStartHour(eventsByDate.get(dayDateStr) || []),
    [eventsByDate, dayDateStr]
  );
  const weekGridStartHour = useMemo(
    () => computeGridStartHour(weekDates.flatMap((d) => eventsByDate.get(d) || [])),
    [eventsByDate, weekDates]
  );
  // First actual trip day visible in this week — target for the week
  // header's "+", and null (hiding the button) when the whole visible week
  // falls outside the trip.
  const weekAddDate = useMemo(() => weekDates.find((d) => tripDays.includes(d)) ?? null, [weekDates, tripDays]);

  const goPrev = () => {
    setCurrentDate((d) => {
      if (viewMode === 'month') return new Date(d.getFullYear(), d.getMonth() - 1, 1);
      if (viewMode === 'week') return new Date(d.getTime() - 7 * 86400000);
      return new Date(d.getTime() - 86400000);
    });
  };
  const goNext = () => {
    setCurrentDate((d) => {
      if (viewMode === 'month') return new Date(d.getFullYear(), d.getMonth() + 1, 1);
      if (viewMode === 'week') return new Date(d.getTime() + 7 * 86400000);
      return new Date(d.getTime() + 86400000);
    });
  };
  const goToday = () => setCurrentDate(new Date());

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

  const selectedDayEvents = selectedDay ? eventsByDate.get(selectedDay) || [] : [];

  return (
    <div className="space-y-6">
      {/* Top Controls Bar with Filters & View Mode Toggle — sticky right below
          the trip's section navbar (top-14 = that navbar's own height, 56px,
          so the two sit flush with no gap or overlap). */}
      <div ref={filterBarRef} className="sticky top-14 z-10 p-1.5 rounded-2xl bg-[var(--surface-0)]/90 backdrop-blur-md backdrop-saturate-150 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 flex-1">
          <button
            onClick={() => setFilterType('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              filterType === 'all'
                ? 'bg-deep-blue text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                : 'bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-900/10 dark:hover:bg-white/10'
            }`}
          >
            {t('calendar.filterAll', 'Tutti')} ({counts.all})
          </button>

          <button
            onClick={() => setFilterType('activities')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              filterType === 'bookings'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Ticket className="w-5 h-5" />
            {t('calendar.filterBookings', 'Con Prenotazione')} ({counts.bookings})
          </button>
        </div>

        {/* View Mode Toggle: Agenda / Day / Week / Month
            Same rounded-full-in-rounded-full pattern as the section tab bar:
            uniform padding on every side around a fully-rounded wrapper
            keeps the inner buttons' corners concentric with it. */}
        <div className="flex items-center gap-1 bg-slate-900/5 dark:bg-white/5 p-1.5 rounded-full shrink-0 self-start sm:self-auto overflow-x-auto">
          {(
            [
              ['agenda', ListFilter, t('calendar.viewAgenda', 'Agenda')],
              ['day', Clock, t('calendar.viewDay', 'Giorno')],
              ['week', CalendarRange, t('calendar.viewWeek', 'Settimana')],
              ['month', CalendarIcon, t('calendar.viewMonth', 'Mese')],
            ] as const
          ).map(([mode, Icon, label]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                viewMode === mode
                  ? 'bg-deep-blue text-white dark:bg-gold dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-900/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'agenda' ? (
        <div className="space-y-6">
          {agendaDays.length === 0 ? (
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
            agendaDays.map((dateStr) => {
              const dayEvents = eventsByDate.get(dateStr) || [];
              const dayNumber = tripDays.indexOf(dateStr) + 1;

              return (
                <Card key={dateStr} className="overflow-hidden transition-all duration-200 border-slate-200/80 dark:border-white/10 shadow-sm">
                  {/* Day Header — no bottom separator */}
                  <div className="flex items-center justify-between pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-gold/20 text-deep-blue dark:text-gold-light ring-1 ring-gold/40">
                        {t('calendar.day', { number: dayNumber })}
                      </span>
                      <span className="text-base font-bold text-deep-blue dark:text-gold-light capitalize">
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
                  <div className="space-y-3">
                    {dayEvents.map((ev) => (
                      <EventRow
                        key={ev.id}
                        ev={ev}
                        color={resolveEventColor(ev)}
                        copiedRef={copiedRef}
                        onCopyRef={handleCopyRef}
                        onClick={() => setEditingEvent(ev)}
                      />
                    ))}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      ) : viewMode === 'month' ? (
        /* Month View Grid */
        <Card className="p-6 card-static">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold capitalize text-deep-blue dark:text-gold-light">
              {currentDate.toLocaleDateString(i18n.language?.startsWith('it') ? 'it-IT' : 'en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={goToday} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                {t('calendar.today')}
              </button>
              <button
                onClick={goPrev}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label={t('calendar.previous')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label={t('calendar.next')}
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
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventsByDate.get(dateStr) || [];
              const isTripDay = tripDays.includes(dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={isTripDay ? () => setSelectedDay(dateStr) : undefined}
                  className={`min-h-[72px] sm:min-h-[88px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    isTripDay
                      ? 'cursor-pointer border-gold/30 bg-gold/5 dark:bg-gold/[0.04] hover:border-gold/60'
                      : 'cursor-default opacity-40 border-slate-200/40 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isTripDay ? 'text-gold-dark dark:text-gold-light' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
                  </div>

                  {/* Mini Event Badges */}
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <MonthMiniBadge
                        key={ev.id}
                        ev={ev}
                        color={resolveEventColor(ev)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(ev);
                        }}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-semibold text-slate-400">
                        +{dayEvents.length - 2} {t('calendar.more', 'altri')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : viewMode === 'week' ? (
        /* Week View — 7-column time grid */
        <>
          {/* Sticky right below the outer filter bar — a top-level sticky
              sibling, same as the filter bar is to the navbar, NOT nested
              inside the card below: nesting it inside a card with
              `overflow-hidden` (needed there for the scroll area's rounded
              corners) broke sticky entirely, since that ancestor becomes the
              scrolling reference instead of the page. `top` is measured
              (see weekDayStickyTop), not guessed. */}
          <div
            className="sticky z-[5] rounded-t-2xl border border-b-0 border-slate-200/60 dark:border-white/10 bg-[var(--surface-1)] shadow-sm"
            style={{ top: weekDayStickyTop }}
          >
          <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-deep-blue dark:text-gold-light">
                {formatDateHeaderShort(weekDates[0])} - {formatDateHeaderShort(weekDates[6])}
              </h3>
              {weekAddDate && (
                <button
                  onClick={() => setCreatingForDate(weekAddDate)}
                  className="p-1.5 rounded-full text-deep-blue dark:text-gold-light hover:bg-gold/15 transition-colors cursor-pointer"
                  aria-label={t('activity.add')}
                  title={t('activity.add')}
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={goToday} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                {t('calendar.today')}
              </button>
              <button onClick={goPrev} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer" aria-label={t('calendar.previous')}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goNext} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer" aria-label={t('calendar.next')}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="flex border-b border-slate-200/60 dark:border-white/5" style={{ paddingRight: weekScrollbarWidth }}>
            <div className="w-12 shrink-0" />
            {weekDates.map((d) => {
              const isToday = d === dateKey(new Date());
              const isTripDay = tripDays.includes(d);
              return (
                <div
                  key={d}
                  onClick={isTripDay ? () => setSelectedDay(d) : undefined}
                  className={`flex-1 min-w-0 text-center py-2 border-l border-slate-200/40 dark:border-white/5 transition-colors ${
                    isTripDay ? 'cursor-pointer hover:bg-gold/10' : 'cursor-default opacity-40'
                  } ${isToday ? 'bg-gold/10' : ''}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {formatDateHeaderShort(d).split(' ')[0]}
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      isToday ? 'text-gold-dark dark:text-gold-light' : isTripDay ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {new Date(`${d}T00:00:00`).getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* All-day strip */}
          <div className="flex border-b border-slate-200/60 dark:border-white/5" style={{ paddingRight: weekScrollbarWidth }}>
            <div className="w-12 shrink-0" />
            {weekDates.map((d) => {
              const dayAllDay = (eventsByDate.get(d) || []).filter((ev) => ev.allDay || !ev.time);
              return (
                <div key={d} className="flex-1 min-w-0 p-1 space-y-1 border-l border-slate-200/40 dark:border-white/5">
                  {dayAllDay.map((ev) => (
                    <AllDayChip key={ev.id} ev={ev} color={resolveEventColor(ev)} compact onClick={() => setEditingEvent(ev)} />
                  ))}
                </div>
              );
            })}
          </div>
          </div>

          {/* Scrollable time grid — plain div, not the shared `Card`
              component: `.card`'s own rounded-xl applies to all four
              corners as plain (unlayered) CSS, which a `rounded-b-*`
              utility class can't win against by source order (same issue
              fixed earlier for `.input-field` vs `w-auto`), so styling it
              here directly is simpler than fighting that override. */}
          <div
            ref={weekGridRef}
            className="overflow-y-auto max-h-[600px] rounded-b-2xl border border-t-0 border-slate-200/60 dark:border-white/10 bg-[var(--surface-1)] shadow-sm"
          >
            <div className="flex">
              <div className="w-12 shrink-0">
                {ALL_HOUR_LABELS.slice(weekGridStartHour).map((label) => (
                  <div key={label} style={{ height: HOUR_HEIGHT }} className="text-[10px] text-slate-400 dark:text-slate-500 text-right pr-1.5 -translate-y-2">
                    {label}
                  </div>
                ))}
              </div>
              {weekDates.map((d) => (
                <div key={d} className="flex-1 min-w-0 border-l border-slate-200/40 dark:border-white/5">
                  <TimeGridColumn
                    dateStr={d}
                    events={(eventsByDate.get(d) || []).filter((ev) => !ev.allDay && ev.time)}
                    colorFor={resolveEventColor}
                    startHour={weekGridStartHour}
                    compact
                    onEventClick={(ev) => setEditingEvent(ev)}
                    onEventDrop={handleEventDrop}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Day View — single-column time grid */
        <>
          <div
            className="sticky z-[5] rounded-t-2xl border border-b-0 border-slate-200/60 dark:border-white/10 bg-[var(--surface-1)] shadow-sm"
            style={{ top: weekDayStickyTop }}
          >
          <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold capitalize text-deep-blue dark:text-gold-light">
                {formatDateHeader(dayDateStr)}
              </h3>
              {tripDays.includes(dayDateStr) && (
              <button
                onClick={() => setCreatingForDate(dayDateStr)}
                className="p-1.5 rounded-full text-deep-blue dark:text-gold-light hover:bg-gold/15 transition-colors cursor-pointer"
                aria-label={t('activity.add')}
                title={t('activity.add')}
              >
                <Plus className="w-5 h-5" />
              </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={goToday} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                {t('calendar.today')}
              </button>
              <button onClick={goPrev} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer" aria-label={t('calendar.previous')}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goNext} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer" aria-label={t('calendar.next')}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* All-day strip */}
          {(() => {
            const dayAllDay = (eventsByDate.get(dayDateStr) || []).filter((ev) => ev.allDay || !ev.time);
            return dayAllDay.length > 0 ? (
              <div className="p-3 border-b border-slate-200/60 dark:border-white/5 space-y-1.5">
                {dayAllDay.map((ev) => (
                  <AllDayChip key={ev.id} ev={ev} color={resolveEventColor(ev)} onClick={() => setEditingEvent(ev)} />
                ))}
              </div>
            ) : null;
          })()}
          </div>

          {/* Scrollable time grid — plain div, see the same note in Week view
              about why `Card` isn't used here. */}
          <div className="overflow-y-auto max-h-[600px] rounded-b-2xl border border-t-0 border-slate-200/60 dark:border-white/10 bg-[var(--surface-1)] shadow-sm">
            <div className="flex">
              <div className="w-14 shrink-0">
                {ALL_HOUR_LABELS.slice(dayGridStartHour).map((label) => (
                  <div key={label} style={{ height: HOUR_HEIGHT }} className="text-[11px] text-slate-400 dark:text-slate-500 text-right pr-2 -translate-y-2">
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0 border-l border-slate-200/40 dark:border-white/5">
                <TimeGridColumn
                  dateStr={dayDateStr}
                  events={(eventsByDate.get(dayDateStr) || []).filter((ev) => !ev.allDay && ev.time)}
                  colorFor={resolveEventColor}
                  startHour={dayGridStartHour}
                  onEventClick={(ev) => setEditingEvent(ev)}
                  onEventDrop={handleEventDrop}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Day detail popup (Month view day click) */}
      <Modal
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? formatDateHeader(selectedDay) : ''}
      >
        <div className="flex justify-end mb-3">
          <Button
            onClick={() => {
              const day = selectedDay;
              setSelectedDay(null);
              setCreatingForDate(day);
            }}
          >
            <Plus className="w-5 h-5" />
            {t('activity.add')}
          </Button>
        </div>
        {selectedDayEvents.length === 0 ? (
          <p className="text-sm italic text-slate-400 py-4 text-center">
            {t('calendar.noEventsThisDay', 'Nessun impegno programmato per questo giorno')}
          </p>
        ) : (
          <div className="space-y-3">
            {selectedDayEvents.map((ev) => (
              <EventRow
                key={ev.id}
                ev={ev}
                color={resolveEventColor(ev)}
                copiedRef={copiedRef}
                onCopyRef={handleCopyRef}
                onClick={() => {
                  setSelectedDay(null);
                  setEditingEvent(ev);
                }}
              />
            ))}
          </div>
        )}
      </Modal>

      {/* Quick-add popup — "+" from the month day popup, or clicking a day
          header in Day/Week view. */}
      <Modal
        open={!!creatingForDate}
        onClose={() => setCreatingForDate(null)}
        title={t('activity.add')}
      >
        <ActivityForm
          initial={null}
          defaultDate={creatingForDate ?? undefined}
          tripStart={trip.start_date}
          tripEnd={trip.end_date}
          customCategories={customCategories}
          onSubmit={handleCreateActivity}
          onCancel={() => setCreatingForDate(null)}
        />
      </Modal>

      {/* Edit modal — clicking any event, in any view, opens the same form
          its own tab (Attività/Mezzi/Alloggi) uses, reused as-is. */}
      <Modal
        open={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        title={
          editingEvent?.type === 'activity'
            ? t('activity.edit')
            : editingEvent?.type === 'transport'
              ? t('transport.edit')
              : t('accommodation.edit')
        }
      >
        {editingEvent?.type === 'activity' && (
          <ActivityForm
            initial={editingEvent.raw as ActivityRow}
            tripStart={trip.start_date}
            tripEnd={trip.end_date}
            customCategories={customCategories}
            onSubmit={handleEditActivity}
            onCancel={() => setEditingEvent(null)}
          />
        )}
        {editingEvent?.type === 'transport' && (
          <TransportForm
            initial={editingEvent.raw as TransportRow}
            onSubmit={handleEditTransport}
            onCancel={() => setEditingEvent(null)}
            tripDestinations={trip.destinations ?? []}
          />
        )}
        {(editingEvent?.type === 'accommodation_checkin' || editingEvent?.type === 'accommodation_checkout') && (
          <AccommodationForm
            initial={editingEvent.raw as AccommodationRow}
            tripStart={trip.start_date}
            tripEnd={trip.end_date}
            onSubmit={handleEditAccommodation}
            onCancel={() => setEditingEvent(null)}
          />
        )}
      </Modal>
    </div>
  );
};
