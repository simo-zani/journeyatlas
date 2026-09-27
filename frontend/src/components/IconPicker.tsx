import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { ActivityIcon } from '@/components/ActivityIcon';
import { ACTIVITY_ICON_GROUPS } from '@/lib/activityIcons';

interface IconPickerProps {
  value: string | null;
  onChange: (icon: string) => void;
  ariaLabel?: string;
}

/** Grouped, searchable icon picker — trigger button + dropdown panel with
 * every group from `ACTIVITY_ICON_GROUPS`, filterable by name. Closes on
 * outside click / Escape, same pattern as the category select dropdowns. */
export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, ariaLabel }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const iconLabel = (iconKey: string) => t(`activity.iconName.${iconKey}`, { defaultValue: iconKey.replace(/-/g, ' ') });

  const normalizedQuery = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    if (!normalizedQuery) return ACTIVITY_ICON_GROUPS;
    return ACTIVITY_ICON_GROUPS.map((group) => ({
      ...group,
      icons: group.icons.filter(
        (icon) =>
          icon.replace(/-/g, ' ').includes(normalizedQuery) ||
          iconLabel(icon).toLowerCase().includes(normalizedQuery)
      ),
    })).filter((group) => group.icons.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- iconLabel is stable (only depends on `t`)
  }, [normalizedQuery, t]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel ?? t('activity.iconPicker.trigger')}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
          open
            ? 'border-gold bg-gold/15 text-gold'
            : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-gold hover:text-gold'
        }`}
      >
        <ActivityIcon icon={value} className="w-7 h-7" size={28} />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute z-30 mt-2 w-[320px] max-h-[380px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-900/10 dark:ring-white/10 overflow-hidden"
        >
          <div className="p-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('activity.iconPicker.search')}
                className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('common.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto p-2.5 space-y-3">
            {visibleGroups.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">{t('activity.iconPicker.empty')}</p>
            )}
            {visibleGroups.map((group) => (
              <div key={group.key}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  {t(`activity.iconGroup.${group.key}`)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.icons.map((iconKey) => {
                    const selected = value === iconKey;
                    const label = iconLabel(iconKey);
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => {
                          onChange(iconKey);
                          setOpen(false);
                          setQuery('');
                        }}
                        aria-pressed={selected}
                        aria-label={label}
                        title={label}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          selected
                            ? 'border-gold bg-gold/15 text-gold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-gold hover:text-gold hover:bg-gold/5'
                        }`}
                      >
                        <ActivityIcon icon={iconKey} className="w-5 h-5" size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
