import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  FileText,
  Info,
  Loader2,
  MessageSquare,
  Mountain,
  NotebookText,
  Pencil,
  Route,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import { TripForm } from '@/components/TripForm';
import { TripFlags } from '@/components/TripFlags';
import { CalendarSection } from '@/components/trip/CalendarSection';
import { ActivitySection } from '@/components/trip/ActivitySection';
import { AccommodationSection } from '@/components/trip/AccommodationSection';
import { TransportSection } from '@/components/trip/TransportSection';
import { ChecklistSection } from '@/components/trip/ChecklistSection';
import { ShareTripModal } from '@/components/trip/ShareTripModal';
import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Trip } from '@/lib/types';

type TripSection =
  | 'calendar'
  | 'activities'
  | 'accommodations'
  | 'transport'
  | 'packing'
  | 'expenses'
  | 'info'
  | 'documents'
  | 'chat'
  | 'report';

const ACTIVE_SECTIONS: TripSection[] = ['calendar', 'activities', 'accommodations', 'transport', 'packing'];
const INACTIVE_SECTIONS: TripSection[] = ['expenses', 'info', 'documents'];

const SECTION_ICONS: Record<TripSection, LucideIcon> = {
  calendar: CalendarDays,
  activities: Mountain,
  accommodations: BedDouble,
  transport: Route,
  packing: NotebookText,
  expenses: Wallet,
  info: Info,
  documents: FileText,
  chat: MessageSquare,
  report: BarChart3,
};

