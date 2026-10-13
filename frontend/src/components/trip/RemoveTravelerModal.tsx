import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { participantHasExpenses } from '@/lib/api';

export interface TravelerToRemove {
  /** Id della riga trip_participants; assente per un compagno appena aggiunto e non ancora salvato. */
  participantId?: string;
  name: string;
  hasAccount: boolean;
}

interface RemoveTravelerModalProps {
  traveler: TravelerToRemove | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  /** Testo del corpo, se diverso da quello standard (es. la rimozione avviene al salvataggio). */
  body?: string;
}

/** Conferma di rimozione di un viaggiatore. Prima controlla se compare in
 * qualche spesa: in quel caso la rimozione è bloccata (i saldi degli altri
 * cambierebbero) e la modale lo spiega invece di chiedere conferma. */
export const RemoveTravelerModal: React.FC<RemoveTravelerModalProps> = ({ traveler, onClose, onConfirm, body }) => {
  const { t } = useTranslation();
  const [hasExpenses, setHasExpenses] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dipende dall'id, non dall'oggetto: i chiamanti lo ricreano a ogni render.
  const participantId = traveler?.participantId ?? null;
  const isOpen = traveler !== null;
  useEffect(() => {
    setError(null);
    setBusy(false);
    if (!isOpen) return;
    if (!participantId) {
      setHasExpenses(false);
      return;
    }
    let cancelled = false;
    setHasExpenses(null);
    participantHasExpenses(participantId)
      .then((v) => !cancelled && setHasExpenses(v))
      // se il controllo fallisce si chiede comunque conferma: il DB blocca lo stesso
      .catch(() => !cancelled && setHasExpenses(false));
    return () => {
      cancelled = true;
    };
  }, [participantId, isOpen]);

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setBusy(false);
    }
  };

  return (
    <Modal
      open={traveler !== null}
      onClose={onClose}
      title={hasExpenses ? t('share.removeBlockedTitle') : t('share.removeTitle')}
      maxWidth="max-w-sm"
    >
      {hasExpenses === null ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : hasExpenses ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-warning/10 border border-warning/30">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-200">
              {t('share.removeBlockedBody', { name: traveler?.name })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl text-sm font-bold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 cursor-pointer"
          >
            {t('share.removeBlockedOk')}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {body ??
              (traveler?.hasAccount
                ? t('share.removeBodyAccount', { name: traveler?.name })
                : t('share.removeBodyCompanion', { name: traveler?.name }))}
          </p>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={busy}
            className="w-full px-6 py-3 rounded-xl text-sm font-bold text-white bg-error hover:bg-red-600 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-5 h-5 animate-spin" />}
            {t('share.removeConfirm')}
          </button>
        </div>
      )}
    </Modal>
  );
};
