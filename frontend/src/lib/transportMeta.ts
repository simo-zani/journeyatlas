import { Backpack, Bus, Briefcase, Car, Luggage, MoreHorizontal, Plane, Ship, TrainFront, type LucideIcon } from 'lucide-react';
import type { TransportType } from '@/lib/types';

/** Condiviso tra il form e la card dei mezzi: icone e ordine dei tipi non
 *  vanno duplicati nei due file. */
export const TRANSPORT_TYPES: TransportType[] = ['flight', 'train', 'bus', 'ferry', 'car', 'other'];

export const TRANSPORT_ICONS: Record<TransportType, LucideIcon> = {
  flight: Plane,
  train: TrainFront,
  bus: Bus,
  ferry: Ship,
  car: Car,
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
