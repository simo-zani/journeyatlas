import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { DestinationPicker } from '@/components/DestinationPicker';
import { useAuth } from '@/auth/AuthContext';
import { createTrip, updateTrip } from '@/lib/api';
import { compressImage } from '@/lib/image';
import { supabase } from '@/lib/supabase';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [startDate, setStartDate] = useState(initial?.start_date ?? '');
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [destinations, setDestinations] = useState<Destination[]>(initial?.destinations ?? []);
  const [budget, setBudget] = useState(
    initial?.budget_planned != null ? String(initial.budget_planned) : ''
  );

  // Cover image state
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.cover_image_url ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Cover position (0 = top, 100 = bottom)
  const [coverPositionY, setCoverPositionY] = useState<number>(initial?.cover_position_y ?? 0);
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);

  const handlePositionDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPosition(true);
  }, []);

  // Tracks the pointer on `window` rather than the (small) preview box, so
  // dragging stays smooth even once the cursor moves outside those bounds —
  // binding move/up handlers to the box itself made the drag stop dead the
  // moment the pointer left it, which is what read as "buggy".
  useEffect(() => {
    if (!isDraggingPosition) return;

    const updateFromClientY = (clientY: number) => {
      if (!coverRef.current) return;
      const rect = coverRef.current.getBoundingClientRect();
      const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      setCoverPositionY(Math.round(relY * 100));
    };

    const onMouseMove = (e: MouseEvent) => updateFromClientY(e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updateFromClientY(e.touches[0].clientY);
    };
    const onDragEnd = () => setIsDraggingPosition(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onDragEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [isDraggingPosition]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    isValidIsoDate(startDate) &&
    (!endDate || (isValidIsoDate(endDate) && endDate >= startDate)) &&
    (budget === '' || Number(budget) >= 0);

  const handleFileSelect = (file: File | null) => {
    setCoverError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setCoverError(t('trip.coverTooLarge'));
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(file);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCoverPositionY(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadCover = async (tripId: string): Promise<string | null> => {
    if (!coverFile || !user) return null;
    const compressed = await compressImage(coverFile);
    const ext = 'jpg';
    const path = `${user.id}/${tripId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('trip-covers')
      .upload(path, compressed, { contentType: 'image/jpeg', upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('trip-covers').getPublicUrl(path);
    return data.publicUrl;
  };

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
        budget_planned: budget === '' ? null : Number(budget),
      };

      let trip: Trip;

      if (initial) {
        // Update: first save basic fields, then upload image if changed
        trip = await updateTrip(initial.id, { ...baseInput, cover_position_y: coverPositionY });
        if (coverFile) {
          const url = await uploadCover(trip.id);
          if (url) trip = await updateTrip(trip.id, { cover_image_url: url, cover_position_y: coverPositionY });
        } else if (coverPreview === null && initial.cover_image_url) {
          // User removed the image
          trip = await updateTrip(trip.id, { cover_image_url: null, cover_position_y: 0 });
        } else {
          // Position changed but no new image
          trip = await updateTrip(trip.id, { cover_position_y: coverPositionY });
        }
      } else {
        // Create: insert trip first to get ID, then upload
        trip = await createTrip(user.id, { ...baseInput, cover_image_url: null });
        if (coverFile) {
          const url = await uploadCover(trip.id);
          if (url) trip = await updateTrip(trip.id, { cover_image_url: url, cover_position_y: coverPositionY });
        }
      }

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left column (7 cols on md+): Main trip info */}
        <div className="md:col-span-7 flex flex-col justify-between gap-6">
          <Input
            label={t('trip.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('trip.namePlaceholder')}
          />

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <Input
            label={t('trip.budget')}
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder={t('trip.budgetPlaceholder')}
          />
        </div>

        {/* Right column (5 cols on md+): Cover image picker */}
        <div className="md:col-span-5 flex flex-col">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('trip.coverImage')}
          </label>

          <div className="flex-1 flex flex-col">
            {coverPreview ? (
              <div
                ref={coverRef}
                className="relative rounded-xl overflow-hidden flex-1 min-h-[190px] border border-slate-200 dark:border-white/10 shadow-inner select-none"
                style={{ cursor: isDraggingPosition ? 'grabbing' : 'default' }}
              >
                <img
                  src={coverPreview}
                  alt="cover preview"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-200"
                  style={{ objectPosition: `50% ${coverPositionY}%` }}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 z-10"
                  title={t('common.remove')}
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </button>
                {/* Drag to reposition handle — no transition on this element: it
                    tracks the pointer directly, and animating `top` made it visibly
                    lag behind the cursor instead of following it. */}
                <div
                  onMouseDown={handlePositionDragStart}
                  onTouchStart={handlePositionDragStart}
                  className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none"
                  style={{ top: `clamp(4px, calc(${coverPositionY}% - 20px), calc(100% - 40px))` }}
                  title={t('trip.coverDragHint')}
                >
                  <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg ring-1 ring-white/20 transition-all hover:scale-105">
                    <GripVertical className="w-5 h-5 shrink-0" strokeWidth={2} />
                    <span className="text-[11px] font-semibold whitespace-nowrap">
                      {coverPositionY === 0 ? t('trip.coverDragHint') : t('trip.coverPosition', { percent: coverPositionY })}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-2.5 left-3 text-xs font-medium text-white/90 drop-shadow pointer-events-none">
                  {coverFile ? `${(coverFile.size / 1024).toFixed(0)} KB` : t('trip.coverSet')}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 min-h-[190px] flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center ${
                  isDragging
                    ? 'border-gold bg-gold/10 scale-[0.99]'
                    : 'border-slate-300 dark:border-white/15 hover:border-gold/70 hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-300 ring-1 ring-slate-200/60 dark:ring-white/10">
                  <ImagePlus className="w-9 h-9 text-gold" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {t('trip.coverDrop')}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    JPG, PNG, WEBP, GIF
                  </p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    Max 5 MB
                  </p>
                </div>
              </div>
            )}

            {coverError && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{coverError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {/* Full width (12 cols): Destinations */}
        <div className="md:col-span-12 pt-2 border-t border-slate-200/60 dark:border-white/5">
          <DestinationPicker value={destinations} onChange={setDestinations} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};
