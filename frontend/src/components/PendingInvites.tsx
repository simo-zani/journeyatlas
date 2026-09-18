import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, X } from 'lucide-react';
import { Card } from '@/components/Card';
import { fetchPendingInvitesForMe, respondToInvite } from '@/lib/api';
import type { PendingInvite } from '@/lib/types';

interface PendingInvitesProps {
  onAccepted: () => void;
}

export const PendingInvites: React.FC<PendingInvitesProps> = ({ onAccepted }) => {
  const { t } = useTranslation();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingInvitesForMe()
      .then(setInvites)
      .catch(() => setInvites([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (invite: PendingInvite, accept: boolean) => {
    setRespondingId(invite.participant_id);
    try {
      await respondToInvite(invite.participant_id, accept);
      setInvites((prev) => prev.filter((i) => i.participant_id !== invite.participant_id));
      if (accept) onAccepted();
    } finally {
      setRespondingId(null);
    }
  };

  if (loading || invites.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="font-poppins font-semibold text-xl mb-4">{t('share.pendingInvitesTitle')}</h2>
      <div className="space-y-3">
        {invites.map((invite) => (
          <Card key={invite.participant_id} compact className="flex items-center gap-4">
            {invite.trip_cover_image_url ? (
              <img
                src={invite.trip_cover_image_url}
                alt=""
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gold/15 flex items-center justify-center text-gold shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{invite.trip_name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {invite.invited_by_username
                  ? t('share.invitedByAs', { username: invite.invited_by_username, role: t(`share.role.${invite.role}`) })
                  : t('share.invitedAs', { role: t(`share.role.${invite.role}`) })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRespond(invite, false)}
                disabled={respondingId === invite.participant_id}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50"
                title={t('share.decline')}
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleRespond(invite, true)}
                disabled={respondingId === invite.participant_id}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-success hover:bg-emerald-600 transition-colors cursor-pointer disabled:opacity-50"
                title={t('share.accept')}
              >
                {respondingId === invite.participant_id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
