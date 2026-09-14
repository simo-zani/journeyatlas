import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setConfirming(false);
      }
    };
    if (confirming) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [confirming]);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div ref={ref} className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={busy}
          className="px-3 py-2 rounded-lg bg-error text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.confirm')}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2.5 rounded-lg text-slate-400 hover:text-error hover:bg-error/10 transition-colors"
      aria-label={t('common.delete')}
      title={t('common.delete')}
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
};