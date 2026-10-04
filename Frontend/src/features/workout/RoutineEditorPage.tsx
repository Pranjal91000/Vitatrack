import { useState } from 'react';
import { useOnChange } from '@/lib/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmSheet } from '@/components/ui/sheet';
import { Empty, Field, Input, Loading, Select } from '@/components/ui/primitives';
import { useDeleteRoutine, useRoutine, useSaveRoutine } from '@/hooks/useWorkouts';
import { useSettings } from '@/store/settingsStore';
import { REST_PRESETS, setFields } from '@/lib/constants';
import { clock, fromKg, toKg } from '@/lib/format';
import { uid } from '@/lib/utils';
import type { Exercise, MeasurementType } from '@/types/api';
import { ExercisePicker } from './ExerciseSheets';
import { parseNum } from './session';

interface DraftSet { id: string; weight: string; reps: string; time: string; distance: string }
interface DraftExercise { key: string; exerciseId: number; name: string; measurementType: MeasurementType; restSeconds: number; sets: DraftSet[] }

const blankSet = (prev?: DraftSet): DraftSet => ({ id: uid(), weight: prev?.weight ?? '', reps: prev?.reps ?? '', time: prev?.time ?? '', distance: prev?.distance ?? '' });

export default function RoutineEditorPage() {
  const { id } = useParams();
  const routineId = id && id !== 'new' ? Number(id) : 0;
  const navigate = useNavigate();
  const { weightUnit: unit, defaultRestSeconds } = useSettings();
  const { data, isLoading } = useRoutine(routineId);
  const save = useSaveRoutine();
  const del = useDeleteRoutine();

  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [picking, setPicking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useOnChange(data?.id, () => {
    if (!data) return;
    setName(data.name ?? '');
    setExercises(
      data.exercises.map((e) => {
        const cardio = e.measurementType === 1 || e.measurementType === 5;
        return {
          key: uid(),
          exerciseId: e.exerciseId,
          name: e.exerciseName,
          measurementType: e.measurementType,
          restSeconds: e.restSeconds ?? defaultRestSeconds,
          sets: e.sets.map((s) => ({
            id: uid(),
            weight: s.weightKg != null ? String(fromKg(s.weightKg, unit)) : '',
            reps: s.reps != null ? String(s.reps) : '',
            time: s.durationSeconds != null ? String(cardio ? s.durationSeconds / 60 : s.durationSeconds) : '',
            distance: s.distanceKm != null ? String(s.distanceKm) : '',
          })),
        };
      }),
    );
  });

  const add = (list: Exercise[]) =>
    setExercises((xs) => [
      ...xs,
      ...list.map((e) => ({ key: uid(), exerciseId: e.id, name: e.name, measurementType: e.measurementType, restSeconds: defaultRestSeconds, sets: [blankSet(), blankSet(), blankSet()] })),
    ]);

  const patchEx = (key: string, fn: (e: DraftExercise) => DraftExercise) => setExercises((xs) => xs.map((e) => (e.key === key ? fn(e) : e)));

  const submit = async () => {
    const body = {
      name: name.trim(),
      exercises: exercises.map((e) => {
        const f = setFields(e.measurementType);
        return {
          exerciseId: e.exerciseId,
          restSeconds: e.restSeconds,
          sets: e.sets.map((s, i) => {
            const t = parseNum(s.time);
            return {
              setNumber: i + 1,
              setType: 0 as const,
              isCompleted: true,
              weightKg: f.weight && parseNum(s.weight) != null ? toKg(parseNum(s.weight)!, unit) : null,
              reps: f.reps ? parseNum(s.reps) : null,
              durationSeconds: t != null ? Math.round(f.timeUnit === 'min' ? t * 60 : t) : null,
              distanceKm: f.distance ? parseNum(s.distance) : null,
            };
          }),
        };
      }),
    };
    await save.mutateAsync({ id: routineId || undefined, body });
    if (routineId) navigate(-1);
    else navigate('/workout', { replace: true });
  };

  if (routineId && isLoading) return <Loading />;

  return (
    <>
      <PageHeader
        back
        large={false}
        title={routineId ? 'Edit routine' : 'New routine'}
        actions={
          <Button size="sm" disabled={!name.trim() || !exercises.length} loading={save.isPending} onClick={submit}>
            Save
          </Button>
        }
      />

      <Field label="Routine name">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push day" autoFocus={!routineId} />
      </Field>

      <p className="mt-3 px-1 text-sm text-muted">
        Weights and reps here are targets — they appear greyed out when you start the routine, and you can still change them set by set.
      </p>

      <div className="mt-4 space-y-3">
        {exercises.length === 0 && (
          <div className="card"><Empty title="No exercises yet" body="Add the exercises you do in this session, in order." /></div>
        )}
        {exercises.map((ex) => {
          const f = setFields(ex.measurementType);
          return (
            <section key={ex.key} className="card p-3">
              <div className="flex items-center gap-2 px-1">
                <h3 className="min-w-0 flex-1 truncate text-xl text-primary">{ex.name}</h3>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-raised"
                  onClick={() => setExercises((xs) => xs.filter((x) => x.key !== ex.key))}
                  aria-label="Remove exercise"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2 px-1">
                <span className="text-sm text-muted">Rest</span>
                <Select
                  className="h-9 w-28 text-sm"
                  value={ex.restSeconds}
                  onChange={(e) => patchEx(ex.key, (x) => ({ ...x, restSeconds: Number(e.target.value) }))}
                >
                  <option value={0}>Off</option>
                  {REST_PRESETS.map((s) => <option key={s} value={s}>{clock(s)}</option>)}
                </Select>
              </div>
              <div className="mt-2 grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 px-1 text-xs font-semibold text-muted">
                <span>Set</span>
                <span className="text-center">{f.weight ? unit : f.distance ? 'km' : ''}</span>
                <span className="text-center">{f.reps ? 'Reps' : f.time ? f.timeUnit : ''}</span>
                <span />
              </div>
              {ex.sets.map((s, i) => {
                const setVal = (k: keyof DraftSet, v: string) => patchEx(ex.key, (x) => ({ ...x, sets: x.sets.map((y) => (y.id === s.id ? { ...y, [k]: v } : y)) }));
                const left: keyof DraftSet = f.weight ? 'weight' : 'distance';
                const right: keyof DraftSet = f.reps ? 'reps' : 'time';
                return (
                  <div key={s.id} className="mt-1 grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 px-1">
                    <span className="num text-center font-display text-lg font-semibold">{i + 1}</span>
                    {f.weight || f.distance ? (
                      <input className="num h-11 rounded-lg bg-raised text-center text-[17px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary" inputMode="decimal" value={s[left]} onChange={(e) => setVal(left, e.target.value)} placeholder="–" />
                    ) : <span />}
                    {f.reps || f.time ? (
                      <input className="num h-11 rounded-lg bg-raised text-center text-[17px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary" inputMode="decimal" value={s[right]} onChange={(e) => setVal(right, e.target.value)} placeholder="–" />
                    ) : <span />}
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-raised"
                      onClick={() => patchEx(ex.key, (x) => ({ ...x, sets: x.sets.filter((y) => y.id !== s.id) }))}
                      aria-label="Remove set"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => patchEx(ex.key, (x) => ({ ...x, sets: [...x.sets, blankSet(x.sets[x.sets.length - 1])] }))}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-raised text-sm font-semibold"
              >
                <Plus className="h-4 w-4" /> Add set
              </button>
            </section>
          );
        })}
        <Button size="lg" variant="secondary" className="w-full text-primary" onClick={() => setPicking(true)}>
          <Plus /> Add exercises
        </Button>
        {routineId > 0 && (
          <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
            <Trash2 /> Delete routine
          </Button>
        )}
      </div>

      <ExercisePicker open={picking} onOpenChange={setPicking} onPick={add} />
      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this routine?"
        description="Workouts you already logged from it are kept."
        confirmLabel="Delete routine"
        destructive
        loading={del.isPending}
        onConfirm={async () => { await del.mutateAsync(routineId); navigate('/workout', { replace: true }); }}
      />
    </>
  );
}
