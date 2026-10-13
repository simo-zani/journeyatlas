import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export interface TripRef {
  id: string;
  name: string;
  /** Viaggio-ricordo: non ha il gestionale, quindi niente link. */
  isMemory?: boolean;
}

/**
 * Viaggi che hanno sbloccato una regione, accanto al suo nome nell'elenco:
 * sempre "N volte" (anche "1 volta"), e passandoci sopra (o toccandolo, su
 * smartphone) si apre l'elenco dei viaggi. Il riquadro è in un portale
 * con posizione fissa: dentro l'elenco scorrevole verrebbe tagliato.
 */
export const TripsBadge: React.FC<{ trips: TripRef[] }> = ({ trips }) => {
  const { t } = useTranslation();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  const open = () => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
  };
  const close = () => setPos(null);

  // Chiusura toccando fuori (smartphone) o scorrendo: il riquadro è fisso e non seguirebbe la riga.
  useEffect(() => {
    if (!pos) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!anchorRef.current?.contains(target) && !popRef.current?.contains(target)) close();
    };
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', close, true);
    };
  }, [pos]);

  if (trips.length === 0) return null;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onMouseEnter={open}
        onMouseLeave={(e) => {
          // si resta aperti se il puntatore passa sul riquadro
          if (!popRef.current?.contains(e.relatedTarget as Node)) close();
        }}
        onClick={() => (pos ? close() : open())}
        aria-expanded={!!pos}
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark dark:text-gold-light ring-1 ring-gold/30 hover:bg-gold/25 cursor-pointer shrink-0"
      >
        {t('atlas.regions.timesVisited', { count: trips.length })}
      </button>
      {pos &&
        createPortal(
          <div
            ref={popRef}
            onMouseLeave={close}
            className="fixed z-[60] min-w-[200px] max-w-[280px] rounded-xl bg-slate-900/95 text-white shadow-xl ring-1 ring-white/10 p-1.5"
            style={{ top: pos.top, right: pos.right }}
          >
            <ul className="space-y-0.5">
              {trips.map((trip) => (
                <li key={trip.id}>
                  {trip.isMemory ? (
                    <span className="block truncate rounded-lg px-3 py-2 text-xs font-semibold text-white/80">{trip.name}</span>
                  ) : (
                    <Link
                      to={`/trips/${trip.id}`}
                      className="block truncate rounded-lg px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 no-underline hover:no-underline"
                    >
                      {trip.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
};
