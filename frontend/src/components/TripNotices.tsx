import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMinus, X } from 'lucide-react';
import { Card } from '@/components/Card';
import { dismissTripNotification, fetchMyTripNotifications } from '@/lib/api';
import type { TripNotification } from '@/lib/types';

/** Avvisi in home (es. "sei stato rimosso dal viaggio"): restano finché non si chiudono. */
export const TripNotices: React.FC = () => {
  const { t } = useTranslation();
  const [notices, setNotices] = useState<TripNotification[]>([]);

  useEffect(() => {
    fetchMyTripNotifications()
      .then(setNotices)
      .catch(() => setNotices([]));
  }, []);

  const handleDismiss = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    try {
      await dismissTripNotification(id);
    } catch {
      // l'avviso riapparirà al prossimo caricamento: nessun danno
    }
  };

  if (notices.length === 0) return null;

  return (
    <section className="mt-6 mb-2 space-y-3">
      {notices.map((n) => (
        <Card key={n.id} compact className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
            <UserMinus className="w-5 h-5" />
          </div>
          <p className="flex-1 min-w-0 text-sm">
            {n.actor_username
              ? t('notices.removedBy', { trip: n.trip_name, username: n.actor_username })
              : t('notices.removed', { trip: n.trip_name })}
          </p>
          <button
            type="button"
            onClick={() => void handleDismiss(n.id)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={t('notices.dismiss')}
            aria-label={t('notices.dismiss')}
          >
            <X className="w-5 h-5" />
          </button>
        </Card>
      ))}
    </section>
  );
};
