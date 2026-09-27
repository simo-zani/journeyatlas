import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  /**
   * Impila in verticale il blocco di conferma. Serve quando il pulsante sta in
   * una colonna di azioni: affiancato, "Conferma/Annulla" non ci starebbe.
   */
  stacked?: boolean;
  /**
   * Notifica l'entrata/uscita dallo stato di conferma, così il chiamante
   * nasconde gli altri pulsanti della stessa riga (la conferma va letta da
   * sola, senza azioni concorrenti a portata di clic).
   */
  onConfirmingChange?: (confirming: boolean) => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  stacked = false,
  onConfirmingChange,
}) => {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const changeConfirming = (next: boolean) => {
    setConfirming(next);
    onConfirmingChange?.(next);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        changeConfirming(false);
      }
    };
    if (confirming) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirming]);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete();
    } finally {
      setBusy(false);
      changeConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div
        ref={ref}
        className={stacked ? 'flex flex-col gap-1' : 'flex items-center gap-2'}
      >
        <button
          onClick={handleDelete}
          disabled={busy}
          className={`px-3 py-2 rounded-xl bg-error text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors ${
            stacked ? 'w-full justify-center' : ''
          }`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.confirm')}
        </button>
        <button
          onClick={() => changeConfirming(false)}
          className={`px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ${
            stacked ? 'w-full justify-center' : ''
          }`}
        >
          {t('common.cancel')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => changeConfirming(true)}
      className="p-2.5 rounded-xl text-slate-400 hover:text-error hover:bg-error/10 transition-colors"
      aria-label={t('common.delete')}
      title={t('common.delete')}
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
};