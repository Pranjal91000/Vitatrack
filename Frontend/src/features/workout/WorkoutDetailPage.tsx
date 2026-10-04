import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { BookmarkPlus, Pencil, Repeat, Trash2, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmSheet } from '@/components/ui/sheet';
import { ErrorState, Loading, Stat } from '@/components/ui/primitives';
import { useDeleteWorkout, useSaveAsRoutine, useWorkout } from '@/hooks/useWorkouts';
import { useSettings } from '@/store/settingsStore';
import { duration, parseDate, volume, weight } from '@/lib/format';
import { SET_TYPES } from '@/lib/constants';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { PersonalRecord, WeightUnit, WorkoutExerciseDto } from '@/types/api';
import { editSavedWorkout, startFromTemplate } from './startWorkout';
import { formatSet } from './session';

const RECORD_LABEL: Record<PersonalRecord['kind'], string> = {
  weight: 'Heaviest weight',
  oneRepMax: 'Best estimated 1RM',
  volume: 'Best set volume',
  reps: 'Most reps',
};

export default function WorkoutDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const location = useLocation();
  const justFinished = (location.state as { justFinished?: boolean } | null)?.justFinished;
  const unit = useSettings((s) => s.weightUnit);
  const { data: w, isLoading, error, refetch } = useWorkout(id);
  const del = useDeleteWorkout();
  const saveRoutine = useSaveAsRoutine();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <Loading />;
  if (error || !w) return <><PageHeader back title="Workout" /><ErrorState message={errorMessage(error)} onRetry={() => refetch()} /></>;

  const date = parseDate(w.date);

  return (
    <>
      <PageHeader back="/workout/history" large={false} title={w.name || 'Workout'} subtitle={format(date, 'EEEE d MMMM yyyy')} />

      {justFinished && (
        <div className="mb-4 rounded-2xl bg-primary p-5 text-primary-foreground animate-pop-in">
          <p className="font-display text-3xl font-semibold">Workout saved</p>
          <p className="opacity-90">
            {w.records.length
              ? `${w.records.length} new personal record${w.records.length > 1 ? 's' : ''}. Nice lifting.`
              : 'Logged and counted toward your week.'}
          </p>
        </div>
      )}

      <div className="card grid grid-cols-3 gap-3 p-4">
        <Stat label="Duration" value={duration(w.durationMinutes)} />
        <Stat label="Volume" value={volume(w.volume, unit)} />
        <Stat label="Sets" value={w.totalSets} />
      </div>

      {w.records.length > 0 && (
        <div className="card mt-3 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-xl"><Trophy className="h-5 w-5 text-warning" /> Personal records</h2>
          <ul className="space-y-2">
            {w.records.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{r.exerciseName}</span>
                  <span className="text-sm text-muted">{RECORD_LABEL[r.kind]}</span>
                </span>
                <span className="num shrink-0 text-right">
                  <span className="block font-display text-xl font-semibold">{r.kind === 'reps' ? `${r.value} reps` : weight(r.value, unit)}</span>
                  {r.previous != null && <span className="text-xs text-muted">was {r.kind === 'reps' ? r.previous : weight(r.previous, unit)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {w.notes && <p className="card mt-3 whitespace-pre-wrap p-4 text-[15px]">{w.notes}</p>}

      <div className="mt-3 space-y-3">
        {w.exercises.map((e) => <ExerciseSets key={e.id} e={e} unit={unit} />)}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => startFromTemplate(w, false) && navigate('/workout/active')}><Repeat /> Repeat</Button>
        <Button variant="secondary" onClick={() => editSavedWorkout(w) && navigate('/workout/active')}><Pencil /> Edit</Button>
        <Button variant="secondary" loading={saveRoutine.isPending} onClick={() => saveRoutine.mutate({ workoutId: w.id })}><BookmarkPlus /> Save as routine</Button>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 /> Delete</Button>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this workout?"
        description="Its sets will no longer count toward your records and progress."
        confirmLabel="Delete workout"
        destructive
        loading={del.isPending}
        onConfirm={async () => { await del.mutateAsync(w.id); navigate('/workout/history', { replace: true }); }}
      />
    </>
  );
}

function ExerciseSets({ e, unit }: { e: WorkoutExerciseDto; unit: WeightUnit }) {
  let n = 0;
  return (
    <section className="card p-4">
      <Link to={`/workout/exercises/${e.exerciseId}`} className="text-xl font-display font-semibold text-primary">{e.exerciseName}</Link>
      {e.notes && <p className="mt-1 text-sm text-muted">{e.notes}</p>}
      <ol className="mt-2 space-y-1">
        {e.sets.map((s) => {
          if (s.setType !== 1) n++;
          const t = SET_TYPES[s.setType];
          return (
            <li key={s.id} className="num flex items-center gap-3 text-[15px]">
              <span className={cn('w-6 text-center font-display text-lg font-semibold', t.className || 'text-muted')}>{t.short || n}</span>
              <span className="flex-1">{formatSet(s, e.measurementType, unit)}</span>
              {s.oneRepMax && s.setType !== 1 ? <span className="text-sm text-muted">1RM {weight(s.oneRepMax, unit, 0)}</span> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
