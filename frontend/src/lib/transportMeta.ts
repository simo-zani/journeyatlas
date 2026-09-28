import {
  Backpack,
  Bus,
  Briefcase,
  Luggage,
  MoreHorizontal,
  Plane,
  Ship,
  TrainFront,
  Armchair,
  BedDouble,
  Car,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react';
import type { TransportType } from '@/lib/types';

/** Condiviso tra il form e la card dei mezzi: icone e ordine dei tipi non
 *  vanno duplicati nei due file. */
export const TRANSPORT_TYPES: TransportType[] = ['flight', 'train', 'ferry', 'bus', 'other'];

export const TRANSPORT_ICONS: Record<TransportType, LucideIcon> = {
  flight: Plane,
  train: TrainFront,
  ferry: Ship,
  bus: Bus,
  car: Bus, // legacy: kept in DB but not shown in UI
  other: MoreHorizontal,
};

export interface BaggageOption {
  key: 'has_backpack' | 'has_carry_on' | 'has_checked_baggage';
  icon: LucideIcon;
  labelKey: string;
}

export const BAGGAGE_OPTIONS: BaggageOption[] = [
  { key: 'has_backpack', icon: Backpack, labelKey: 'transport.baggage.backpack' },
  { key: 'has_carry_on', icon: Briefcase, labelKey: 'transport.baggage.carryOn' },
  { key: 'has_checked_baggage', icon: Luggage, labelKey: 'transport.baggage.checkedBaggage' },
];

export interface TrainOption {
  key: 'has_seat' | 'has_cabin';
  icon: LucideIcon;
  labelKey: string;
}

export const TRAIN_OPTIONS: TrainOption[] = [
  { key: 'has_seat', icon: Armchair, labelKey: 'transport.options.seat' },
  { key: 'has_cabin', icon: BedDouble, labelKey: 'transport.options.cabin' },
];

export interface FerryOption {
  key: 'has_car_on_ferry' | 'has_deck_passage' | 'has_seat' | 'has_cabin';
  icon: LucideIcon;
  labelKey: string;
}

export const FERRY_OPTIONS: FerryOption[] = [
  { key: 'has_car_on_ferry', icon: Car, labelKey: 'transport.options.car' },
  { key: 'has_deck_passage', icon: LifeBuoy, labelKey: 'transport.options.deckPassage' },
  { key: 'has_seat', icon: Armchair, labelKey: 'transport.options.seat' },
  { key: 'has_cabin', icon: BedDouble, labelKey: 'transport.options.cabin' },
];

