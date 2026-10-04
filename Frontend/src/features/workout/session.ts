import { format } from 'date-fns';
import type { ActiveWorkout, ActiveSet, ActiveExercise } from '@/store/activeWorkoutStore';
import type { CreateWorkoutRequest, LastPerformance, MeasurementType, SetDto, WeightUnit } from '@/types/api';
import { fromKg, num, toKg, weight } from '@/lib/format';
import { setFields } from '@/lib/constants';

const n = (v: string | undefined) => {
  if (v == null || v.trim() === '') return null;
  const x = Number(v.replace(',', '.'));
  return Number.isFinite(x) ? x : null;
};

export interface Placeholder { weight: string; reps: string; time: string; distance: string }

/** What a set row shows greyed out: routine target first, otherwise the matching set from last time. */
export function placeholderFor(ex: ActiveExercise, set: ActiveSet, index: number, last: LastPerformance | undefined, unit: WeightUnit): Placeholder {
  const t = set.target;
  const isCardio = ex.measurementType === 1 || ex.measurementType === 5;
  const prev: SetDto | undefined = last?.sets.filter((s) => s.isCompleted)[index];
  return {
    weight: t?.weight || (prev?.weightKg != null ? String(fromKg(prev.weightKg, unit)) : ''),
    reps: t?.reps || (prev?.reps != null ? String(prev.reps) : ''),
    time: t?.time || (prev?.durationSeconds != null ? String(isCardio ? Math.round(prev.durationSeconds / 6) / 10 : prev.durationSeconds) : ''),
    distance: t?.distance || (prev?.distanceKm != null ? String(prev.distanceKm) : ''),
  };
}

/** Label for the "Previous" column, e.g. "60 × 8". */
export function previousLabel(ex: ActiveExercise, index: number, last: LastPerformance | undefined, unit: WeightUnit): string {
  const prev = last?.sets.filter((s) => s.isCompleted)[index];
  if (!prev) return '—';
  const f = setFields(ex.measurementType);
  if (f.distance) return `${prev.distanceKm ?? 0} km`;
  if (f.time && !f.reps) return `${prev.durationSeconds ?? 0}s`;
  if (!f.weight) return `${prev.reps ?? 0} reps`;
  return `${fromKg(prev.weightKg, unit) ?? 0} × ${prev.reps ?? 0}`;
}

/** True when the set has the values its exercise type needs (typed or via placeholder). */
export function isSetFillable(ex: ActiveExercise, s: ActiveSet, ph: Placeholder): boolean {
  const f = setFields(ex.measurementType);
  const v = (a: string, b: string) => n(a) ?? n(b);
  if (f.weight && v(s.weight, ph.weight) == null) return false;
  if (f.reps && v(s.reps, ph.reps) == null) return false;
  if (f.distance && v(s.distance, ph.distance) == null && v(s.time, ph.time) == null) return false;
  if (f.time && !f.distance && v(s.time, ph.time) == null) return false;
  return true;
}

export function countSets(w: ActiveWorkout) {
  let done = 0, open = 0;
  for (const e of w.exercises) for (const s of e.sets) { if (s.done) done++; else open++; }
  return { done, open };
}

export function sessionVolumeKg(w: ActiveWorkout): number {
  let v = 0;
  for (const e of w.exercises) {
    if (!setFields(e.measurementType).weight) continue;
    for (const s of e.sets) {
      if (!s.done || s.type === 1) continue;
      v += toKg(n(s.weight) ?? 0, w.unit) * (n(s.reps) ?? 0);
    }
  }
  return v;
}

/** Convert the on-device session into the API request. Only ticked sets are saved. */
export function buildWorkoutRequest(w: ActiveWorkout, endedAt = new Date()): CreateWorkoutRequest {
  const started = new Date(w.startedAt);
  const minutes = Math.max(1, Math.round((endedAt.getTime() - started.getTime()) / 60000));

  return {
    date: w.editingDate ?? format(started, 'yyyy-MM-dd'),
    name: w.name.trim() || 'Workout',
    notes: w.notes.trim() || null,
    startedAt: w.editingId ? null : started.toISOString(),
    endedAt: w.editingId ? null : endedAt.toISOString(),
    durationMinutes: w.editingId ? null : minutes,
    exercises: w.exercises
      .map((e) => {
        const f = setFields(e.measurementType);
        const isCardioMinutes = f.timeUnit === 'min';
        const sets = e.sets
          .filter((s) => s.done)
          .map((s, i) => {
            const time = n(s.time);
            return {
              setNumber: i + 1,
              setType: s.type,
              isCompleted: true,
              weightKg: f.weight && n(s.weight) != null ? toKg(n(s.weight)!, w.unit) : null,
              reps: f.reps ? n(s.reps) : null,
              durationSeconds: time != null ? Math.round(isCardioMinutes ? time * 60 : time) : null,
              distanceKm: f.distance ? n(s.distance) : null,
            };
          });
        return { exerciseId: e.exerciseId, notes: e.notes.trim() || null, restSeconds: e.restSeconds, sets };
      })
      .filter((e) => e.sets.length > 0),
  };
}

export { n as parseNum };

export function formatSet(s: SetDto, measurementType: MeasurementType, unit: WeightUnit): string {
  const f = setFields(measurementType);
  if (f.distance) return `${num(s.distanceKm, 2)} km${s.durationSeconds ? ` in ${Math.round(s.durationSeconds / 60)} min` : ''}`;
  if (f.time && !f.reps) return `${s.durationSeconds ?? 0} s`;
  if (!f.weight) return `${s.reps ?? 0} reps`;
  return `${weight(s.weightKg, unit)} × ${s.reps ?? 0}`;
}
