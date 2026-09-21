import React from 'react';
import type { TripParticipantDetail } from '@/lib/types';

interface TripParticipantAvatarsProps {
  participants: TripParticipantDetail[];
  currentUserId: string;
}

/** Avatar sovrapposti dei partecipanti (esclude te stesso); al passaggio
 * del mouse (desktop) l'avatar si ingrandisce e mostra l'username. */
export const TripParticipantAvatars: React.FC<TripParticipantAvatarsProps> = ({
  participants,
  currentUserId,
}) => {
  const others = participants.filter((p) => p.status === 'accepted' && p.user_id !== currentUserId);
  if (others.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {others.map((p) => (
        <div key={p.participant_id} className="group relative hover:z-10">
          {p.avatar_url ? (
            <img
              src={p.avatar_url}
              alt=""
              className="w-7 h-7 rounded-full object-cover ring-2 ring-[var(--surface-0)] transition-transform duration-150 group-hover:scale-125 cursor-default"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold ring-2 ring-[var(--surface-0)] transition-transform duration-150 group-hover:scale-125 cursor-default">
              {(p.username ?? '?').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 mt-1.5 whitespace-nowrap rounded-md bg-slate-900 text-white text-[11px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
            @{p.username}
          </span>
        </div>
      ))}
    </div>
  );
};
