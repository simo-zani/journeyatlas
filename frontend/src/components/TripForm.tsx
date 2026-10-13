import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Lock, LockOpen } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { CompanionsSection } from '@/components/CompanionsSection';
import { CoverPicker } from '@/components/CoverPicker';
import { ItineraryEditor } from '@/components/ItineraryEditor';
import { DeleteTripButton } from '@/components/trip/DeleteTripButton';
import { useAuth } from '@/auth/AuthContext';
import { MODAL_ICON_SIZE } from '@/lib/ui';
import { createTrip, updateTrip } from '@/lib/api';
import { initialCover, saveCover, type CoverValue } from '@/lib/tripCover';
import { useCompanions } from '@/lib/useCompanions';
import type { Destination, Trip } from '@/lib/types';

interface TripFormProps {
  onSuccess: (trip: Trip) => void;
  initial?: Trip | null;
  /** Se presente (modifica di un viaggio, solo proprietario) mostra "Elimina viaggio". */
  onDeleted?: () => void;
}

const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900 || year > 2100) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const TripForm: React.FC<TripFormProps> = ({ onSuccess, initial, onDeleted }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [name, setName] = useState(initial?.name ?? '');
  const [startDate, setStartDate] = useState(initial?.start_date ?? '');
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [destinations, setDestinations] = useState<Destination[]>(initial?.destinations ?? []);
  const [isPublic, setIsPublic] = useState<boolean>(initial?.is_public ?? false);

  // Compagni (amici da invitare e persone senza account): stessa sezione del viaggio rapido.
  const companionsState = useCompanions(initial?.id ?? null, user?.id ?? null);

  // Copertina: stato unico gestito da CoverPicker, salvato con saveCover dopo il viaggio.
  const [cover, setCover] = useState<CoverValue>(() => initialCover(initial));

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    isValidIsoDate(startDate) &&
    (!endDate || (isValidIsoDate(endDate) && endDate >= startDate));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);

    try {
      const baseInput = {
        name,
        start_date: startDate || null,
        end_date: endDate || null,
        destinations,
        is_public: isPublic,
      };
      let trip = initial ? await updateTrip(initial.id, baseInput) : await createTrip(user.id, baseInput);
      trip = await saveCover(trip, user.id, cover, initial?.cover_image_url ?? null);
      await companionsState.persist(trip.id);
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

  const firstCity = destinations.find((d) => d.city);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left column (7 cols on md+): Main trip info */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <Input
            label={t('memory.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('trip.namePlaceholder')}
          />

          {/* Date (più compatte) e visibilità sulla stessa riga */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <Input
              label={t('memory.startDay')}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="!py-2 !text-sm"
            />

            <Input
              label={t('memory.endDay')}
              type="date"
              value={endDate}
              min={isValidIsoDate(startDate) ? startDate : undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="!py-2 !text-sm"
            />

            <div>
              <label className="label">{t('trip.visibilityLabel')}</label>
              {/* Interruttore: il lucchetto si apre e si chiude insieme allo stato */}
              <button
                type="button"
                role="switch"
                aria-checked={isPublic}
                onClick={() => setIsPublic((v) => !v)}
                className="flex items-center gap-2.5 h-[42px] cursor-pointer select-none text-left"
              >
                <span className={`relative w-5 h-5 shrink-0 ${isPublic ? 'text-gold' : 'text-slate-400'}`}>
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={isPublic ? 'open' : 'closed'}
                      className="absolute inset-0 flex"
                      initial={{ opacity: 0, scale: 0.6, rotate: isPublic ? -20 : 20 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isPublic ? <LockOpen className={MODAL_ICON_SIZE} /> : <Lock className={MODAL_ICON_SIZE} />}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className={`min-w-[64px] text-sm font-semibold ${isPublic ? 'text-gold' : ''}`}>
                  {isPublic ? t('trip.publicLabel') : t('trip.privateLabel')}
                </span>
                <span
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                    isPublic ? 'bg-gold' : 'bg-slate-300 dark:bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      isPublic ? 'translate-x-5' : ''
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right column (5 cols on md+): Cover image picker */}
        <CoverPicker
          value={cover}
          onChange={setCover}
          defaultUnsplashQuery={firstCity ? `${firstCity.city}, ${firstCity.country}` : ''}
          className="md:col-span-5 flex flex-col"
          minHeight={120}
          inlineUnsplash
        />

        {/* Full width (12 cols): Destinations, raggruppate per paese come nel viaggio rapido */}
        <div className="md:col-span-12 pt-[20px]">
          <ItineraryEditor value={destinations} onChange={setDestinations} mode="full" />
        </div>

        {/* Full width (12 cols): Travel companions */}
        {user && (
          <div className="md:col-span-12 pt-[20px]">
            <CompanionsSection
              state={companionsState}
              currentUserId={user.id}
              isOwner={!initial || initial.owner_id === user.id}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {initial && onDeleted ? <DeleteTripButton trip={initial} onDeleted={onDeleted} /> : <span />}
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};
