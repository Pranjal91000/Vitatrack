import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise, MeasurementType, SetType, WeightUnit, WorkoutDto } from '@/types/api';
import { uid } from '@/lib/utils';
import { fromKg } from '@/lib/format';

/**
 * The live session lives on the phone (localStorage) until "Finish", so a locked screen,
 * a refresh or a dropped connection in a basement gym never loses logged sets.
 * Input values are kept as strings in the unit the session was started with.
 */

export interface SetTarget { weight?: string; reps?: string; time?: string; distance?: string }

export interface ActiveSet {
  id: string;
  type: SetType;
  weight: string;
  reps: string;
  time: string; // seconds for holds, minutes for cardio
  distance: string; // km
  done: boolean;
  target?: SetTarget; // from a routine; shown as placeholder
}

export interface ActiveExercise {
  key: string;
  exerciseId: number;
  name: string;
  measurementType: MeasurementType;
  muscleGroups: string[];
  equipment: string | null;
  restSeconds: number;
  notes: string;
  sets: ActiveSet[];
}

export interface ActiveWorkout {
  name: string;
  startedAt: string; // ISO
  unit: WeightUnit;
  notes: string;
  routineId?: number;
  /** Set when an already-saved workout is being edited. */
  editingId?: number;
  editingDate?: string;
  exercises: ActiveExercise[];
}

export interface RestTimer {
  endsAt: number;
  total: number;
  label: string;
}

const emptySet = (prev?: ActiveSet): ActiveSet => ({
  id: uid(),
  type: prev?.type === 1 ? 0 : (prev?.type ?? 0),
  // Carry the last set's numbers forward: most lifters repeat the same weight.
  weight: prev?.weight ?? '',
  reps: prev?.reps ?? '',
  time: prev?.time ?? '',
  distance: prev?.distance ?? '',
  done: false,
  target: prev?.target,
});

interface State {
  active: ActiveWorkout | null;
  rest: RestTimer | null;

  start: (w: Omit<ActiveWorkout, 'startedAt' | 'notes'> & { startedAt?: string; notes?: string }) => void;
  discard: () => void;
  update: (patch: Partial<Pick<ActiveWorkout, 'name' | 'notes' | 'startedAt'>>) => void;

  addExercises: (list: Exercise[], restSeconds: number) => void;
  replaceExercise: (key: string, ex: Exercise) => void;
  removeExercise: (key: string) => void;
  moveExercise: (key: string, dir: -1 | 1) => void;
  updateExercise: (key: string, patch: Partial<Pick<ActiveExercise, 'notes' | 'restSeconds'>>) => void;

  addSet: (key: string) => void;
  removeSet: (key: string, setId: string) => void;
  updateSet: (key: string, setId: string, patch: Partial<ActiveSet>) => void;

  startRest: (seconds: number, label: string) => void;
  adjustRest: (delta: number) => void;
  stopRest: () => void;
}

const mapEx = (s: State, key: string, fn: (e: ActiveExercise) => ActiveExercise | null) => {
  if (!s.active) return s;
  const exercises = s.active.exercises.map((e) => (e.key === key ? fn(e) : e)).filter(Boolean) as ActiveExercise[];
  return { active: { ...s.active, exercises } };
};

