import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, ImagePlus, Loader2, Pencil, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { CoverValue } from '@/lib/tripCover';
import {
  isUnsplashConfigured,
  searchUnsplashCovers,
  trackUnsplashDownload,
  type UnsplashSuggestion,
} from '@/lib/unsplash';

interface CoverPickerProps {
  value: CoverValue;
  onChange: (value: CoverValue) => void;
  /** Ricerca proposta aprendo i suggerimenti Unsplash (es. la prima meta). */
  defaultUnsplashQuery?: string;
  className?: string;
  /** Altezza minima dell'area (anteprima e zona di trascinamento). */
  minHeight?: number;
  /** Variante compatta: "Suggerisci da Unsplash" diventa una pillola dentro la
   *  copertina, che così può allungarsi fino all'altezza dei campi accanto. */
  inlineUnsplash?: boolean;
}

/**
 * Copertina del viaggio: trascina o scegli un'immagine (max 5 MB), oppure un
 * suggerimento da Unsplash; poi si riposiziona trascinando la maniglia.
 * Usato dal modulo del viaggio completo e da quello del viaggio rapido.
 */
export const CoverPicker: React.FC<CoverPickerProps> = ({
  value,
  onChange,
  defaultUnsplashQuery = '',
  className = '',
  minHeight = 190,
  inlineUnsplash = false,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Eliminare la copertina chiede conferma.
  const [confirmRemove, setConfirmRemove] = useState(false);
  // Matita: copre l'immagine con la zona per sostituirla (o rimuoverla).
  const [editing, setEditing] = useState(false);
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const [showUnsplashPanel, setShowUnsplashPanel] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState<UnsplashSuggestion[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);

  // Il trascinamento aggiorna la posizione a ogni movimento: si legge il valore
  // corrente da una ref per non ricreare i listener a ogni cambio.
  const valueRef = useRef(value);
  valueRef.current = value;

  const handlePositionDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPosition(true);
  }, []);

  // Tracks the pointer on `window` rather than the (small) preview box, so
  // dragging stays smooth even once the cursor moves outside those bounds.
  useEffect(() => {
    if (!isDraggingPosition) return;
    const updateFromClientY = (clientY: number) => {
      if (!coverRef.current) return;
      const rect = coverRef.current.getBoundingClientRect();
      const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      onChange({ ...valueRef.current, positionY: Math.round(relY * 100) });
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
  }, [isDraggingPosition, onChange]);

  const handleFileSelect = (file: File | null) => {
    setCoverError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setCoverError(t('trip.coverTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({ ...valueRef.current, file, preview: e.target?.result as string, externalUrl: null, attribution: null });
      setEditing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] ?? null);
  };

  const removeCover = () => {
    onChange({ preview: null, file: null, externalUrl: null, attribution: null, positionY: 0 });
    setEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runUnsplashSearch = async (query: string) => {
    if (!query.trim()) return;
    setUnsplashLoading(true);
    setUnsplashError(null);
    try {
      setUnsplashResults(await searchUnsplashCovers(query));
    } catch {
      setUnsplashError(t('trip.coverUnsplashError'));
    } finally {
      setUnsplashLoading(false);
    }
  };

  const toggleUnsplashPanel = () => {
    const next = !showUnsplashPanel;
    setShowUnsplashPanel(next);
    if (next && unsplashResults.length === 0 && !unsplashQuery) {
      setUnsplashQuery(defaultUnsplashQuery);
      if (defaultUnsplashQuery) void runUnsplashSearch(defaultUnsplashQuery);
    }
  };

  const handlePickUnsplash = (photo: UnsplashSuggestion) => {
    trackUnsplashDownload(photo.downloadLocation);
    setCoverError(null);
    onChange({
      preview: photo.fullUrl,
      file: null,
      externalUrl: photo.fullUrl,
      attribution: { name: photo.authorName, profileUrl: photo.authorProfileUrl },
      positionY: 0,
    });
    setShowUnsplashPanel(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { preview, file, attribution, positionY } = value;
  const unsplashPill = inlineUnsplash && isUnsplashConfigured() && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // nella zona vuota il clic aprirebbe la scelta del file
        toggleUnsplashPanel();
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm ring-1 ring-white/15 transition-colors cursor-pointer"
    >
      <Sparkles className="w-3.5 h-3.5 text-gold" />
      {t('trip.coverUnsplashButton')}
    </button>
  );

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {t('trip.coverImage')}
        {preview && <span className="ml-1 font-medium text-slate-500 dark:text-slate-400">({t('trip.coverSetShort')})</span>}
      </label>

      <div className="flex-1 flex flex-col">
        {preview ? (
          <div
            ref={coverRef}
            // Trascinando un'immagine sulla copertina la si sostituisce (desktop).
            onDragOver={(e) => {
              if (!e.dataTransfer.types.includes('Files')) return;
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
            }}
            onDrop={handleDrop}
            className="relative rounded-xl overflow-hidden flex-1 border border-slate-200 dark:border-white/10 shadow-inner select-none"
            style={{ cursor: isDraggingPosition ? 'grabbing' : 'default', minHeight }}
          >
            <img
              src={preview}
              alt="cover preview"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-200"
              style={{ objectPosition: `50% ${positionY}%` }}
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            {/* Matita: in modifica l'immagine si scurisce e sopra compare la zona per sostituirla */}
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-pressed={editing}
              title={editing ? t('common.cancel') : t('trip.coverEdit')}
              aria-label={editing ? t('common.cancel') : t('trip.coverEdit')}
              className="absolute top-2.5 right-2.5 z-30 w-[30px] h-[30px] rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              {editing ? (
                <X className="w-[16px] h-[16px]" strokeWidth={2.5} />
              ) : (
                <Pencil className="w-[15px] h-[15px] text-gold" strokeWidth={2.2} />
              )}
            </button>
            {(editing || isDragging) && (
              <div className="absolute inset-0 z-20 p-2.5 bg-slate-950/85 rounded-[inherit] flex">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed cursor-pointer text-center transition-colors ${
                    isDragging ? 'border-gold bg-gold/15' : 'border-white/30 hover:border-gold/70 hover:bg-white/[0.04]'
                  }`}
                >
                  <ImagePlus className="w-6 h-6 text-gold" strokeWidth={1.8} />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {isDragging ? t('trip.coverDropReplace') : t('trip.coverReplaceDrop')}
                    </p>
                    <p className="text-[11px] text-white/60 mt-0.5">JPG, PNG, WEBP, GIF · Max 5 MB</p>
                  </div>
                  {!isDragging && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmRemove(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-red-300 bg-white/5 hover:bg-error hover:text-white ring-1 ring-white/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('trip.coverRemove')}
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Maniglia per riposizionare: niente transizione, segue il puntatore. */}
            <div
              onMouseDown={handlePositionDragStart}
              onTouchStart={handlePositionDragStart}
              className="absolute left-3 z-10 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none"
              style={{ top: `clamp(4px, calc(${positionY}% - 20px), calc(100% - 40px))` }}
              title={t('trip.coverDragHint')}
            >
              <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg ring-1 ring-white/20 transition-all hover:scale-105">
                <GripVertical className="w-5 h-5 shrink-0" strokeWidth={2} />
                <span className="text-[11px] font-semibold whitespace-nowrap">
                  {positionY === 0 ? t('trip.coverDragHint') : t('trip.coverPosition', { percent: positionY })}
                </span>
              </div>
            </div>
            <div className="absolute bottom-2.5 left-3 text-xs font-medium text-white/90 drop-shadow pointer-events-none">
              {file ? (
                `${(file.size / 1024).toFixed(0)} KB`
              ) : attribution ? (
                <a
                  href={attribution.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto underline decoration-white/40 hover:decoration-white"
                >
                  {t('trip.coverUnsplashCredit', { name: attribution.name })}
                </a>
              ) : null}
            </div>
            {unsplashPill && <div className="absolute bottom-2 right-2 z-10">{unsplashPill}</div>}
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ minHeight }}
            className={`relative flex-1 flex flex-col items-center justify-center ${inlineUnsplash ? 'gap-2 p-3' : 'gap-3 p-4'} rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center ${
              isDragging
                ? 'border-gold bg-gold/10 scale-[0.99]'
                : 'border-slate-300 dark:border-white/15 hover:border-gold/70 hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02]'
            }`}
          >
            <div
              className={`${inlineUnsplash ? 'w-[44px] h-[44px]' : 'w-[64px] h-[64px]'} rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-300 ring-1 ring-slate-200/60 dark:ring-white/10`}
            >
              <ImagePlus className={`${inlineUnsplash ? 'w-6 h-6' : 'w-9 h-9'} text-gold`} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('trip.coverDrop')}</p>
              {inlineUnsplash ? (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG, WEBP, GIF · Max 5 MB</p>
              ) : (
                <>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG, WEBP, GIF</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">Max 5 MB</p>
                </>
              )}
            </div>
            {unsplashPill}
          </div>
        )}

        {coverError && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{coverError}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />
      </div>

      {isUnsplashConfigured() && (
        <div className={inlineUnsplash && !showUnsplashPanel ? '' : 'mt-2'}>
          {!inlineUnsplash && (
            <button
              type="button"
              onClick={toggleUnsplashPanel}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('trip.coverUnsplashButton')}
            </button>
          )}

          {showUnsplashPanel && (
            <div className="mt-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-2.5">
              {/* Niente <form> qui: il componente sta dentro il <form> del viaggio, e un
                  form annidato verrebbe fuso con quello esterno (la ricerca salverebbe il viaggio). */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={unsplashQuery}
                  onChange={(e) => setUnsplashQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void runUnsplashSearch(unsplashQuery);
                    }
                  }}
                  placeholder={t('trip.coverUnsplashSearchPlaceholder')}
                  className="flex-1 min-w-0 text-xs rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
                <button
                  type="button"
                  onClick={() => void runUnsplashSearch(unsplashQuery)}
                  disabled={unsplashLoading || !unsplashQuery.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-gold/15 text-gold hover:bg-gold/25 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {t('trip.coverUnsplashSearch')}
                </button>
              </div>

              {unsplashLoading && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> {t('trip.coverUnsplashLoading')}
                </p>
              )}
              {unsplashError && <p className="text-[11px] text-red-500">{unsplashError}</p>}
              {!unsplashLoading && !unsplashError && unsplashResults.length === 0 && (
                <p className="text-[11px] text-slate-400">{t('trip.coverUnsplashEmpty')}</p>
              )}
              {unsplashResults.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {unsplashResults.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handlePickUnsplash(photo)}
                      title={t('trip.coverUnsplashCredit', { name: photo.authorName })}
                      className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-white/10 hover:ring-2 hover:ring-gold transition-all cursor-pointer"
                    >
                      <img
                        src={photo.thumbUrl}
                        alt={t('trip.coverUnsplashCredit', { name: photo.authorName })}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Modal open={confirmRemove} onClose={() => setConfirmRemove(false)} title={t('trip.coverRemoveTitle')} maxWidth="max-w-sm">
        <div className="space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('trip.coverRemoveBody')}</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="tertiary" onClick={() => setConfirmRemove(false)}>
              {t('common.cancel')}
            </Button>
            <button
              type="button"
              onClick={() => {
                removeCover();
                setConfirmRemove(false);
              }}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold text-white bg-error hover:bg-red-600 cursor-pointer"
            >
              {t('common.remove')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
