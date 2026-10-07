import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Search, Send, Trash2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Alert } from '@/components/Alert';
import {
  fetchFriends,
  fetchTripParticipants,
  inviteParticipant,
  removeParticipant,
  updateParticipantRole,
} from '@/lib/api';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { Role, TravelerSearchResult, TripParticipantDetail } from '@/lib/types';

interface ShareTripModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  currentUserId: string;
  isOwner: boolean;
}

const ParticipantAvatar: React.FC<{ avatarUrl: string | null; username: string | null }> = ({
  avatarUrl,
  username,
}) =>
  avatarUrl ? (
    <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold shrink-0">
      {(username ?? '?').charAt(0).toUpperCase()}
    </div>
  );

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  open,
  onClose,
  tripId,
  currentUserId,
  isOwner,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [participants, setParticipants] = useState<TripParticipantDetail[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);

  const [friends, setFriends] = useState<TravelerSearchResult[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const [query, setQuery] = useState('');
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Partecipante di cui si sta chiedendo la conferma di rimozione.
  const [removing, setRemoving] = useState<TripParticipantDetail | null>(null);
  const [busyParticipantId, setBusyParticipantId] = useState<string | null>(null);

  const loadParticipants = useCallback(async () => {
    setLoadingParticipants(true);
    setParticipantsError(null);
    try {
      const data = await fetchTripParticipants(tripId);
      setParticipants(data);
    } catch (err) {
      setParticipantsError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoadingParticipants(false);
    }
  }, [tripId, t]);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const data = await fetchFriends();
      setFriends(data);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoadingFriends(false);
    }
  }, [t]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setInviteError(null);
    void loadParticipants();
    if (isOwner) void loadFriends();
  }, [open, isOwner, loadParticipants, loadFriends]);

  const q = query.trim().toLowerCase();

  const filteredParticipants = useMemo(
    () => (q ? participants.filter((p) => `${p.username ?? ''} ${p.display_name ?? ''}`.toLowerCase().includes(q)) : participants),
    [participants, q]
  );

  // Elenco diviso in gruppi, così non si confondono chi è già nel viaggio,
  // chi è stato solo invitato e i compagni che non hanno un account.
  const sections = useMemo(
    () => [
      {
        key: 'joined',
        items: filteredParticipants.filter((p) => p.user_id !== null && p.status === 'accepted'),
      },
      { key: 'companions', items: filteredParticipants.filter((p) => p.user_id === null) },
      {
        key: 'invited',
        items: filteredParticipants.filter((p) => p.user_id !== null && p.status !== 'accepted'),
      },
    ],
    [filteredParticipants]
  );

  const openProfile = (userId: string) => {
    onClose();
    navigate(`/travelers/${userId}`, { state: { backTo: pathname } });
  };

  // Amici non ancora coinvolti nel viaggio (in nessuno stato) — quelli
  // sopra sono già "già aggiunti" e compaiono nella lista partecipanti.
  const invitableFriends = useMemo(() => {
    const involvedIds = new Set(participants.flatMap((p) => (p.user_id ? [p.user_id] : [])));
    const notInvolved = friends.filter((f) => !involvedIds.has(f.id));
    return q ? notInvolved.filter((f) => f.username.toLowerCase().includes(q)) : notInvolved;
  }, [friends, participants, q]);

  const handleInvite = async (target: TravelerSearchResult) => {
    setInvitingId(target.id);
    setInviteError(null);
    try {
      await inviteParticipant(tripId, target.id, 'viewer', currentUserId);
      await loadParticipants();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setInvitingId(null);
    }
  };

  const handleRoleChange = async (participantId: string, role: Role) => {
    setBusyParticipantId(participantId);
    try {
      await updateParticipantRole(participantId, role);
      setParticipants((prev) => prev.map((p) => (p.participant_id === participantId ? { ...p, role } : p)));
    } catch (err) {
      setParticipantsError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusyParticipantId(null);
    }
  };

  const handleRemove = async (participantId: string) => {
    setBusyParticipantId(participantId);
    try {
      await removeParticipant(participantId);
      setParticipants((prev) => prev.filter((p) => p.participant_id !== participantId));
    } catch (err) {
      setParticipantsError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusyParticipantId(null);
    }
  };

  const removingName = removing ? (removing.user_id ? `@${removing.username ?? '—'}` : (removing.display_name ?? '—')) : '';

  return (
    <>
    <Modal open={open} onClose={onClose} title={t('share.title')} maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="input-field flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('share.searchFriendsPlaceholder')}
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
          />
          {(loadingParticipants || loadingFriends) && (
            <Loader2 className="w-5 h-5 text-gold animate-spin shrink-0" />
          )}
        </div>

        {(participantsError || inviteError) && (
          <Alert
            type="error"
            message={participantsError ?? inviteError ?? ''}
            onClose={() => {
              setParticipantsError(null);
              setInviteError(null);
            }}
          />
        )}

        {/* Già nel viaggio — in cima all'elenco */}
        {sections.map(
          (section) =>
            section.items.length > 0 && (
        <div key={section.key} className="space-y-1.5">
          {section.key !== 'joined' && (
            <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {t(`share.section.${section.key}`)}
            </p>
          )}
          {section.items.map((p) => {
            const isSelf = p.user_id === currentUserId;
            const isRowOwner = p.role === 'owner';
            const busy = busyParticipantId === p.participant_id;
            const isUnlinked = p.user_id === null;
            const profileId = p.user_id && !isSelf ? p.user_id : null;

            return (
              <div
                key={p.participant_id}
                className="flex items-center gap-2.5 py-2 pl-2 pr-5 rounded-xl bg-slate-900/[0.03] dark:bg-white/[0.03]"
              >
                <div
                  className={`flex items-center gap-2.5 flex-1 min-w-0 ${profileId ? 'cursor-pointer' : ''}`}
                  onClick={profileId ? () => openProfile(profileId) : undefined}
                  role={profileId ? 'link' : undefined}
                >
                <ParticipantAvatar avatarUrl={p.avatar_url} username={p.username ?? p.display_name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {isUnlinked ? (p.display_name ?? '—') : `@${p.username ?? '—'}`}{' '}
                    {isSelf && <span className="text-slate-400">({t('share.you')})</span>}
                  </p>
                  {isUnlinked && !isRowOwner && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                      {t('share.unlinked')}
                    </p>
                  )}
                  {!isUnlinked && p.display_name && p.status === 'accepted' && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {t('share.linkedAs', { name: p.display_name })}
                    </p>
                  )}
                  {p.status === 'pending' && (
                    <p className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold">
                      {t('share.status.pending')}
                    </p>
                  )}
                  {p.status === 'declined' && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 font-semibold">
                      {t('share.status.declined')}
                    </p>
                  )}
                </div>
                </div>

                {isOwner && !isRowOwner && isUnlinked ? (
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setRemoving(p)}
                      disabled={busy}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50"
                      title={t('common.remove')}
                    >
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : isOwner && !isRowOwner ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={p.role}
                      disabled={busy}
                      onChange={(e) => handleRoleChange(p.participant_id, e.target.value as Role)}
                      className="text-xs font-semibold bg-transparent border border-slate-200 dark:border-white/10 rounded-lg py-1 px-1.5 outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="editor">{t('share.role.editor')}</option>
                      <option value="viewer">{t('share.role.viewer')}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setRemoving(p)}
                      disabled={busy}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50"
                      title={t('common.remove')}
                    >
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    {isUnlinked && !isRowOwner ? '' : t(`share.role.${p.role}`)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
            )
        )}

        {/* Amici invitabili — non ancora coinvolti nel viaggio */}
        {isOwner && (
          <div className="space-y-1.5">
            {invitableFriends.length > 0 && (
              <p className="px-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {t('share.section.invite')}
              </p>
            )}
            {invitableFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-2.5 py-2 pl-2 pr-5 rounded-xl bg-slate-900/[0.03] dark:bg-white/[0.03]"
              >
                <ParticipantAvatar avatarUrl={friend.avatar_url} username={friend.username} />
                <span className="text-sm font-medium flex-1 truncate">@{friend.username}</span>
                <button
                  type="button"
                  onClick={() => handleInvite(friend)}
                  disabled={invitingId === friend.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-gold hover:bg-gold/10 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {invitingId === friend.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className={MODAL_ICON_SIZE} />
                  )}
                  {t('share.invite')}
                </button>
              </div>
            ))}

            {!loadingFriends && invitableFriends.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 px-1">
                {friends.length === 0 ? t('share.noFriends') : q ? t('share.noFriendsFound') : null}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>

    <Modal
      open={removing !== null}
      onClose={() => setRemoving(null)}
      title={t('share.removeTitle')}
      maxWidth="max-w-sm"
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {removing?.user_id
            ? t('share.removeBodyAccount', { name: removingName })
            : t('share.removeBodyCompanion', { name: removingName })}
        </p>
        <button
          type="button"
          onClick={async () => {
            if (!removing) return;
            await handleRemove(removing.participant_id);
            setRemoving(null);
          }}
          disabled={removing !== null && busyParticipantId === removing.participant_id}
          className="w-full px-6 py-3 rounded-xl text-sm font-bold text-white bg-error hover:bg-red-600 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {removing !== null && busyParticipantId === removing.participant_id && (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
          {t('share.removeConfirm')}
        </button>
      </div>
    </Modal>
    </>
  );
};
