import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { ConfirmIconButton } from '@/components/ConfirmIconButton';

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
  return (
    <ConfirmIconButton
      icon={Trash2}
      label={t('common.delete')}
      tone="danger"
      onConfirm={onDelete}
      stacked={stacked}
      onConfirmingChange={onConfirmingChange}
    />
  );
};
