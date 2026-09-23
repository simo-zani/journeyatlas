import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { ConfirmIconButton } from '@/components/ConfirmIconButton';

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => {
  const { t } = useTranslation();
  return <ConfirmIconButton icon={Trash2} label={t('common.delete')} tone="danger" onConfirm={onDelete} />;
};