export const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<TripSection>('calendar');
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [tabsScrolled, setTabsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tripId) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setTrip(data as Trip);
      }
      setLoading(false);
    };
    void load();
  }, [tripId]);

  // IntersectionObserver to detect when header scrolls away (sticky tabs blur effect)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setTabsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const formatDate = (date: string | null) =>
    date ? new Date(`${date}T00:00:00`).toLocaleDateString() : '';

  const duration = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return null;
    const start = new Date(`${trip.start_date}T00:00:00`).getTime();
    const end = new Date(`${trip.end_date}T00:00:00`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
    const days = Math.round((end - start) / 86400000) + 1;
    return { nights: days - 1 };
  }, [trip]);

  const sectionLabel = (section: TripSection) => t(`tripSection.${section}`);
  const hasCover = Boolean(trip?.cover_image_url);

  return (
    <div className="relative w-full max-w-[1680px] mx-auto transition-all duration-300">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-16 h-16 text-gold animate-spin" />
        </div>
      ) : error || !trip ? (
        <p className="text-error">{error ?? t('trip.notFound')}</p>
      ) : (
        <>
          {/* ── Cover image background fading downward ── */}
          {hasCover && (
            <div
              className="pointer-events-none absolute -top-[clamp(16px,2.5vw,40px)] -left-[clamp(16px,2.5vw,48px)] -right-[clamp(16px,2.5vw,48px)] h-80 sm:h-96 overflow-hidden z-0"
              style={{
                backgroundImage: `url(${trip.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: `center ${trip.cover_position_y ?? 0}%`,
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)',
              }}
            />
          )}

          {/* ── Header content: title, dates and action buttons (aligned with tabs) ── */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4 sm:pt-6 pb-3 mb-2">
            {/* Left: Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2 min-w-0">
                <TripFlags destinations={trip.destinations} />
                <h1
                  className={`truncate text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    hasCover ? 'text-white drop-shadow-md' : 'text-slate-900 dark:text-slate-50'
                  }`}
                >
                  {trip.name}
                </h1>
              </div>

              {trip.destinations && trip.destinations.length > 0 && (
                <p
                  className={`text-base font-medium truncate ${
                    hasCover ? 'text-white/85 drop-shadow' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {trip.destinations.map((d) => d.city).filter(Boolean).join(' · ')}
                </p>
              )}

              {(trip.start_date || trip.end_date) && (
                <div
                  className={`flex flex-col gap-0.5 mt-1.5 text-sm sm:text-base font-medium ${
                    hasCover ? 'text-white/75 drop-shadow' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span>
                    {formatDate(trip.start_date)}
                    {trip.end_date ? ` – ${formatDate(trip.end_date)}` : ''}
                  </span>
                  {duration && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs sm:text-sm ${
                        hasCover ? 'text-white/50' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {/* Rising, shrinking "zzz" — lucide-react has no sleep icon, so this is a
                          small hand-built substitute rather than an unrelated bed/moon icon. */}
                      <span className="inline-flex items-end gap-px leading-none" aria-hidden="true">
                        <span className="text-[10px]">z</span>
                        <span className="text-[8px] -translate-y-0.5">z</span>
                        <span className="text-[6px] -translate-y-[3px]">z</span>
                      </span>
                      {t('trip.durationNights', { nights: duration.nights })}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Action icons column (uniform w-6 h-6 icons in prominent buttons) */}
            <div className="flex sm:flex-col items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setEditOpen(true)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
                  hasCover
                    ? 'text-white bg-black/60 hover:bg-black/80 backdrop-blur-md ring-2 ring-gold/50'
                    : 'text-gold-light bg-slate-800/90 hover:bg-slate-700/90 ring-2 ring-gold/40 hover:ring-gold'
                }`}
                aria-label={t('trip.editTitle')}
                title={t('trip.editTitle')}
              >
                <Pencil className="w-5 h-5 text-gold" strokeWidth={2} />
              </button>

              <div className={`hidden sm:block w-6 h-px my-0.5 ${ hasCover ? 'bg-white/20' : 'bg-slate-700/60 dark:bg-white/10' }`} />

              <button
                onClick={() => setShareOpen(true)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
                  hasCover
                    ? 'text-white bg-black/60 hover:bg-black/80 backdrop-blur-md ring-2 ring-gold/50'
                    : 'text-gold-light bg-slate-800/90 hover:bg-slate-700/90 ring-2 ring-gold/40 hover:ring-gold'
                }`}
                aria-label={t('share.title')}
                title={t('share.title')}
              >
                <Users className="w-5 h-5" strokeWidth={2} />
              </button>

              {[
                { Icon: MessageSquare, key: 'chat' },
                { Icon: BarChart3, key: 'report' },
              ].map(({ Icon, key }) => (
                <button
                  key={key}
                  disabled
                  className={`w-10 h-10 rounded-xl flex items-center justify-center opacity-70 cursor-not-allowed transition-all shadow-md ${
                    hasCover
                      ? 'text-white/80 bg-black/45 backdrop-blur-md ring-1 ring-white/20'
                      : 'text-slate-300 dark:text-slate-300 bg-slate-800/70 ring-1 ring-slate-700 dark:ring-white/15'
                  }`}
                  aria-label={t(`tripSection.${key}`, key)}
                  title={t(`tripSection.${key}`, key)}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>

          <Modal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            title={t('trip.editTitle')}
          >
            <TripForm
              initial={trip}
              onSuccess={(updated) => {
                setTrip(updated);
                setEditOpen(false);
              }}
            />
          </Modal>

          {user && (
            <ShareTripModal
              open={shareOpen}
              onClose={() => setShareOpen(false)}
              tripId={trip.id}
              currentUserId={user.id}
              isOwner={trip.owner_id === user.id}
            />
          )}

          {/* Sentinel element to detect when header is out of view */}
          <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

          {/* ── Section Tabs ── */}
          <nav
            className={`sticky top-0 z-20 flex gap-1 sm:gap-1.5 mb-6 w-full items-center overflow-x-auto overflow-y-hidden p-1.5 rounded-full backdrop-blur-xl backdrop-saturate-150 bg-[var(--surface-0)]/65 border border-slate-200/50 dark:border-white/10 transition-all ${tabsScrolled ? 'shadow-lg shadow-black/15 border-slate-300/60 dark:border-white/20' : 'shadow-sm'}`}
            aria-label="Trip sections"
          >
            {[...ACTIVE_SECTIONS, ...INACTIVE_SECTIONS].map((section) => {
              const isActiveSection = activeSection === section;
              const isEnabled = ACTIVE_SECTIONS.includes(section);
              const Icon = SECTION_ICONS[section];
              return (
                <button
                  key={section}
                  onClick={() => isEnabled && setActiveSection(section)}
                  disabled={!isEnabled}
                  className={`tab-pill relative flex flex-1 min-w-0 px-1 sm:px-2 py-2.5 items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs xl:text-sm font-semibold transition-all ${
                    isActiveSection
                      ? 'text-deep-blue dark:text-gold-light'
                      : isEnabled
                        ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isActiveSection && (
                    <motion.span
                      layoutId="trip-tab-active"
                      className="absolute inset-0 rounded-full bg-gold/15 ring-1 ring-gold/40"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="w-6 h-6 relative shrink-0" strokeWidth={2} />
                  <span className="relative truncate select-none">{sectionLabel(section)}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Section Content ── */}
          {activeSection === 'calendar' && (
            <CalendarSection trip={trip} onSelectTab={(tab) => setActiveSection(tab)} />
          )}
          {activeSection === 'activities' && user && (
            <ActivitySection tripId={trip.id} userId={user.id} tripStart={trip.start_date} tripEnd={trip.end_date} />
          )}
          {activeSection === 'accommodations' && (
            <AccommodationSection tripId={trip.id} tripStart={trip.start_date} tripEnd={trip.end_date} />
          )}
          {activeSection === 'transport' && <TransportSection tripId={trip.id} />}
          {activeSection === 'packing' && user && (
            <ChecklistSection tripId={trip.id} userId={user.id} />
          )}
        </>
      )}
    </div>
  );
};
