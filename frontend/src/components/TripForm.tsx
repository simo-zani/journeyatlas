import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { DestinationPicker } from '@/components/DestinationPicker';
import { useAuth } from '@/auth/AuthContext';
import { createTrip, updateTrip } from '@/lib/api';
import type { Destination, Trip } from '@/lib/types';

interface TripFormProps {
  onSuccess: (trip: Trip) => void;
  initial?: Trip | null;
}

const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900 || year > 2100) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const TripForm: React.FC<TripFormProps> = ({ onSuccess, initial }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [name, setName] = useState(initial?.name ?? '');
  const [startDate, setStartDate] = useState(initial?.start_date ?? '');
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [destinations, setDestinations] = useState<Destination[]>(initial?.destinations ?? []);
  const [budget, setBudget] = useState(
    initial?.budget_planned != null ? String(initial.budget_planned) : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    name.trim().length > 0 && isValidIsoDate(startDate) && (!endDate || (isValidIsoDate(endDate) && endDate >= startDate)) && (budget === '' || Number(budget) >= 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSubmitting(true);

    const input = {
      name,
      start_date: startDate || null,
      end_date: endDate || null,
      destinations,
      budget_planned: budget === '' ? null : Number(budget),
    };

    try {
      const trip = initial
        ? await updateTrip(initial.id, input)
        : await createTrip(user.id, input);
      onSuccess(trip);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : t('common.error');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Input
        label={t('trip.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder={t('trip.namePlaceholder')}
      />

      <Input
        label={t('trip.startDate')}
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />

      <Input
        label={t('trip.endDate')}
        type="date"
        value={endDate}
        min={isValidIsoDate(startDate) ? startDate : undefined}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <DestinationPicker value={destinations} onChange={setDestinations} />

      <Input
        label={t('trip.budget')}
        type="number"
        min="0"
        step="0.01"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder={t('trip.budgetPlaceholder')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};