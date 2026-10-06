import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ImagePlus, Search, X } from 'lucide-react';
import { OperatorLogo } from '@/components/OperatorLogo';
import { PickerInput } from '@/components/trip/CityPicker';
import { ACTIVITY_OPERATORS } from '@/lib/bookingOperators';
import { fileToLogoDataUrl } from '@/lib/logoImage';
import { MODAL_ICON_SIZE } from '@/lib/ui';

interface OperatorPickerProps {
  name: string;
  logo: string | null;
  onChange: (name: string, logo: string | null) => void;
}

const isKnownName = (v: string) => ACTIVITY_OPERATORS.some((o) => o.name.toLowerCase() === v.trim().toLowerCase());

/**
 * Operatore di prenotazione: elenco dei più noti con logo, oppure nome libero
 * con logo caricato a mano (ritagliato e ridotto a pochi KB prima del salvataggio).
 */
export const OperatorPicker: React.FC<OperatorPickerProps> = ({ name, logo, onChange }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', key);
    };
  }, []);

  const q = name.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? ACTIVITY_OPERATORS.filter((o) => o.name.toLowerCase().includes(q)) : ACTIVITY_OPERATORS),
    [q]
  );
  const known = isKnownName(name);
  const isCustom = q.length > 0 && !known;
  const showList = open && filtered.length > 0;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(false);
    try {
      onChange(name, await fileToLogoDataUrl(file));
    } catch {
      setUploadError(true);
    }
  };

  return (
    <div ref={ref} className="space-y-2">
      <label className="label">{t('activity.bookingOperator')}</label>
      <div className="relative">
        <PickerInput
          value={name}
          onChange={(v) => {
            // passando a un operatore noto il logo personalizzato non serve più
            onChange(v, isKnownName(v) ? null : logo);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t('activity.bookingOperatorPlaceholder')}
          leading={
            name.trim() && (logo || known) ? (
              <OperatorLogo name={name} logo={logo} className={MODAL_ICON_SIZE} />
            ) : (
              <Search className={`${MODAL_ICON_SIZE} text-slate-400 shrink-0`} />
            )
          }
          trailing={
            name.trim() ? (
              <button
                type="button"
                onClick={() => onChange('', null)}
                aria-label={t('activity.bookingOperatorClear')}
                className="text-slate-400 hover:text-error transition-colors shrink-0"
              >
                <X className={MODAL_ICON_SIZE} />
              </button>
            ) : null
          }
          role="combobox"
          ariaLabel={t('activity.bookingOperator')}
          ariaControls="activity-operator-listbox"
          ariaExpanded={showList}
        />

        {showList && (
          <ul
            id="activity-operator-listbox"
            role="listbox"
            className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c35]"
          >
            {filtered.map((o) => {
              const selected = q === o.name.toLowerCase();
              return (
                <li key={o.name} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(o.name, null);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-gold/10 text-sm"
                  >
                    <OperatorLogo name={o.name} className={MODAL_ICON_SIZE} />
                    <span className="flex-1 truncate">{o.name}</span>
                    {selected && <Check className={`${MODAL_ICON_SIZE} text-gold shrink-0`} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isCustom && (
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          {logo ? (
            <img
              src={logo}
              alt=""
              className="w-10 h-10 rounded-xl object-contain border border-slate-200 dark:border-white/10"
            />
          ) : (
            <span className="w-10 h-10 rounded-xl border border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400">
              <ImagePlus className={MODAL_ICON_SIZE} />
            </span>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm font-semibold text-gold hover:underline cursor-pointer"
          >
            {logo ? t('activity.operatorLogoChange') : t('activity.operatorLogoUpload')}
          </button>
          {logo && (
            <button
              type="button"
              onClick={() => onChange(name, null)}
              className="text-sm text-slate-500 hover:text-error cursor-pointer"
            >
              {t('activity.operatorLogoRemove')}
            </button>
          )}
          {uploadError && <span className="text-sm text-error">{t('activity.operatorLogoError')}</span>}
        </div>
      )}
    </div>
  );
};
