import React from 'react';
import type { TripParticipantDetail } from '@/lib/types';

const SIZES = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
} as const;

/** Avatar come in TripParticipantAvatars: foto per chi ce l'ha, altrimenti
 * l'iniziale (più spenta per i compagni senza account). */
export const ParticipantAvatar: React.FC<{ participant: TripParticipantDetail | undefined; size?: keyof typeof SIZES }> = ({
  participant: p,
  size = 'sm',
}) =>
  p?.user_id && p.avatar_url ? (
    <img src={p.avatar_url} alt="" className={`${SIZES[size]} rounded-full object-cover shrink-0`} />
  ) : (
    <div
      className={`${SIZES[size]} rounded-full flex items-center justify-center font-bold shrink-0 ${
        p?.user_id ? 'bg-gold/20 text-gold' : 'bg-slate-500/25 text-slate-500 dark:text-slate-300'
      }`}
      aria-hidden="true"
    >
      {(p?.username ?? p?.display_name ?? '?').charAt(0).toUpperCase()}
    </div>
  );
