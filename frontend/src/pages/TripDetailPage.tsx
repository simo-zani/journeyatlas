import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BedDouble,
  Calendar,
  FileText,
  Info,
  Loader2,
  MessageSquare,
  Mountain,
  Package,
  Pencil,
  Route,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { TripForm } from '@/components/TripForm';
import { TripFlags } from '@/components/TripFlags';
import { ActivitySection } from '@/components/trip/ActivitySection';
import { AccommodationSection } from '@/components/trip/AccommodationSection';
import { TransportSection } from '@/components/trip/TransportSection';
import { ChecklistSection } from '@/components/trip/ChecklistSection';
import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Trip } from '@/lib/types';

type TripSection = 'activities' | 'accommodations' | 'transport' | 'packing' | 'expenses' | 'info' | 'documents' | 'chat' | 'report';

const ACTIVE_SECTIONS: TripSection[] = ['activities', 'accommodations', 'transport', 'packing'];
const INACTIVE_SECTIONS: TripSection[] = ['expenses', 'info', 'documents', 'chat', 'report'];

const SECTION_ICONS: Record<TripSection, LucideIcon> = {
  activities: Mountain,
  accommodations: BedDouble,
  transport: Route,
  packing: Package,
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
  const [activeSection, setActiveSection] = useState<TripSection>('activities');
  const [editOpen, setEditOpen] = useState(false);

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

  const formatDate = (date: string | null) =>
    date ? new Date(`${date}T00:00:00`).toLocaleDateString() : '';

  const duration = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return null;
    const start = new Date(`${trip.start_date}T00:00:00`).getTime();
    const end = new Date(`${trip.end_date}T00:00:00`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
    const days = Math.round((end - start) / 86400000) + 1;
    return { days, nights: days - 1 };
  }, [trip]);

  const sectionLabel = (section: TripSection) => t(`tripSection.${section}`);

  return (
    <div className="max-w-6xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-16 h-16 text-gold animate-spin" />
        </div>
      ) : error || !trip ? (
        <p className="text-error">{error ?? t('trip.notFound')}</p>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <TripFlags destinations={trip.destinations} />
                <h1 className="truncate">{trip.name}</h1>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                {(trip.start_date || trip.end_date) && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 shrink-0" />
                      {formatDate(trip.start_date)}
                      {trip.end_date ? ` · ${formatDate(trip.end_date)}` : ''}
                    </p>
                    {duration && (
                      <p className="mt-1 ml-7 text-xs text-slate-400 dark:text-slate-500">
                        ({t('trip.durationDays', { days: duration.days, nights: duration.nights })})
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setEditOpen(true)}
                  className="p-2.5 rounded-lg text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors shrink-0"
                  aria-label={t('trip.editTitle')}
                  title={t('trip.editTitle')}
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
            </div>

            {trip.destinations && trip.destinations.length > 0 && (
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                {trip.destinations.map((d) => d.city).filter(Boolean).join(' · ')}
              </p>
            )}

            {trip.description && (
              <p className="text-slate-600 dark:text-slate-400">{trip.description}</p>
            )}
          </Card>

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

          <nav
            className="flex gap-2 overflow-x-auto pt-2 pb-2 mb-6 -mx-1 px-1"
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
                  className={`tab-pill relative flex-1 basis-0 min-w-[120px] items-center justify-center gap-2 ${
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
                  <Icon className="w-5 h-5 relative shrink-0" />
                  <span className="relative truncate">{sectionLabel(section)}</span>
                </button>
              );
            })}
          </nav>

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