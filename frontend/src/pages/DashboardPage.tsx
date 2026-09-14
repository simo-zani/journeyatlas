import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { TripForm } from '@/components/TripForm';
import { useAuth } from '@/auth/AuthContext';
import { fetchMyTrips } from '@/lib/api';
import type { Trip } from '@/lib/types';

const formatDate = (date: string | null): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
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

  const handleTripCreated = (trip: Trip) => {
    setCreateOpen(false);
    navigate(`/trips/${trip.id}`);
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

      {error && (
        <div className="mb-6">
          <p className="text-error">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✈️</div>
          <p className="empty-state-title">{t('dashboard.noTrips')}</p>
          <p className="empty-state-message">{t('dashboard.noTripsSub')}</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="w-5 h-5" />
            {t('dashboard.createTrip')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} compact onClick={() => navigate(`/trips/${trip.id}`)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg">{trip.name}</h3>
                <Badge variant={trip.archived_at ? 'warning' : 'gold'}>
                  {trip.archived_at ? t('trip.archived') : t('trip.upcoming')}
                </Badge>
              </div>

              {(trip.start_date || trip.end_date) && (
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(trip.start_date)}
                  {trip.end_date ? ` — ${formatDate(trip.end_date)}` : ''}
                </p>
              )}

              {trip.destinations && trip.destinations.length > 0 && (
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  {trip.destinations.map((d) => d.city).filter(Boolean).join(', ')}
                </p>
              )}

              {trip.budget_planned != null && (
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Wallet className="w-4 h-4" />
                  {t('trip.budget')}: {trip.budget_planned}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('dashboard.createTrip')}>
        <TripForm onSuccess={handleTripCreated} />
      </Modal>
    </div>
  );
};