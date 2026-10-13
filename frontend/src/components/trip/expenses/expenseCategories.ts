import {
  Baby,
  BedDouble,
  Beer,
  Bike,
  Bus,
  Camera,
  Car,
  Coffee,
  Fuel,
  Gift,
  Landmark,
  Mountain,
  Music,
  PartyPopper,
  Pill,
  Plane,
  Sailboat,
  Shirt,
  ShoppingBag,
  Sparkles,
  Tag,
  Ticket,
  Train,
  Utensils,
  Wallet,
  Wifi,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import type { ExpenseCategoryRow } from '@/lib/types';

/** Icona delle categorie predefinite (le personalizzate hanno la loro in DB). */
export const EXPENSE_CATEGORY_DEFAULT_ICONS: Record<string, string> = {
  cibo: 'utensils',
  alloggi: 'bed-double',
  trasporti: 'bus',
  auto: 'car',
  attrazioni: 'landmark',
  escursioni: 'mountain',
  shopping: 'shopping-bag',
  souvenir: 'gift',
  divertimento: 'party-popper',
  salute: 'pill',
  altro: 'tag',
};

/** Icone tra cui scegliere creando una categoria personalizzata. */
export const EXPENSE_ICON_CHOICES = [
  'utensils',
  'coffee',
  'wine',
  'beer',
  'bed-double',
  'plane',
  'train',
  'bus',
  'car',
  'fuel',
  'bike',
  'sailboat',
  'landmark',
  'mountain',
  'ticket',
  'camera',
  'music',
  'party-popper',
  'shopping-bag',
  'shirt',
  'gift',
  'sparkles',
  'pill',
  'baby',
  'wifi',
  'wallet',
  'tag',
] as const;

export const EXPENSE_ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  coffee: Coffee,
  wine: Wine,
  beer: Beer,
  'bed-double': BedDouble,
  plane: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  fuel: Fuel,
  bike: Bike,
  sailboat: Sailboat,
  landmark: Landmark,
  mountain: Mountain,
  ticket: Ticket,
  camera: Camera,
  music: Music,
  'party-popper': PartyPopper,
  'shopping-bag': ShoppingBag,
  shirt: Shirt,
  gift: Gift,
  sparkles: Sparkles,
  pill: Pill,
  baby: Baby,
  wifi: Wifi,
  wallet: Wallet,
  tag: Tag,
};

export const expenseCategoryIcon = (
  category: string | null,
  customCategories: ExpenseCategoryRow[]
): LucideIcon => {
  if (!category) return Tag;
  const key =
    EXPENSE_CATEGORY_DEFAULT_ICONS[category] ?? customCategories.find((c) => c.name === category)?.icon ?? 'tag';
  return EXPENSE_ICON_MAP[key] ?? Tag;
};

/** Valute proposte nel modulo spesa (oltre a quella del viaggio e a quella già usata). */
export const COMMON_CURRENCIES = [
  'EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY', 'AUD', 'CAD', 'NZD', 'SEK', 'NOK', 'DKK', 'ISK',
  'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'RSD', 'ALL', 'TRY', 'MAD', 'TND', 'EGP', 'ZAR', 'AED',
  'ILS', 'INR', 'THB', 'VND', 'IDR', 'MYR', 'SGD', 'HKD', 'KRW', 'PHP', 'BRL', 'MXN', 'ARS',
  'CLP', 'PEN', 'COP', 'CRC', 'CUP',
] as const;
