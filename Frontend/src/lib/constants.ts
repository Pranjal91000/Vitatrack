import type { MeasurementType, SetType } from '@/types/api';

export const MUSCLES = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Full body', 'Cardio',
] as const;

export const EQUIPMENT = [
  'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'EZ bar', 'Smith machine', 'Band', 'Cardio machine', 'None',
] as const;

export const MEASUREMENT_OPTIONS: { value: MeasurementType; label: string; hint: string }[] = [
  { value: 0, label: 'Weight × reps', hint: 'Barbell, dumbbell, machine lifts' },
  { value: 3, label: 'Reps only', hint: 'Push-ups, pull-ups, crunches' },
  { value: 4, label: 'Time', hint: 'Planks, holds, jump rope' },
  { value: 1, label: 'Distance & time', hint: 'Running, rowing, cycling' },
];

export const SET_TYPES: Record<SetType, { short: string; label: string; className: string }> = {
  0: { short: '', label: 'Normal set', className: '' },
  1: { short: 'W', label: 'Warm-up', className: 'text-warning' },
  2: { short: 'D', label: 'Drop set', className: 'text-primary' },
  3: { short: 'F', label: 'Failure', className: 'text-destructive' },
};

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Desk job, little exercise' },
  { value: 1.375, label: 'Light — training 1–3 days a week' },
  { value: 1.55, label: 'Moderate — training 3–5 days a week' },
  { value: 1.725, label: 'Very active — training 6–7 days a week' },
  { value: 1.9, label: 'Athlete or physical job + training' },
];

export const REST_PRESETS = [30, 60, 90, 120, 150, 180, 240, 300];

/** Which inputs a set row shows for an exercise. */
export function setFields(m: MeasurementType) {
  switch (m) {
    case 1:
    case 5:
      return { weight: false, reps: false, time: true, distance: true, timeUnit: 'min' as const };
    case 3:
      return { weight: false, reps: true, time: false, distance: false, timeUnit: 'sec' as const };
    case 4:
      return { weight: false, reps: false, time: true, distance: false, timeUnit: 'sec' as const };
    default:
      return { weight: true, reps: true, time: false, distance: false, timeUnit: 'sec' as const };
  }
}
