import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TripParticipantDetail } from '@/lib/types';

interface TripParticipantAvatarsProps {
  participants: TripParticipantDetail[];
  currentUserId: string;
}

/** Avatar di tutti i partecipanti (proprietario e te stesso inclusi, così ognuno
 * vede sempre tutti); al passaggio del mouse (desktop) l'avatar si ingrandisce
 * e mostra l'username. */
export const TripParticipantAvatars: React.FC<TripParticipantAvatarsProps> = ({
  participants,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const others = participants
    .filter((p) => p.status === 'accepted')
    .sort((a, b) => Number(b.role === 'owner') - Number(a.role === 'owner'));
  if (others.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5">
      {others.map((p) => (
        <div
          key={p.participant_id}
          className={`group relative hover:z-10 ${p.user_id && p.user_id !== currentUserId ? 'cursor-pointer' : 'cursor-default'}`}
          // Profilo del viaggiatore: solo per chi ha un account e non sei tu.
          onClick={p.user_id && p.user_id !== currentUserId ? () => navigate(`/travelers/${p.user_id}`, { state: { backTo: pathname } }) : undefined}
        >
          {p.user_id && p.avatar_url ? (
            <img
              src={p.avatar_url}
              alt=""
              className="w-7 h-7 rounded-full object-cover ring-2 ring-[var(--surface-0)] transition-transform duration-150 group-hover:scale-125 "
            />
          ) : (
            // Compagni senza account (user_id nullo): iniziale del nome, tono più spento.
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-[var(--surface-0)] transition-transform duration-150 group-hover:scale-125  ${
                p.user_id ? 'bg-gold/20 text-gold' : 'bg-slate-500/25 text-slate-300'
              }`}
            >
              {(p.username ?? p.display_name ?? '?').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 mt-1.5 whitespace-nowrap rounded-md bg-slate-900 text-white text-[11px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
            {p.user_id ? `@${p.username}` : p.display_name}
            {p.user_id === currentUserId && ` (${t('share.you')})`}
          </span>
        </div>
      ))}
    </div>
  );
};
