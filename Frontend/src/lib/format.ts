import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from 'date-fns';
import type { WeightUnit } from '@/types/api';

export const LB_PER_KG = 2.2046226218;

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');
export const toISODate = (d: Date) => format(d, 'yyyy-MM-dd');
export const parseDate = (iso: string) => parseISO(iso);

/** kg → display unit, rounded for plates (0.25 kg / 0.5 lb resolution). */
export function fromKg(kg: number | null | undefined, unit: WeightUnit): number | null {
  if (kg == null) return null;
  if (unit === 'lb') return Math.round(kg * LB_PER_KG * 2) / 2;
  return Math.round(kg * 100) / 100;
}

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'lb' ? Math.round((value / LB_PER_KG) * 1000) / 1000 : value;
}

export function num(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return '–';
  return Number(n.toFixed(digits)).toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function weight(kg: number | null | undefined, unit: WeightUnit, digits = 1): string {
  const v = fromKg(kg, unit);
  return v == null ? '–' : `${num(v, digits)} ${unit}`;
}

/** Compact volume: 12 450 kg → "12.5k kg". */
export function volume(kg: number, unit: WeightUnit): string {
  const v = fromKg(kg, unit) ?? 0;
  return v >= 10000 ? `${num(v / 1000, 1)}k ${unit}` : `${num(v, 0)} ${unit}`;
}

export function duration(minutes: number | null | undefined): string {
  if (minutes == null) return '–';
  if (minutes < 1) return '<1 min';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? `${h}h ${m}m` : `${m} min`;
}

export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

export function friendlyDate(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return format(d, sameYear ? 'EEE d MMM' : 'd MMM yyyy');
}

export const ago = (iso: string) => formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });

/** "1.5 servings" / "150 g" for a food entry. */
export function servingLabel(quantity: number, servingSize: number, unit: string): string {
  if (unit === 'g' || unit === 'ml') return `${num(quantity * servingSize, 0)} ${unit}`;
  return `${num(quantity, 2)} × ${num(servingSize, 0)} ${unit}`;
}
