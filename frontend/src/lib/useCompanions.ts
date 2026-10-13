import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchFriends,
  fetchSharedTripCounts,
  fetchTripParticipants,
  inviteParticipant,
  syncCompanions,
  type CompanionDraft,
} from '@/lib/api';
import type { TravelerSearchResult, TripParticipantDetail } from '@/lib/types';

/**
 * Stato della sezione "Compagni di viaggio" dei moduli (viaggio completo e
 * rapido): amici da invitare, persone già coinvolte, compagni senza account.
 * `persist` va chiamato dopo aver creato/aggiornato il viaggio.
 */
export const useCompanions = (tripId: string | null, userId: string | null) => {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<TravelerSearchResult[]>([]);
  // Viaggi fatti insieme a ciascun amico: ordinano i suggerimenti.
  const [sharedTrips, setSharedTrips] = useState<Map<string, number>>(new Map());
  const [participants, setParticipants] = useState<TripParticipantDetail[]>([]);
  const [inviteIds, setInviteIds] = useState<string[]>([]);
  const [companions, setCompanions] = useState<CompanionDraft[]>([]);
  const [savedCompanions, setSavedCompanions] = useState<CompanionDraft[]>([]);

  const reloadParticipants = useCallback(async () => {
    if (!tripId) return;
    const rows = await fetchTripParticipants(tripId);
    setParticipants(rows);
    const unlinked = rows
      .filter((r) => r.user_id === null && r.role !== 'owner')
      .map((r) => ({ id: r.participant_id, name: r.display_name ?? '' }));
    setSavedCompanions(unlinked);
    setCompanions(unlinked);
  }, [tripId]);

  useEffect(() => {
    void fetchFriends().then(setFriends).catch(() => setFriends([]));
    if (userId) void fetchSharedTripCounts(userId).then(setSharedTrips).catch(() => undefined);
    void reloadParticipants().catch(() => undefined);
  }, [userId, reloadParticipants]);

  /** Salva compagni senza account e manda gli inviti agli amici scelti. */
  const persist = async (savedTripId: string) => {
    if (!userId) return;
    // Nome vuoto → "Persona N", così ogni segnaposto è riconoscibile da chi deve sceglierlo.
    const desired = companions.map((c, i) => ({ ...c, name: c.name.trim() || t('trip.companionsDefaultName', { n: i + 1 }) }));
    await syncCompanions(savedTripId, savedCompanions, desired);
    for (const friendId of inviteIds) {
      await inviteParticipant(savedTripId, friendId, 'viewer', userId);
    }
  };

  return {
    tripId,
    friends,
    sharedTrips,
    participants,
    inviteIds,
    setInviteIds,
    companions,
    setCompanions,
    reloadParticipants,
    persist,
  };
};

export type CompanionsState = ReturnType<typeof useCompanions>;
