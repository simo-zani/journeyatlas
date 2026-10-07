import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { fetchInviteCompanions, fetchPendingInvitesForMe, respondToInvite } from '@/lib/api';
import type { InviteCompanion, PendingInvite } from '@/lib/types';

interface PendingInvitesProps {
  onAccepted: () => void;
}

export const PendingInvites: React.FC<PendingInvitesProps> = ({ onAccepted }) => {
  const { t, i18n } = useTranslation();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  // Invito in fase di accettazione: l'utente sceglie a quale compagno di viaggio collegarsi.
  const [choosingId, setChoosingId] = useState<string | null>(null);
  const [companions, setCompanions] = useState<InviteCompanion[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetchPendingInvitesForMe()
      .then(setInvites)
      .catch(() => setInvites([]))
      .finally(() => setLoading(false));
  }, []);

  // Accettando: se il viaggio ha compagni non ancora collegati, prima si sceglie chi si è.
  const startAccept = async (invite: PendingInvite) => {
    setRespondingId(invite.participant_id);
    try {
      const free = await fetchInviteCompanions(invite.participant_id).catch(() => []);
      if (free.length === 0) {
        await handleRespond(invite, true);
        return;
      }
      setCompanions(free);
      setSelectedCompanion(undefined);
      setChoosingId(invite.participant_id);
    } finally {
      setRespondingId(null);
    }
  };

  const handleRespond = async (invite: PendingInvite, accept: boolean, companionId?: string | null) => {
    setRespondingId(invite.participant_id);
    try {
      await respondToInvite(invite.participant_id, accept, companionId);
      setChoosingId(null);
      setInvites((prev) => prev.filter((i) => i.participant_id !== invite.participant_id));
      if (accept) onAccepted();
    } finally {
      setRespondingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  const formatRange = (start: string | null, end: string | null) =>
    start ? (end && end !== start ? `${formatDate(start)} – ${formatDate(end)}` : formatDate(start)) : null;

  const choosingInvite = invites.find((i) => i.participant_id === choosingId) ?? null;

  if (loading || invites.length === 0) return null;

  return (
    <section className="mt-6 mb-8">
      <h2 className="font-poppins font-semibold text-xl mb-4">{t('share.pendingInvitesTitle')}</h2>
      <div className="space-y-3">
        {invites.map((invite) => (
          <Card key={invite.participant_id} compact className="flex flex-wrap items-center gap-4">
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
              <p className="font-semibold truncate">
                {invite.trip_name}
                {formatRange(invite.trip_start_date, invite.trip_end_date) && (
                  <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                    {formatRange(invite.trip_start_date, invite.trip_end_date)}
                  </span>
                )}
              </p>
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
                className="h-10 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50"
                title={t('share.decline')}
              >
                <X className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">{t('share.decline')}</span>
              </button>
              <button
                type="button"
                onClick={() => void startAccept(invite)}
                disabled={respondingId === invite.participant_id}
                className="h-10 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-success hover:bg-emerald-600 transition-colors cursor-pointer disabled:opacity-50"
                title={t('share.accept')}
              >
                {respondingId === invite.participant_id ? (
                  <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 shrink-0" />
                )}
                <span className="hidden sm:inline">{t('share.accept')}</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={choosingInvite !== null}
        onClose={() => setChoosingId(null)}
        title={t('share.pickWhoTitle')}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="space-y-2.5">
            {companions.map((c) => {
              const active = selectedCompanion === c.participant_id;
              return (
                <button
                  key={c.participant_id}
                  type="button"
                  onClick={() => setSelectedCompanion(c.participant_id)}
                  className={`w-full flex items-center gap-3 text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-gold/15 text-gold ring-2 ring-gold/50'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-white/10 hover:ring-gold/40'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full shrink-0 border-2 flex items-center justify-center ${
                      active ? 'border-gold' : 'border-slate-400/60'
                    }`}
                  >
                    {active && <span className="w-2.5 h-2.5 rounded-full bg-gold" />}
                  </span>
                  {c.display_name}
                </button>
              );
            })}

          {/* Non in elenco: opzione separata, entra come persona in più */}
          <button
            type="button"
            onClick={() => setSelectedCompanion(null)}
            className={`w-full flex items-center gap-3 text-left px-5 py-3.5 rounded-xl text-sm font-semibold border-2 border-dashed transition-all cursor-pointer ${
              selectedCompanion === null
                ? 'border-gold/70 bg-gold/10 text-gold'
                : 'border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-400 hover:border-gold/50 hover:text-gold'
            }`}
          >
            <Plus className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            {t('share.pickNone')}
          </button>
          </div>

          <div className="pt-1">
            <button
              type="button"
              disabled={!choosingInvite || respondingId === choosingInvite.participant_id || selectedCompanion === undefined}
              onClick={() => choosingInvite && void handleRespond(choosingInvite, true, selectedCompanion ?? null)}
              className="w-full px-6 py-3 rounded-xl text-sm font-bold text-white bg-success hover:bg-emerald-600 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {choosingInvite && respondingId === choosingInvite.participant_id && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {t('share.confirmAccept')}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
