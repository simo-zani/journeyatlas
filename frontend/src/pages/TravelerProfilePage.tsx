import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Loader2,
  Send,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { TripFlags } from '@/components/TripFlags';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import {
  fetchPublicTripsForUser,
  fetchTravelerProfile,
  recordProfileView,
  respondToFriendRequest,
  sendFriendRequest,
} from '@/lib/api';
import type { PublicTripRow, TravelerProfile } from '@/lib/types';

const formatDate = (date: string | null): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
};

export const TravelerProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [trips, setTrips] = useState<PublicTripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTravelerProfile(userId);
      setProfile(data);
      if (data) {
        void recordProfileView(userId).catch(() => {
          /* silenzioso: il +1 non deve bloccare la pagina */
        });
        setTripsLoading(true);
        try {
          setTrips(await fetchPublicTripsForUser(userId));
        } finally {
          setTripsLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-16 h-16 text-gold animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/travelers')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('travelerProfile.back')}
        </button>
        <p className="text-error">{error ?? t('travelerProfile.notFound')}</p>
      </div>
    );
  }

  const status = profile.friend_status;
  const isSelf = status === 'self';

  const handleSendRequest = async () => {
    setBusy(true);
    try {
      await sendFriendRequest(profile.id);
      setProfile((prev) => (prev ? { ...prev, friend_status: 'outgoing' } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const handleRespond = async (accept: boolean) => {
    if (!profile.friendship_id) return;
    setBusy(true);
    try {
      await respondToFriendRequest(profile.friendship_id, accept);
      setProfile((prev) => (prev ? { ...prev, friend_status: accept ? 'friends' : null } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative w-full max-w-[1680px] mx-auto transition-all duration-300">
      <button
        onClick={() => navigate('/travelers')}
        className="flex items-center gap-2 ml-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('travelerProfile.back')}
      </button>

      {error && <p className="text-error text-sm mb-4">{error}</p>}

      {/* ── Header profilo ── */}
      <div className="surface-panel !rounded-[2rem] mb-6 py-6 sm:py-8 pl-8 sm:pl-12 pr-6 sm:pr-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shrink-0 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gold/15 text-deep-blue dark:text-gold-light flex items-center justify-center shrink-0 shadow-lg text-5xl sm:text-6xl font-extrabold">
              {(profile.username ?? '?').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              @{profile.username ?? t('travelers.unknown')}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
              <CalendarDays className="w-5 h-5" />
              {t('travelerProfile.memberSince', { date: formatDate(profile.created_at) })}
            </p>
            {isSelf && (
              <p className="text-xs font-bold text-gold mt-1 uppercase tracking-wider">
                {t('friend.status.self')}
              </p>
            )}
          </div>

          {/* Azioni amicizia */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {isSelf ? null : status === 'friends' ? (
              <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-success/15 text-success font-bold text-base">
                <UserCheck className="w-5 h-5" />
                {t('friend.status.friends')}
              </span>
            ) : status === 'outgoing' ? (
              <Button variant="secondary" size="md" disabled>
                <Send className="w-5 h-5" />
                {t('friend.status.outgoing')}
              </Button>
            ) : status === 'incoming' ? (
              <>
                <Button size="md" onClick={() => handleRespond(true)} disabled={busy}>
                  <Check className={MODAL_ICON_SIZE} />
                  {t('friend.accept')}
                </Button>
                <Button size="md" onClick={() => handleRespond(false)} disabled={busy}>
                  <X className={MODAL_ICON_SIZE} />
                  {t('friend.decline')}
                </Button>
              </>
            ) : (
              <Button size="md" onClick={handleSendRequest} disabled={busy}>
                <UserPlus className="w-5 h-5" />
                {t('friend.add')}
              </Button>
            )}
          </div>
        </div>

        {/* ── Statistiche ── */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-gold">{profile.countries_visited}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t('travelerProfile.stats.countries')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-gold">{profile.continents_visited}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t('travelerProfile.stats.continents')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-gold">{profile.public_trips_count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t('travelerProfile.stats.trips')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Viaggi pubblici ── */}
      {!tripsLoading && trips.length > 0 && (
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl leading-none">🌍</span>
            {t('travelerProfile.publicTrips')}
          </h2>
        </div>
      )}

      {tripsLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <span className="text-6xl mb-4 leading-none">🌍</span>
          <p className="empty-state-title">{t('travelerProfile.noPublicTrips')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-3xl overflow-hidden shadow-lg ring-1 ring-gold/20"
              style={{ height: '176px' }}
            >
              {trip.cover_image_url ? (
                <img
                  src={trip.cover_image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                  style={{ objectPosition: `center ${trip.cover_position_y ?? 0}%` }}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-deep-blue) 0%, #1a2744 40%, #0d1c3a 70%, #0a1520 100%)',
                  }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 25%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.08) 75%, transparent 100%)',
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <TripFlags destinations={trip.destinations} size="sm" />
                  <h3 className="text-white text-base font-semibold truncate leading-snug drop-shadow">
                    {trip.name}
                  </h3>
                </div>
                {(trip.start_date || trip.end_date) && (
                  <p className="text-white/60 text-xs tracking-wide">
                    {formatDate(trip.start_date)}
                    {trip.end_date ? ` – ${formatDate(trip.end_date)}` : ''}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-8">
        <Users className="w-3.5 h-3.5" />
        {t('travelerProfile.privacyNote')}
      </p>
    </div>
  );
};