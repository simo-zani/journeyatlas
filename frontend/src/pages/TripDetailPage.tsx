import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import { Card } from '@/components/Card';
import { ActivitySection } from '@/components/trip/ActivitySection';
import { AccommodationSection } from '@/components/trip/AccommodationSection';
import { FlightSection } from '@/components/trip/FlightSection';
import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Trip } from '@/lib/types';

type TripSection = 'activities' | 'accommodations' | 'flights' | 'packing' | 'expenses' | 'info' | 'documents' | 'chat' | 'report';

const ACTIVE_SECTIONS: TripSection[] = ['activities', 'accommodations', 'flights'];
const INACTIVE_SECTIONS: TripSection[] = ['packing', 'expenses', 'info', 'documents', 'chat', 'report'];

export const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<TripSection>('activities');

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

  const sectionLabel = (section: TripSection) => t(`tripSection.${section}`);

  return (
    <div className="max-w-6xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : error || !trip ? (
        <p className="text-error">{error ?? t('trip.notFound')}</p>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h1>{trip.name}</h1>
              {(trip.start_date || trip.end_date) && (
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {formatDate(trip.start_date)}
                  {trip.end_date ? ` — ${formatDate(trip.end_date)}` : ''}
                </p>
              )}
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

          <nav
            className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1"
            aria-label="Trip sections"
          >
            {[...ACTIVE_SECTIONS, ...INACTIVE_SECTIONS].map((section) => {
              const isActiveSection = activeSection === section;
              const isEnabled = ACTIVE_SECTIONS.includes(section);
              return (
                <button
                  key={section}
                  onClick={() => isEnabled && setActiveSection(section)}
                  disabled={!isEnabled}
                  className={`shrink-0 px-4 py-2 rounded-lg font-semibold min-h-[44px] transition-colors ${
                    isActiveSection
                      ? 'bg-deep-blue text-white border-2 border-gold'
                      : isEnabled
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-gold'
                        : 'bg-transparent text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-600 cursor-not-allowed'
                  }`}
                >
                  {sectionLabel(section)}
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
          {activeSection === 'flights' && <FlightSection tripId={trip.id} />}
        </>
      )}
    </div>
  );
};