import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, type LucideIcon } from 'lucide-react';

interface ConfirmIconButtonProps {
  icon: LucideIcon;
  label: string;
  tone: 'danger' | 'success';
  onConfirm: () => Promise<void>;
}

const TONE_IDLE: Record<ConfirmIconButtonProps['tone'], string> = {
  danger: 'hover:text-error hover:bg-error/10',
  success: 'hover:text-success hover:bg-success/10',
};

const TONE_CONFIRM: Record<ConfirmIconButtonProps['tone'], string> = {
  danger: 'bg-error hover:bg-red-600',
  success: 'bg-success hover:bg-emerald-600',
};

/** Icon button that, on click, swaps itself for an inline Confirm/Cancel
 * pair instead of acting immediately — same two-step pattern for every
 * destructive-or-final action in the app (delete, mark completed, ...), so
 * callers just supply the icon, tone and the async action to run. */
export const ConfirmIconButton: React.FC<ConfirmIconButtonProps> = ({ icon: Icon, label, tone, onConfirm }) => {
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

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div ref={ref} className="flex items-center gap-2">
        <button
          onClick={handleConfirm}
          disabled={busy}
          className={`px-3 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 transition-colors ${TONE_CONFIRM[tone]}`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.confirm')}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={`p-2.5 rounded-xl text-slate-400 transition-colors ${TONE_IDLE[tone]}`}
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};
