import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  CreditCard,
  Droplets,
  FileText,
  Footprints,
  HeartPulse,
  Loader2,
  Luggage,
  Map,
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
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
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

const PACKED_BADGE: Record<string, 'success' | 'warning'> = {
  true: 'success',
  false: 'warning',
};

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
  map: Map,
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
  onChange: (value: string) => void;
  ariaLabel: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  options,
  placeholder,
  labelFor,
  iconFor,
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

  const CurrentIcon = value === 'all' ? null : iconFor(value);
  const currentLabel = value === 'all' ? placeholder : labelFor(value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field w-auto inline-flex items-center justify-between gap-2 pr-2.5 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          {CurrentIcon && <CurrentIcon className="w-6 h-6 text-gold shrink-0" />}
          <span className="truncate">{currentLabel}</span>
        </span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 min-w-[240px] max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-900/10 dark:ring-white/10 py-1"
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
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                value === 'all'
                  ? 'text-gold font-semibold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {placeholder}
            </button>
          </li>
          {options.map((c) => {
            const Icon = iconFor(c);
            const selected = value === c;
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
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    selected
                      ? 'text-gold font-semibold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {Icon && <Icon className="w-6 h-6 shrink-0 text-gold" />}
                  <span className="truncate">{labelFor(c)}</span>
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
  const [form, setForm] = useState<FormState>({ open: false, editing: null });
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
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
          (showPacked === 'all' ||
            (showPacked === 'done' ? i.packed : !i.packed))
      ),
    [items, filterCategory, showPacked]
  );

  const packedCount = items.filter((i) => i.packed).length;
  const progress = items.length === 0 ? 0 : Math.round((packedCount / items.length) * 100);

  const handleSubmit = async (input: ChecklistItemInput, icon?: string) => {
    const category = input.category ?? null;
    if (
      category &&
      !(CHECKLIST_CATEGORIES as readonly string[]).includes(category) &&
      !categories.some((c) => c.name === category)
    ) {
      await createChecklistCategory(tripId, category, icon ?? 'tag');
    }
    if (form.editing) {
      await updateChecklistItem(form.editing.id, input);
    } else {
      await createChecklistItem(tripId, userId, input);
    }
    setForm({ open: false, editing: null });
    await load();
  };

  const handleToggle = async (item: ChecklistItemRow) => {
    setToggling(item.id);
    setError(null);
    try {
      await toggleChecklistItem(item, userId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteChecklistItem(id);
    await load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-3">
          <CategorySelect
            value={filterCategory}
            options={filterCategories}
            placeholder={t('checklist.filterAllCategory')}
            labelFor={(c) => t(`checklist.category.${c}`, { defaultValue: c })}
            iconFor={(c) => ICON_MAP[resolveIconKey(c, categories) ?? 'tag'] ?? null}
            onChange={setFilterCategory}
            ariaLabel="Filter category"
          />
          <select
            className="input-field w-auto"
            value={showPacked}
            onChange={(e) => setShowPacked(e.target.value as typeof showPacked)}
            aria-label="Filter packed status"
          >
            <option value="all">{t('checklist.filterAllStatus')}</option>
            <option value="todo">{t('checklist.filterTodo')}</option>
            <option value="done">{t('checklist.filterDone')}</option>
          </select>
        </div>
        <div className="sm:ml-auto">
          <Button onClick={() => setForm({ open: true, editing: null })}>
            <Plus className="w-6 h-6" />
            {t('checklist.add')}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {items.length > 0 && (
        <Card compact className="mb-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('checklist.progress', { packed: packedCount, total: items.length, percent: progress })}
            </p>
            <span className="font-poppins font-bold text-lg text-gold">{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-light-blue to-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-16 h-16 text-gold animate-spin" />
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
        <ul className="space-y-2">
          {filtered.map((item) => {
            const CatIcon = ICON_MAP[resolveIconKey(item.category, categories) ?? 'tag'];
            const categoryLabel = t(`checklist.category.${item.category ?? ''}`, {
              defaultValue: item.category ?? '',
            });
            return (
              <Card key={item.id} compact className={item.packed ? 'opacity-70' : ''}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={toggling === item.id}
                    tabIndex={0}
                    aria-label={t(item.packed ? 'checklist.markTodo' : 'checklist.markPacked')}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg border-2 shrink-0 transition-all ${
                      item.packed
                        ? 'bg-gold border-gold text-deep-blue'
                        : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-gold hover:text-gold/50'
                    }`}
                  >
                    {toggling === item.id ? (
                      <Loader2 className="w-6 h-6 animate-spin text-current" />
                    ) : (
                      <Check className="w-6 h-6" strokeWidth={3} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium ${
                        item.packed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                          ×{item.quantity}
                        </span>
                      )}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.category && (
                      <Badge variant={PACKED_BADGE[String(item.packed)]} className="inline-flex items-center gap-1.5">
                        <CatIcon className="w-5 h-5" />
                        {categoryLabel}
                      </Badge>
                    )}
                    <button
                      onClick={() => setForm({ open: true, editing: item })}
                      className="p-2 rounded-lg text-slate-400 hover:text-light-blue hover:bg-light-blue/10 transition-colors"
                      aria-label={t('common.edit')}
                      title={t('common.edit')}
                    >
                      <Pencil className="w-6 h-6" />
                    </button>
                    <DeleteButton onDelete={() => handleDelete(item.id)} />
                  </div>
                </div>
              </Card>
            );
          })}
        </ul>
      )}

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
          <div className="flex items-center gap-2">
            <span className="w-12 h-12 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center text-gold shrink-0">
              {category && <SelectedIcon className="w-7 h-7" />}
            </span>
            <select
              className="input-field flex-1"
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
          {category === NEW_CATEGORY && (
            <div className="mt-2 space-y-2">
              <Input
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder={t('checklist.newCategoryPlaceholder')}
                autoFocus
              />
              <div>
                <label className="label">{t('checklist.icon')}</label>
                <div className="flex flex-wrap gap-2">
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
                        className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all ${
                          selected
                            ? 'border-gold bg-gold/15 text-gold'
                            : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-gold hover:text-gold'
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <Input
          label={t('checklist.quantity')}
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <Input label={t('checklist.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="tertiary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting && <Loader2 className="w-6 h-6 animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};