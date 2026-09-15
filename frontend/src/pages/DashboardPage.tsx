import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { TripForm } from '@/components/TripForm';
import { TripFlags } from '@/components/TripFlags';
import { useAuth } from '@/auth/AuthContext';
import { fetchMyTrips } from '@/lib/api';
import type { Trip } from '@/lib/types';

type TravelStatus = 'ongoing' | 'planned' | 'completed';

const formatDate = (date: string | null): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const toYmd = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const todayStr = toYmd(new Date());

const getStatus = (trip: Trip): TravelStatus => {
  const start = trip.start_date ?? '';
  const end = trip.end_date ?? '';
  if (end && end < todayStr) return 'completed';
  if (start && start <= todayStr) return 'ongoing';
  return 'planned';
};

const STATUS_ORDER: TravelStatus[] = ['ongoing', 'planned', 'completed'];

const STATUS_BADGE_VARIANT: Record<TravelStatus, 'gold' | 'success' | 'warning' | 'error' | 'info'> = {
  ongoing: 'success',
  planned: 'gold',
  completed: 'info',
};

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadTrips = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyTrips(user.id);
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    void loadTrips();
  }, [loadTrips]);

  const groups = useMemo(() => {
    const byStatus: Record<TravelStatus, Trip[]> = { ongoing: [], planned: [], completed: [] };
    for (const trip of trips) {
      byStatus[getStatus(trip)].push(trip);
    }
    return byStatus;
  }, [trips]);

  const statusLabel = (status: TravelStatus) =>
    status === 'ongoing'
      ? t('dashboard.inProgress')
      : status === 'planned'
        ? t('dashboard.planned')
        : t('dashboard.completed');

  const handleTripCreated = (trip: Trip) => {
    setCreateOpen(false);
    navigate(`/trips/${trip.id}`);
  };

  const renderTripCard = (trip: Trip) => (
    <motion.div key={trip.id} variants={cardVariants}>
      <Card compact onClick={() => navigate(`/trips/${trip.id}`)} className="h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <TripFlags destinations={trip.destinations} size="sm" />
            <h3 className="text-lg truncate">{trip.name}</h3>
          </div>
          <Badge
            variant={trip.archived_at ? 'warning' : STATUS_BADGE_VARIANT[getStatus(trip)]}
            className="shrink-0"
          >
            {trip.archived_at ? t('trip.archived') : statusLabel(getStatus(trip))}
          </Badge>
        </div>

        {(trip.start_date || trip.end_date) && (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
            <Calendar className="w-4 h-4 shrink-0" />
            {formatDate(trip.start_date)}
            {trip.end_date ? ` — ${formatDate(trip.end_date)}` : ''}
          </p>
        )}

        {trip.destinations && trip.destinations.length > 0 && (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
            <MapPin className="w-4 h-4 shrink-0" />
            {trip.destinations.map((d) => d.city).filter(Boolean).join(', ')}
          </p>
        )}

        {trip.budget_planned != null && (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Wallet className="w-4 h-4 shrink-0" />
            {t('trip.budget')}: {trip.budget_planned}
          </p>
        )}
      </Card>
    </motion.div>
  );

  const renderSection = (status: TravelStatus) => {
    const sectionTrips = groups[status];
    if (sectionTrips.length === 0) return null;

    return (
      <section key={status} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status === 'ongoing'
                ? 'bg-success'
                : status === 'planned'
                  ? 'bg-gold'
                  : 'bg-slate-400 dark:bg-slate-500'
            }`}
          />
          <h2 className="font-poppins font-semibold text-xl">{statusLabel(status)}</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({sectionTrips.length})
          </span>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          {sectionTrips.map(renderTripCard)}
        </motion.div>
      </section>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="mb-1">{t('dashboard.title')}</h1>
          {user?.email && (
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('dashboard.welcome', { name: user.email })}
            </p>
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-5 h-5" />
          {t('dashboard.createTrip')}
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-error mb-6"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-16 h-16 text-gold animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="empty-state-icon">✈️</div>
          <p className="empty-state-title">{t('dashboard.noTrips')}</p>
          <p className="empty-state-message">{t('dashboard.noTripsSub')}</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="w-5 h-5" />
            {t('dashboard.createTrip')}
          </Button>
        </motion.div>
      ) : (
        <div>{STATUS_ORDER.map(renderSection)}</div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('dashboard.createTrip')}>
        <TripForm onSuccess={handleTripCreated} />
      </Modal>
    </div>
  );
};