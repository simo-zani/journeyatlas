import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { History, Pencil, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

import { Modal } from '@/components/Modal';
import { PendingInvites } from '@/components/PendingInvites';
import { TripNotices } from '@/components/TripNotices';
import { TripForm } from '@/components/TripForm';
import { MemoryTripForm } from '@/components/MemoryTripForm';
import { TripFlags } from '@/components/TripFlags';
import { useAuth } from '@/auth/AuthContext';
import { fetchMyTrips } from '@/lib/api';
import { formatMonthRange } from '@/lib/tripDates';
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




const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  // Viaggio in modifica dalla matita della scheda (completo o rapido).
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

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
    // In ogni gruppo, dal viaggio più recente (data di inizio) al più vecchio; senza data in fondo.
    const byStartDesc = (x: Trip, y: Trip) => (y.start_date ?? '').localeCompare(x.start_date ?? '');
    for (const status of STATUS_ORDER) byStatus[status].sort(byStartDesc);
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

  // Un ricordo resta in dashboard (tra i conclusi): di solito se ne aggiungono più di fila.
  const handleMemoryCreated = () => {
    setMemoryOpen(false);
    void loadTrips();
  };

  const renderTripCard = (trip: Trip) => {
    const dateStr =
      formatMonthRange(trip, i18n.language) ??
      [trip.start_date ? formatDate(trip.start_date) : null, trip.end_date ? formatDate(trip.end_date) : null]
        .filter(Boolean)
        .join('  ·  ');

    return (
      <motion.div key={trip.id} variants={cardVariants} className="h-full">
        <Card
          noPadding
          onClick={trip.is_memory ? undefined : () => navigate(`/trips/${trip.id}`)}
          className={`h-full overflow-hidden ${trip.is_memory ? 'card-static' : ''}`}
        >
          {/* Cover area */}
          <div className="relative flex-shrink-0" style={{ height: '176px' }}>
            {trip.owner_id === user?.id && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // la scheda (viaggio completo) aprirebbe il viaggio
                  setEditingTrip(trip);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                aria-label={trip.is_memory ? t('memory.edit') : t('trip.editTitle')}
                title={trip.is_memory ? t('memory.edit') : t('trip.editTitle')}
                className="absolute top-2.5 right-2.5 z-10 w-[32px] h-[32px] rounded-lg flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-md ring-1 ring-gold/40 hover:ring-gold transition-all cursor-pointer"
              >
                <Pencil className="w-[16px] h-[16px] text-gold" />
              </button>
            )}
            {trip.cover_image_url ? (
              <img
                src={trip.cover_image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              /* Gradient fallback when no cover image */
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-deep-blue) 0%, #1a2744 40%, #0d1c3a 70%, #0a1520 100%)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 30% 50%, rgba(212,175,55,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(100,150,255,0.2) 0%, transparent 50%)',
                  }}
                />
              </div>
            )}
            {/* Overlay sfumato multi-stop — effetto cinematografico */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 25%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.08) 75%, transparent 100%)',
              }}
            />

            {/* Contenuto in basso */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
              {/* Bandiera + titolo */}
              <div className="flex items-center gap-2.5 mb-1">
                <TripFlags destinations={trip.destinations} size="sm" />
                <h3 className="text-white text-base font-semibold truncate leading-snug drop-shadow">
                  {trip.archived_at ? <span className="opacity-60">[Archiviato] </span> : null}
                  {trip.name}
                </h3>
              </div>

              {/* Date */}
              {dateStr && <p className="text-white/60 text-xs tracking-wide">{dateStr}</p>}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };




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
          <h1>{t('dashboard.title')}</h1>
        </div>
        {/* Viaggio completo in evidenza; il viaggio rapido, più piccolo, sotto */}
        <div className="flex flex-col items-stretch sm:items-end gap-2">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-5 h-5" />
            {t('dashboard.createTrip')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setMemoryOpen(true)}
            className="!min-h-0 !h-[34px] !py-0 !px-[14px] !text-xs !gap-1.5"
          >
            <History className="w-[16px] h-[16px]" />
            {t('memory.add')}
          </Button>
        </div>
      </div>

      <TripNotices />
      <PendingInvites onAccepted={() => void loadTrips()} />

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
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('dashboard.createTrip')} maxWidth="max-w-5xl" tall>
        <TripForm onSuccess={handleTripCreated} />
      </Modal>

      <Modal open={memoryOpen} onClose={() => setMemoryOpen(false)} title={t('memory.add')} maxWidth="max-w-2xl">
        <MemoryTripForm onSuccess={handleMemoryCreated} />
      </Modal>

      <Modal
        open={editingTrip !== null}
        onClose={() => setEditingTrip(null)}
        title={editingTrip?.is_memory ? t('memory.edit') : t('trip.editTitle')}
        maxWidth={editingTrip?.is_memory ? 'max-w-2xl' : 'max-w-5xl'}
        tall={!editingTrip?.is_memory}
      >
        {editingTrip &&
          (editingTrip.is_memory ? (
            <MemoryTripForm
              key={editingTrip.id}
              initial={editingTrip}
              onSuccess={() => {
                setEditingTrip(null);
                void loadTrips();
              }}
              onDeleted={() => {
                setEditingTrip(null);
                void loadTrips();
              }}
            />
          ) : (
            <TripForm
              key={editingTrip.id}
              initial={editingTrip}
              onSuccess={() => {
                setEditingTrip(null);
                void loadTrips();
              }}
              onDeleted={() => {
                setEditingTrip(null);
                void loadTrips();
              }}
            />
          ))}
      </Modal>
    </div>
  );
};