import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Plus, Search, Users, X } from 'lucide-react';
import { RemoveTravelerModal } from '@/components/trip/RemoveTravelerModal';
import { ShareTripModal } from '@/components/trip/ShareTripModal';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { CompanionDraft } from '@/lib/api';
import type { CompanionsState } from '@/lib/useCompanions';

interface CompanionsSectionProps {
  state: CompanionsState;
  currentUserId: string;
  /** Proprietario del viaggio (per la finestra "Gestisci partecipanti"). */
  isOwner: boolean;
}

/**
 * "Compagni di viaggio" nei moduli: chi è già coinvolto, amici da invitare
 * (ricerca per username, ordinati per viaggi fatti insieme) e compagni senza
 * account. Uguale nel viaggio completo e in quello rapido.
 */
export const CompanionsSection: React.FC<CompanionsSectionProps> = ({ state, currentUserId, isOwner }) => {
  const { t, i18n } = useTranslation();
  const { tripId, friends, sharedTrips, participants, inviteIds, setInviteIds, companions, setCompanions } = state;
  const [friendQuery, setFriendQuery] = useState('');
  const [removingCompanion, setRemovingCompanion] = useState<CompanionDraft | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Amici già coinvolti (invitati o partecipanti) non si propongono di nuovo.
  const involvedIds = new Set(participants.map((p) => p.user_id).filter(Boolean));
  const invitableFriends = friends.filter((f) => !involvedIds.has(f.id));
  // Ricerca per username (quelli già scelti restano visibili); ordine: più viaggi fatti
  // insieme prima, poi alfabetico. Ordine stabile: selezionare non sposta nessuno.
  const shownFriends = invitableFriends
    .filter((f) => inviteIds.includes(f.id) || f.username.toLowerCase().includes(friendQuery.trim().toLowerCase().replace(/^@/, '')))
    .sort(
      (a, b) =>
        (sharedTrips.get(b.id) ?? 0) - (sharedTrips.get(a.id) ?? 0) ||
        a.username.localeCompare(b.username, i18n.language, { sensitivity: 'base' })
    );
  const involvedPeople = participants.filter((p) => p.user_id && p.role !== 'owner' && p.status !== 'declined');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="label !flex items-center gap-2 !m-0">
          <Users className={`${MODAL_ICON_SIZE} shrink-0`} />
          {t('memory.companions')}
        </label>
        {tripId && (
          <button type="button" onClick={() => setShareOpen(true)} className="text-xs font-bold text-light-blue hover:underline cursor-pointer">
            {t('memory.manageParticipants')}
          </button>
        )}
      </div>

      {involvedPeople.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {involvedPeople.map((p) => (
            <li
              key={p.participant_id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-sm font-semibold"
            >
              @{p.username}
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {p.status === 'pending' ? t('share.status.pending') : t('memory.joined')}
              </span>
            </li>
          ))}
        </ul>
      )}

      {invitableFriends.length > 0 ? (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t('memory.inviteFriends')}</p>
          <div className="relative mb-2">
            <Search className="w-[16px] h-[16px] absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={friendQuery}
              onChange={(e) => setFriendQuery(e.target.value)}
              placeholder={t('memory.searchFriends')}
              className="input-field !py-1.5 !pl-9 !pr-3 !text-sm !rounded-lg"
            />
          </div>
          {/* Una sola riga che scorre in orizzontale */}
          <ul className="flex flex-nowrap gap-2 overflow-x-auto pb-1.5 -mb-1.5">
            {shownFriends.length === 0 && (
              <li className="text-xs text-slate-500 dark:text-slate-400 py-1">{t('memory.noFriendsFound')}</li>
            )}
            {shownFriends.map((f) => {
              const on = inviteIds.includes(f.id);
              return (
                <li key={f.id} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setInviteIds((prev) => (on ? prev.filter((id) => id !== f.id) : [...prev, f.id]))}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      on ? 'bg-gold text-slate-950' : 'bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15'
                    }`}
                  >
                    {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}@{f.username}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        friends.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400">{t('memory.noFriends')}</p>
      )}

      {/* Compagni senza account */}
      {companions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {companions.map((c, index) => (
            <div key={c.id ?? `new-${index}`} className="relative">
              <input
                value={c.name}
                onChange={(e) => setCompanions((prev) => prev.map((x, i) => (i === index ? { ...x, name: e.target.value } : x)))}
                placeholder={t('trip.companionsNamePlaceholder')}
                maxLength={40}
                className="input-field !py-1.5 !pl-3 !pr-9 !text-sm !rounded-lg w-full"
              />
              {/* X dentro al campo */}
              <button
                type="button"
                onClick={() => (c.id ? setRemovingCompanion(c) : setCompanions((prev) => prev.filter((_, i) => i !== index)))}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                title={t('common.remove')}
                aria-label={t('common.remove')}
              >
                <X className="w-[16px] h-[16px]" strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setCompanions((prev) => [...prev, { name: '' }])}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gold hover:bg-gold/10 transition-colors cursor-pointer"
      >
        <Plus className={`${MODAL_ICON_SIZE} shrink-0`} strokeWidth={2.5} />
        {t('memory.addCompanion')}
      </button>

      <RemoveTravelerModal
        traveler={removingCompanion ? { participantId: removingCompanion.id, name: removingCompanion.name || '—', hasAccount: false } : null}
        body={t('trip.companionsRemoveBody', { name: removingCompanion?.name || '—' })}
        onClose={() => setRemovingCompanion(null)}
        onConfirm={async () => {
          const id = removingCompanion?.id;
          setCompanions((prev) => prev.filter((c) => c.id !== id));
        }}
      />

      {tripId && (
        <ShareTripModal
          open={shareOpen}
          onClose={() => {
            setShareOpen(false);
            void state.reloadParticipants().catch(() => undefined);
          }}
          tripId={tripId}
          currentUserId={currentUserId}
          isOwner={isOwner}
        />
      )}
    </div>
  );
};
