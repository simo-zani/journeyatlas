import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useIsStuck } from '@/lib/useIsStuck';
import {
  Anchor,
  Bandage,
  BatteryCharging,
  Bike,
  Book,
  Briefcase,
  Bus,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  CreditCard,
  Droplets,
  FileText,
  Footprints,
  HeartPulse,
  Layers,
  Loader2,
  Luggage,
  Map as MapIcon,
  MapPin,
  Music,
  Package,
  Pencil,
  Plane,
  Plus,
  Shirt,
  Smartphone,
  Snowflake,
  Sun,
  Tag,
  Tent,
  Train,
  Umbrella,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { DeleteButton } from '@/components/trip/DeleteButton';
import {
  CHECKLIST_CATEGORIES,
  createChecklistCategory,
  createChecklistItem,
  deleteChecklistItem,
  fetchChecklistCategories,
  fetchChecklistItems,
  toggleChecklistItem,
  updateChecklistItem,
  type ChecklistItemInput,
} from '@/lib/api';
import type { ChecklistCategoryRow, ChecklistItemCategory, ChecklistItemRow } from '@/lib/types';

interface ChecklistSectionProps {
  tripId: string;
  userId: string;
}

interface FormState {
  open: boolean;
  editing: ChecklistItemRow | null;
}

const NEW_CATEGORY = '__new__';

const CATEGORY_DEFAULT_ICONS: Record<string, string> = {
  documenti: 'file-text',
  abbigliamento: 'shirt',
  toilette: 'droplets',
  elettronica: 'smartphone',
  salute: 'heart-pulse',
  altro: 'tag',
};

const ICON_CHOICES = [
  'luggage',
  'briefcase',
  'map',
  'map-pin',
  'utensils',
  'car',
  'bus',
  'train',
  'plane',
  'tent',
  'footprints',
  'camera',
  'music',
  'book',
  'credit-card',
  'package',
  'battery-charging',
  'bandage',
  'umbrella',
  'sun',
  'snowflake',
  'anchor',
  'bike',
  'wallet',
  'tag',
] as const;

const ICON_MAP: Record<string, LucideIcon> = {
  luggage: Luggage,
  briefcase: Briefcase,
  map: MapIcon,
  'map-pin': MapPin,
  utensils: Utensils,
  car: Car,
  bus: Bus,
  train: Train,
  plane: Plane,
  tent: Tent,
  footprints: Footprints,
  camera: Camera,
  music: Music,
  book: Book,
  'credit-card': CreditCard,
  package: Package,
  'battery-charging': BatteryCharging,
  bandage: Bandage,
  umbrella: Umbrella,
  sun: Sun,
  snowflake: Snowflake,
  anchor: Anchor,
  bike: Bike,
  wallet: Wallet,
  shirt: Shirt,
  'file-text': FileText,
  droplets: Droplets,
  smartphone: Smartphone,
  'heart-pulse': HeartPulse,
  tag: Tag,
};

const resolveIconKey = (
  category: string | null,
  customCategories: ChecklistCategoryRow[]
): string | null => {
  if (!category) return null;
  const custom = customCategories.find((c) => c.name === category);
  return CATEGORY_DEFAULT_ICONS[category] ?? custom?.icon ?? 'tag';
};

interface CategorySelectProps {
  value: string;
  options: string[];
  placeholder: string;
  labelFor: (option: string) => string;
  iconFor: (option: string) => LucideIcon | null;
  countFor?: (option: string) => number;
  totalCount: number;
  onChange: (value: string) => void;
  ariaLabel: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  options,
  placeholder,
  labelFor,
  iconFor,
  countFor,
  totalCount,
  onChange,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
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

  const CurrentIcon = value === 'all' ? Layers : iconFor(value);
  const currentLabel = value === 'all' ? placeholder : labelFor(value);
  const currentCount = value === 'all' ? totalCount : countFor?.(value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2.5 h-[38px] px-3.5 rounded-xl bg-slate-900/80 dark:bg-slate-900/85 border border-slate-700/60 dark:border-white/10 hover:border-gold/50 backdrop-blur-xl text-xs font-bold text-slate-300 transition-all shadow-md cursor-pointer select-none"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="inline-flex items-center gap-2.5 min-w-0">
          {CurrentIcon && <CurrentIcon className="w-5 h-5 text-gold shrink-0" strokeWidth={2.2} />}
          <span className="truncate max-w-[140px] sm:max-w-[180px]">{currentLabel}</span>
          {currentCount !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono">
              {currentCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-gold' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-50 mt-2 min-w-[260px] max-h-80 overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-1.5 ring-1 ring-white/10 space-y-0.5"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === 'all'}
              onClick={() => {
                onChange('all');
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-left transition-all ${
                value === 'all'
                  ? 'bg-gold/15 text-gold font-semibold border border-gold/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Layers className="w-5 h-5 shrink-0 text-gold" strokeWidth={2.2} />
                <span className="truncate">{placeholder}</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                  value === 'all' ? 'bg-gold/20 text-gold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {totalCount}
              </span>
            </button>
          </li>
          {options.map((c) => {
            const Icon = iconFor(c);
            const selected = value === c;
            const count = countFor?.(c);
            return (
              <li key={c}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-left transition-all ${
                    selected
                      ? 'bg-gold/15 text-gold font-semibold border border-gold/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    {Icon && <Icon className="w-5 h-5 shrink-0 text-gold" strokeWidth={2.2} />}
                    <span className="truncate">{labelFor(c)}</span>
                  </span>
                  {count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                        selected ? 'bg-gold/20 text-gold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ tripId, userId }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ChecklistItemRow[]>([]);
  const [categories, setCategories] = useState<ChecklistCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [showPacked, setShowPacked] = useState<'all' | 'todo' | 'done'>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<FormState>({ open: false, editing: null });

  const load = useCallback(async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        fetchChecklistItems(tripId),
        fetchChecklistCategories(tripId),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [tripId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filterCategories = useMemo(() => {
    const names = new Set<string>([
      ...(CHECKLIST_CATEGORIES as readonly string[]),
      ...categories.map((c) => c.name),
    ]);
    items.forEach((i) => i.category && names.add(i.category));
    return Array.from(names);
  }, [items, categories]);

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (filterCategory === 'all' || i.category === filterCategory) &&
          (showPacked === 'all' || (showPacked === 'done' ? i.packed : !i.packed))
      ),
    [items, filterCategory, showPacked]
  );

  // Group filtered items by category with alphabetical sorting inside each category
  const groupedCategories = useMemo(() => {
    const categoryMap = new Map<string, ChecklistItemRow[]>();

    filtered.forEach((item) => {
      const cat = item.category || 'altro';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(item);
    });

    // Strictly sort items alphabetically by name — keeps items in place when packed/unpacked
    categoryMap.forEach((catItems) => {
      catItems.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
    });

    // Sort categories: built-in order first, then custom categories alphabetically
    const standardOrder = CHECKLIST_CATEGORIES as readonly string[];
    const sortedKeys = Array.from(categoryMap.keys()).sort((a, b) => {
      const idxA = standardOrder.indexOf(a as ChecklistItemCategory);
      const idxB = standardOrder.indexOf(b as ChecklistItemCategory);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, 'it', { sensitivity: 'base' });
    });

    return sortedKeys.map((catKey) => {
      const catItems = categoryMap.get(catKey)!;
      return {
        key: catKey,
        items: catItems,
        packedCount: catItems.filter((i) => i.packed).length,
        totalCount: catItems.length,
      };
    });
  }, [filtered]);

  const toggleCollapse = (catKey: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const allCollapsed =
    groupedCategories.length > 0 &&
    groupedCategories.every((c) => collapsedCategories[c.key]);

  const toggleAllCollapse = () => {
    if (allCollapsed) {
      setCollapsedCategories({});
    } else {
      const next: Record<string, boolean> = {};
      groupedCategories.forEach((c) => {
        next[c.key] = true;
      });
      setCollapsedCategories(next);
    }
  };

  const handleToggle = async (item: ChecklistItemRow) => {
    // 1. Optimistic update: instant visual toggle, stays in exact alphabetical position
    const nextPacked = !item.packed;
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              packed: nextPacked,
              packed_by_user_id: nextPacked ? userId : null,
              packed_at: nextPacked ? new Date().toISOString() : null,
            }
          : i
      )
    );

    // 2. Background sync without full page reload or layout shift
    try {
      await toggleChecklistItem(item, userId);
    } catch (err) {
      // Revert if error
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    const backup = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteChecklistItem(id);
    } catch (err) {
      setItems(backup);
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const handleSubmit = async (input: ChecklistItemInput, icon?: string) => {
    const category = input.category ?? null;
    if (
      category &&
      !(CHECKLIST_CATEGORIES as readonly string[]).includes(category) &&
      !categories.some((c) => c.name === category)
    ) {
      const newCat = await createChecklistCategory(tripId, category, icon ?? 'tag');
      setCategories((prev) => [...prev, newCat]);
    }
    if (form.editing) {
      const updated = await updateChecklistItem(form.editing.id, input);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } else {
      const created = await createChecklistItem(tripId, userId, input);
      setItems((prev) => [...prev, created]);
    }
    setForm({ open: false, editing: null });
  };

  const [barSentinelRef, barStuck] = useIsStuck(56);
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(58);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => setBarHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Le intestazioni delle categorie restano ferme subito sotto la barra dei filtri
  const stickyTop = 56 + barHeight;


  return (
    <div className="space-y-6">
      {/* Barra filtri: stessa posizione, altezza e comportamento sticky degli altri tab */}
      <div ref={barSentinelRef} className="h-0 !mt-0" aria-hidden="true" />
      <div
        ref={barRef}
        className={`!mt-0 sticky top-14 z-20 py-1.5 before:content-[''] before:absolute before:-z-10 before:inset-x-[-50vw] before:top-[-120px] before:bottom-0 before:backdrop-blur-md before:bg-[var(--surface-0)]/60 before:pointer-events-none before:[mask-image:linear-gradient(to_bottom,black_80%,transparent)] before:transition-opacity before:duration-500 before:ease-out ${barStuck ? 'before:opacity-100' : 'before:opacity-0'} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
      >
        <div className="flex flex-wrap items-center gap-2 py-1">
          {/* Category Dropdown */}
          <CategorySelect
            value={filterCategory}
            options={filterCategories}
            placeholder={t('checklist.filterAllCategory')}
            labelFor={(c) => t(`checklist.category.${c}`, { defaultValue: c })}
            iconFor={(c) => ICON_MAP[resolveIconKey(c, categories) ?? 'tag'] ?? null}
            countFor={(c) => items.filter((i) => i.category === c).length}
            totalCount={items.length}
            onChange={setFilterCategory}
            ariaLabel="Filter category"
          />

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-900/80 dark:bg-slate-900/85 border border-slate-700/60 dark:border-white/10 backdrop-blur-xl shadow-md">
            {(['all', 'todo', 'done'] as const).map((status) => {
              const isSelected = showPacked === status;
              const label =
                status === 'all'
                  ? t('checklist.filterAllStatus', 'Tutti')
                  : status === 'todo'
                  ? t('checklist.filterTodo', 'Da preparare')
                  : t('checklist.filterDone', 'Pronti');
              const count =
                status === 'all'
                  ? items.length
                  : status === 'todo'
                  ? items.filter((i) => !i.packed).length
                  : items.filter((i) => i.packed).length;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setShowPacked(status)}
                  className={`relative flex items-center gap-1.5 h-7 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                    isSelected ? 'text-slate-950' : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="checklist-status-active"
                      className="absolute inset-0 rounded-full bg-gold shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                  <span
                    className={`relative text-[11px] px-1.5 rounded-full font-mono ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:ml-auto py-1">
          {groupedCategories.length > 1 && (
            <button
              type="button"
              onClick={toggleAllCollapse}
              className="flex items-center justify-center w-[38px] h-[38px] rounded-full border border-slate-700/60 dark:border-white/10 bg-slate-900/80 dark:bg-slate-900/85 backdrop-blur-xl shadow-md text-slate-400 hover:text-slate-100 hover:border-gold/50 transition-colors cursor-pointer"
              title={allCollapsed ? 'Espandi tutte le sezioni' : 'Comprimi tutte le sezioni'}
              aria-label={allCollapsed ? 'Espandi tutte le sezioni' : 'Comprimi tutte le sezioni'}
            >
              {allCollapsed ? <ChevronsDown size={20} /> : <ChevronsUp size={20} />}
            </button>
          )}
          <Button className="!h-[38px] !min-h-0 !py-0 !px-5 !text-xs" onClick={() => setForm({ open: true, editing: null })}>
            <Plus size={20} strokeWidth={2.5} />
            {t('checklist.add')}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={48} className="text-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p className="empty-state-title">
            {items.length === 0 ? t('checklist.empty') : t('checklist.noMatches')}
          </p>
          <p className="empty-state-message">
            {items.length === 0 ? t('checklist.emptySub') : t('checklist.noMatchesSub')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedCategories.map((cat) => {
            const CatIcon = ICON_MAP[resolveIconKey(cat.key, categories) ?? 'tag'] ?? Tag;
            const catLabel = t(`checklist.category.${cat.key}`, { defaultValue: cat.key });
            const isCollapsed = !!collapsedCategories[cat.key];
            const isCompleted = cat.packedCount === cat.totalCount;
            const catPercent = Math.round((cat.packedCount / cat.totalCount) * 100);

            return (
              <div
                key={cat.key}
                className="relative rounded-2xl bg-slate-900/50 backdrop-blur-md transition-all [overflow:clip]"
              >
                {/* Copertura sticky: ferma all'altezza dell'intestazione agganciata e copre, dentro questo
                    riquadro, tutto ciò che sta sopra. È posizionata dal browser insieme all'intestazione,
                    quindi segue lo scroll senza ritardi. */}
                <div className="sticky z-[4] h-0 pointer-events-none" style={{ top: stickyTop }} aria-hidden="true">
                  {/* scende di 32px (il raggio degli angoli) sotto il bordo alto dell'intestazione: negli angoli curvi dell'intestazione non deve intravedersi nulla */}
                  <div className="absolute inset-x-0 bottom-[-32px] h-[3032px] bg-[var(--surface-0)]" />
                </div>
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(cat.key)}
                  style={{ top: stickyTop }}
                  className={`sticky z-[5] w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[var(--surface-1)] hover:brightness-125 transition-[filter] text-left select-none cursor-pointer border border-slate-700/60 rounded-2xl`}
                  aria-expanded={!isCollapsed}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-[46px] h-[46px] rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0 shadow-sm shadow-gold/10">
                      <CatIcon size={24} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-poppins font-semibold text-base text-slate-100 capitalize">
                          {catLabel}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {cat.packedCount} / {cat.totalCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-5 shrink-0">
                    {/* Progress bar on side */}
                    <div className="hidden sm:flex items-center gap-3 w-[150px] md:w-[180px]">
                      <div className="flex-1 h-[8px] rounded-full bg-slate-800 border border-slate-700/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-400' : 'bg-gold'
                          }`}
                          style={{ width: `${catPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 min-w-[36px] text-right tabular-nums font-mono">
                        {catPercent}%
                      </span>
                    </div>
                    <ChevronDown
                      size={22}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Items in category */}
                {!isCollapsed && (
                  <ul className="divide-y divide-slate-800/70 p-1.5 sm:p-2 pt-[38px] sm:pt-10 -mt-[32px] space-y-1 rounded-b-2xl border border-t-0 border-slate-700/60">
                    {cat.items.map((item) => (
                      <li
                        key={item.id}
                        className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all ${
                          item.packed
                            ? 'bg-slate-800/20 opacity-70'
                            : 'bg-slate-800/40 hover:bg-slate-800/70'
                        } group`}
                      >
                        {/* Custom Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggle(item)}
                          tabIndex={0}
                          aria-label={t(item.packed ? 'checklist.markTodo' : 'checklist.markPacked')}
                          className={`w-[34px] h-[34px] rounded-xl border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            item.packed
                              ? 'bg-gold border-gold text-slate-950 shadow-sm shadow-gold/30'
                              : 'border-slate-600 bg-slate-800/60 text-transparent hover:border-gold hover:text-gold/40'
                          }`}
                        >
                          <Check size={20} strokeWidth={3} />
                        </button>

                        {/* Title and notes (clicking also toggles) */}
                        <div
                          className="min-w-0 flex-1 cursor-pointer select-none"
                          onClick={() => handleToggle(item)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-medium text-sm sm:text-base transition-all ${
                                item.packed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-200'
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-xs px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-400 border border-slate-700/60 font-medium font-mono">
                                ×{item.quantity}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{item.notes}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setForm({ open: true, editing: item })}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors cursor-pointer"
                            aria-label={t('common.edit')}
                            title={t('common.edit')}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <DeleteButton onDelete={() => handleDelete(item.id)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={form.open}
        onClose={() => setForm({ open: false, editing: null })}
        title={form.editing ? t('checklist.edit') : t('checklist.add')}
      >
        <ChecklistForm
          initial={form.editing}
          customCategories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setForm({ open: false, editing: null })}
        />
      </Modal>
    </div>
  );
};

interface ChecklistFormProps {
  initial: ChecklistItemRow | null;
  customCategories: ChecklistCategoryRow[];
  onSubmit: (input: ChecklistItemInput, icon?: string) => Promise<void>;
  onCancel: () => void;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({
  initial,
  customCategories,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isCustomInitial =
    !!initial?.category && !(CHECKLIST_CATEGORIES as readonly string[]).includes(initial.category);
  const initialCustomExists = customCategories.some((c) => c.name === initial?.category);

  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<string>(
    isCustomInitial && !initialCustomExists ? NEW_CATEGORY : (initial?.category ?? '')
  );
  const [customCategoryName, setCustomCategoryName] = useState(
    isCustomInitial && !initialCustomExists ? initial.category ?? '' : ''
  );
  const [customIcon, setCustomIcon] = useState(
    customCategories.find((c) => c.name === initial?.category)?.icon ?? 'tag'
  );
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resolvedCategory =
    category === NEW_CATEGORY ? customCategoryName.trim() || null : category || null;

  const selectedIconKey =
    category === NEW_CATEGORY
      ? customIcon
      : resolveIconKey(category, customCategories) ?? 'tag';
  const SelectedIcon = ICON_MAP[selectedIconKey] ?? ICON_MAP.tag;

  const canSubmit =
    name.trim().length > 0 &&
    quantity >= 1 &&
    (category !== NEW_CATEGORY || customCategoryName.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(
        {
          name,
          category: resolvedCategory as ChecklistItemCategory | null,
          quantity: Number(quantity),
          notes: notes || null,
        },
        category === NEW_CATEGORY ? customIcon : undefined
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Input
        label={`${t('checklist.name')} *`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('checklist.categoryLabel')}</label>
          <div className="relative">
            {category && (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold z-10">
                <SelectedIcon size={20} />
              </span>
            )}
            <select
              className="input-field w-full"
              style={{ paddingLeft: category ? '2.5rem' : undefined }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">—</option>
              {CHECKLIST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`checklist.category.${c}`)}
                </option>
              ))}
              {customCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value={NEW_CATEGORY}>{t('checklist.newCategory')}</option>
            </select>
          </div>
        </div>
        <Input
          label={t('checklist.quantity')}
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      {category === NEW_CATEGORY && (
        <div className="space-y-3 p-3.5 rounded-xl border border-gold/30 bg-gold/[0.04]">
          <Input
            label={t('checklist.newCategory')}
            value={customCategoryName}
            onChange={(e) => setCustomCategoryName(e.target.value)}
            placeholder={t('checklist.newCategoryPlaceholder')}
            autoFocus
          />
          <div>
            <label className="label mb-2 block">{t('checklist.icon')}</label>
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 max-h-44 overflow-y-auto">
              {ICON_CHOICES.map((key) => {
                const Icon = ICON_MAP[key];
                const selected = customIcon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCustomIcon(key)}
                    aria-pressed={selected}
                    aria-label={key}
                    title={key}
                    className={`h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      selected
                        ? 'border-gold bg-gold/20 text-gold ring-2 ring-gold/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:border-gold hover:text-gold hover:bg-gold/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Input label={t('checklist.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="tertiary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};