export const useActiveWorkout = create<State>()(
  persist(
    (set) => ({
      active: null,
      rest: null,

      start: (w) =>
        set({
          active: { notes: '', startedAt: new Date().toISOString(), ...w },
          rest: null,
        }),
      discard: () => set({ active: null, rest: null }),
      update: (patch) => set((s) => (s.active ? { active: { ...s.active, ...patch } } : s)),

      addExercises: (list, restSeconds) =>
        set((s) => {
          if (!s.active) return s;
          const added: ActiveExercise[] = list.map((e) => ({
            key: uid(),
            exerciseId: e.id,
            name: e.name,
            measurementType: e.measurementType,
            muscleGroups: e.muscleGroups,
            equipment: e.equipment,
            restSeconds,
            notes: '',
            sets: [emptySet(), emptySet(), emptySet()],
          }));
          return { active: { ...s.active, exercises: [...s.active.exercises, ...added] } };
        }),

      replaceExercise: (key, e) =>
        set((s) =>
          mapEx(s, key, (x) => ({
            ...x,
            exerciseId: e.id,
            name: e.name,
            measurementType: e.measurementType,
            muscleGroups: e.muscleGroups,
            equipment: e.equipment,
            sets: x.sets.map((st) => ({ ...st, target: undefined })),
          })),
        ),

      removeExercise: (key) => set((s) => mapEx(s, key, () => null)),

      moveExercise: (key, dir) =>
        set((s) => {
          if (!s.active) return s;
          const list = [...s.active.exercises];
          const i = list.findIndex((e) => e.key === key);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= list.length) return s;
          [list[i], list[j]] = [list[j], list[i]];
          return { active: { ...s.active, exercises: list } };
        }),

      updateExercise: (key, patch) => set((s) => mapEx(s, key, (e) => ({ ...e, ...patch }))),

      addSet: (key) => set((s) => mapEx(s, key, (e) => ({ ...e, sets: [...e.sets, emptySet(e.sets[e.sets.length - 1])] }))),

      removeSet: (key, setId) => set((s) => mapEx(s, key, (e) => ({ ...e, sets: e.sets.filter((x) => x.id !== setId) }))),

      updateSet: (key, setId, patch) =>
        set((s) => mapEx(s, key, (e) => ({ ...e, sets: e.sets.map((x) => (x.id === setId ? { ...x, ...patch } : x)) }))),

      startRest: (seconds, label) =>
        set({ rest: seconds > 0 ? { endsAt: Date.now() + seconds * 1000, total: seconds, label } : null }),
      adjustRest: (delta) =>
        set((s) => {
          if (!s.rest) return s;
          const endsAt = Math.max(Date.now() + 1000, s.rest.endsAt + delta * 1000);
          return { rest: { ...s.rest, endsAt, total: Math.max(s.rest.total + delta, 1) } };
        }),
      stopRest: () => set({ rest: null }),
    }),
    { name: 'vt-active-workout' },
  ),
);

/** Build session exercises from a routine or a past workout (values become targets or actual values). */
export function exercisesFromWorkout(
  w: WorkoutDto,
  unit: WeightUnit,
  mode: 'targets' | 'values',
  defaultRest: number,
): ActiveExercise[] {
  return w.exercises.map((we) => {
    const isCardio = we.measurementType === 1 || we.measurementType === 5;
    const sets = (we.sets.length ? we.sets : [null, null, null]).map((s) => {
      const vals: SetTarget = s
        ? {
            weight: s.weightKg != null ? String(fromKg(s.weightKg, unit)) : '',
            reps: s.reps != null ? String(s.reps) : '',
            time: s.durationSeconds != null ? String(isCardio ? Math.round(s.durationSeconds / 6) / 10 : s.durationSeconds) : '',
            distance: s.distanceKm != null ? String(s.distanceKm) : '',
          }
        : {};
      const base: ActiveSet = { id: uid(), type: s?.setType ?? 0, weight: '', reps: '', time: '', distance: '', done: false };
      return mode === 'targets'
        ? { ...base, target: vals }
        : { ...base, weight: vals.weight ?? '', reps: vals.reps ?? '', time: vals.time ?? '', distance: vals.distance ?? '', done: s?.isCompleted ?? true };
    });
    return {
      key: uid(),
      exerciseId: we.exerciseId,
      name: we.exerciseName,
      measurementType: we.measurementType,
      muscleGroups: we.muscleGroups,
      equipment: we.equipment,
      restSeconds: we.restSeconds ?? defaultRest,
      notes: we.notes ?? '',
      sets,
    };
  });
}
