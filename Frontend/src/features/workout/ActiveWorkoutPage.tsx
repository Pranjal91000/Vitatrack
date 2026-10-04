import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChevronDown, Dumbbell, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmSheet, Sheet } from '@/components/ui/sheet';
import { Empty, Field, Input } from '@/components/ui/primitives';
import { useActiveWorkout } from '@/store/activeWorkoutStore';
import { useSettings } from '@/store/settingsStore';
import { useLastPerformance, useSaveWorkout } from '@/hooks/useWorkouts';
import { clock, duration, volume } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import { ExerciseBlock } from './ExerciseBlock';
import { ExercisePicker } from './ExerciseSheets';
import { RestTimerBar } from './RestTimerBar';
import { useElapsed, useWakeLock } from './useTimers';
import { buildWorkoutRequest, countSets, sessionVolumeKg } from './session';

export default function ActiveWorkoutPage() {
  const active = useActiveWorkout((s) => s.active);
  const rest = useActiveWorkout((s) => s.rest);
  const { update, addExercises, discard } = useActiveWorkout.getState();
  const defaultRest = useSettings((s) => s.defaultRestSeconds);
  const navigate = useNavigate();
  const elapsed = useElapsed(active?.editingId ? undefined : active?.startedAt);
  const save = useSaveWorkout();

  const [picking, setPicking] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [renaming, setRenaming] = useState(false);

  useWakeLock(!!active);

  const ids = useMemo(() => [...new Set(active?.exercises.map((e) => e.exerciseId) ?? [])], [active?.exercises]);
  const { data: last } = useLastPerformance(ids);

  if (!active) return <Navigate to="/workout" replace />;

  const { done, open } = countSets(active);
  const vol = sessionVolumeKg(active);
  const editing = !!active.editingId;

  const finish = async () => {
    const body = buildWorkoutRequest(active);
    if (!body.exercises.length) {
      toast.error('Tick off at least one set before finishing.');
      setFinishing(false);
      return;
    }
    try {
      const saved = await save.mutateAsync({ id: active.editingId, body });
      discard();
      navigate(`/workout/history/${saved.id}`, { replace: true, state: { justFinished: !editing, records: saved.records } });
    } catch (e) {
      toast.error(`Not saved: ${errorMessage(e)} Your sets are still on this phone — try again.`);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-2xl lg:max-w-4xl px-3 sm:px-6 lg:px-8" style={{ paddingBottom: rest ? '8.5rem' : '3rem' }}>
      <header className="sticky top-0 z-30 -mx-3 sm:-mx-6 lg:-mx-8 bg-background/90 px-3 sm:px-6 lg:px-8 pb-3 pt-[calc(var(--safe-top)+0.5rem)] backdrop-blur border-b border-transparent lg:border-line/40">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-raised" aria-label="Minimise workout">
            <ChevronDown className="h-7 w-7" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <div className="num font-display text-2xl font-semibold leading-none">{editing ? 'Editing' : clock(elapsed)}</div>
            <div className="num text-xs text-muted">{done} sets · {volume(vol, active.unit)}</div>
          </div>
          <Button variant="success" onClick={() => setFinishing(true)}>{editing ? 'Save' : 'Finish'}</Button>
        </div>
      </header>

      <button onClick={() => setRenaming(true)} className="group mb-3 mt-2 flex items-center gap-2 px-1 text-left">
        <h1 className="text-[30px] leading-tight">{active.name}</h1>
        <Pencil className="h-4 w-4 text-muted" />
      </button>

      {active.exercises.length === 0 ? (
        <div className="card">
          <Empty
            icon={<Dumbbell />}
            title="Add your first exercise"
            body="Pick from 80+ exercises or create your own. The weights you lifted last time show up next to each set."
            action={<Button size="lg" onClick={() => setPicking(true)}><Plus /> Add exercises</Button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {active.exercises.map((ex, i) => (
            <ExerciseBlock key={ex.key} exercise={ex} index={i} count={active.exercises.length} unit={active.unit} last={last?.[ex.exerciseId]} />
          ))}
          <Button size="lg" variant="secondary" className="w-full text-primary" onClick={() => setPicking(true)}>
            <Plus /> Add exercises
          </Button>
        </div>
      )}

      <button onClick={() => setConfirmDiscard(true)} className="mx-auto mt-8 block h-11 px-4 font-semibold text-destructive">
        {editing ? 'Cancel editing' : 'Discard workout'}
      </button>

      <RestTimerBar />

      <ExercisePicker open={picking} onOpenChange={setPicking} onPick={(list) => addExercises(list, defaultRest)} />

      <Sheet open={renaming} onOpenChange={setRenaming} title="Workout details">
        <div className="space-y-4">
          <Field label="Name">
            <Input value={active.name} onChange={(e) => update({ name: e.target.value })} />
          </Field>
          <Field label="Notes">
            <textarea
              value={active.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={3}
              className="field h-auto py-3"
              placeholder="Energy, sleep, anything worth remembering"
            />
          </Field>
          <Button className="w-full" onClick={() => setRenaming(false)}>Done</Button>
        </div>
      </Sheet>

      <Sheet
        open={finishing}
        onOpenChange={setFinishing}
        title={editing ? 'Save changes?' : 'Finish workout?'}
        footer={
          <div className="grid gap-2">
            <Button size="lg" variant="success" loading={save.isPending} onClick={finish}>
              {editing ? 'Save changes' : 'Save workout'}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setFinishing(false)}>Keep logging</Button>
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-raised/60 p-4 text-center">
          <div><div className="num font-display text-2xl font-semibold">{editing ? '—' : duration(Math.round(elapsed / 60))}</div><div className="text-xs text-muted">Duration</div></div>
          <div><div className="num font-display text-2xl font-semibold">{done}</div><div className="text-xs text-muted">Sets</div></div>
          <div><div className="num font-display text-2xl font-semibold">{volume(vol, active.unit)}</div><div className="text-xs text-muted">Volume</div></div>
        </div>
        {open > 0 && (
          <p className="mt-3 rounded-xl bg-warning/15 px-4 py-3 text-sm">
            {open} unticked set{open > 1 ? 's' : ''} won’t be saved. Tick them first if you did them.
          </p>
        )}
        <Field label="Name" className="mt-4">
          <Input value={active.name} onChange={(e) => update({ name: e.target.value })} />
        </Field>
      </Sheet>

      <ConfirmSheet
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title={editing ? 'Cancel editing?' : 'Discard this workout?'}
        description={editing ? 'Changes since you started editing will be lost.' : 'All sets logged in this session will be deleted from this phone.'}
        confirmLabel={editing ? 'Cancel editing' : 'Discard workout'}
        destructive
        onConfirm={() => { discard(); setConfirmDiscard(false); navigate('/workout', { replace: true }); }}
      />
    </div>
  );
}
