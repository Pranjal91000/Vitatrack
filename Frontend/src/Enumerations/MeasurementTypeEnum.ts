/** Mirrors VitaTrack.Core.Enums.MeasurementType */
export const MeasurementType = {
  WeightReps: 0,
  TimeDistance: 1,
  Other: 2,
  BodyweightReps: 3,
  TimedHold: 4,
  DistanceOnly: 5,
} as const;

export type MeasurementTypeValue = (typeof MeasurementType)[keyof typeof MeasurementType];

export const MEASUREMENT_TYPE_OPTIONS: { value: number; label: string; description: string }[] = [
  { value: 0, label: 'Weight & reps', description: 'Log load, repetitions, and RPE.' },
  { value: 1, label: 'Time & distance', description: 'Cardio-style: distance, duration, elevation.' },
  { value: 3, label: 'Bodyweight reps', description: 'Repetitions and RPE without bar load.' },
  { value: 4, label: 'Timed hold', description: 'Duration-focused sets (e.g. planks).' },
  { value: 5, label: 'Distance', description: 'Distance-first; optional time.' },
  { value: 2, label: 'Other / mixed', description: 'All fields available.' },
];
