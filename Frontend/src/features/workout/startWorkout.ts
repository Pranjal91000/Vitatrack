import { format } from 'date-fns';
import { toast } from 'sonner';
import { exercisesFromWorkout, useActiveWorkout } from '@/store/activeWorkoutStore';
import { useSettings } from '@/store/settingsStore';
import type { WorkoutDto } from '@/types/api';

function defaultName() {
  const h = new Date().getHours();
  return h < 12 ? 'Morning workout' : h < 17 ? 'Afternoon workout' : 'Evening workout';
}

/** Returns false (and explains why) if another session is already running. */
function guard(): boolean {
  if (useActiveWorkout.getState().active) {
    toast.error('A workout is already in progress. Finish or discard it first.');
    return false;
  }
  return true;
}

export function startEmptyWorkout(): boolean {
  if (!guard()) return false;
  useActiveWorkout.getState().start({ name: defaultName(), unit: useSettings.getState().weightUnit, exercises: [] });
  return true;
}

/** Routine or past workout → new session with its numbers as greyed-out targets. */
export function startFromTemplate(w: WorkoutDto, asRoutine: boolean): boolean {
  if (!guard()) return false;
  const { weightUnit, defaultRestSeconds } = useSettings.getState();
  useActiveWorkout.getState().start({
    name: w.name || defaultName(),
    unit: weightUnit,
    routineId: asRoutine ? w.id : undefined,
    exercises: exercisesFromWorkout(w, weightUnit, 'targets', defaultRestSeconds),
  });
  return true;
}

/** Load a saved workout into the logger to correct it. */
export function editSavedWorkout(w: WorkoutDto): boolean {
  if (!guard()) return false;
  const { weightUnit, defaultRestSeconds } = useSettings.getState();
  useActiveWorkout.getState().start({
    name: w.name || 'Workout',
    unit: weightUnit,
    notes: w.notes ?? '',
    startedAt: w.startedAt ?? new Date(`${w.date}T12:00:00`).toISOString(),
    editingId: w.id,
    editingDate: w.date ?? format(new Date(), 'yyyy-MM-dd'),
    exercises: exercisesFromWorkout(w, weightUnit, 'values', defaultRestSeconds),
  });
  return true;
}
