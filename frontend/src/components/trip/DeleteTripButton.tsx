import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { deleteTrip } from '@/lib/api';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import type { Trip } from '@/lib/types';

interface DeleteTripButtonProps {
  trip: Pick<Trip, 'id' | 'name' | 'cover_image_url'>;
  onDeleted: () => void;
}

/** "Elimina viaggio" con modale di conferma: avviso di irreversibilità e nome del
 * viaggio da riscrivere. Usato dai moduli di modifica (viaggio completo e ricordo). */
export const DeleteTripButton: React.FC<DeleteTripButtonProps> = ({ trip, onDeleted }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canDelete = confirmText.trim() === trip.name.trim();

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteTrip(trip);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : t('common.error'));
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setConfirmText('');
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 px-[16px] py-2.5 rounded-xl text-sm font-bold text-error hover:bg-error/10 transition-colors cursor-pointer"
      >
        <Trash2 className={`${MODAL_ICON_SIZE} shrink-0`} />
        {t('trip.delete.button')}
      </button>

      <Modal open={open} onClose={() => !deleting && setOpen(false)} title={t('trip.delete.title')} maxWidth="max-w-md">
        <div className="space-y-5">
          <div className="flex items-start gap-3 px-[18px] py-[14px] rounded-xl bg-error/10 border border-error/30">
            <AlertTriangle className="w-6 h-6 text-error shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-error">{t('trip.delete.irreversible')}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{t('trip.delete.body', { name: trip.name })}</p>
            </div>
          </div>
          <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-5 space-y-1">
            {(['plan', 'expenses', 'people', 'files'] as const).map((k) => (
              <li key={k}>{t(`trip.delete.what.${k}`)}</li>
            ))}
          </ul>
          <Input
            label={t('trip.delete.typeName', { name: trip.name })}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={trip.name}
            autoComplete="off"
          />
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="tertiary" onClick={() => setOpen(false)} disabled={deleting}>
              {t('common.cancel')}
            </Button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={!canDelete || deleting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-error hover:bg-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              {t('trip.delete.confirm')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
