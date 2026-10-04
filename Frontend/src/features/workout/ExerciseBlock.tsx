import { useState } from 'react';
import { ArrowDown, ArrowUp, MoreHorizontal, Plus, Repeat, StickyNote, Timer, Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Chip, MenuItem } from '@/components/ui/primitives';
import { useActiveWorkout, type ActiveExercise, type ActiveSet } from '@/store/activeWorkoutStore';
import { REST_PRESETS, SET_TYPES, setFields } from '@/lib/constants';
import { clock } from '@/lib/format';
import { vibrate } from '@/lib/utils';
import type { LastPerformance, SetType, WeightUnit } from '@/types/api';
import { SetRow } from './SetRow';
import { isSetFillable, placeholderFor, previousLabel } from './session';
import { ExercisePicker } from './ExerciseSheets';
import { primeAudio } from './useTimers';
import { toast } from 'sonner';

interface Props {
  exercise: ActiveExercise;
  index: number;
  count: number;
  unit: WeightUnit;
  last?: LastPerformance;
}

export function ExerciseBlock({ exercise, index, count, unit, last }: Props) {
  const { updateSet, addSet, removeSet, startRest, updateExercise, moveExercise, removeExercise, replaceExercise } = useActiveWorkout.getState();
  const [menu, setMenu] = useState(false);
  const [setMenuFor, setSetMenuFor] = useState<ActiveSet | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const f = setFields(exercise.measurementType);

  let working = 0;
  const nextLabel = (fromIndex: number) => {
    const nextOpen = exercise.sets.slice(fromIndex + 1).find((s) => !s.done);
    return nextOpen ? `${exercise.name}` : 'next exercise';
  };

  const toggle = (set: ActiveSet, i: number) => {
    primeAudio();
    if (set.done) {
      updateSet(exercise.key, set.id, { done: false });
      return;
    }
    const ph = placeholderFor(exercise, set, i, last, unit);
    if (!isSetFillable(exercise, set, ph)) {
      toast.error(f.reps ? 'Enter the reps first' : f.weight ? 'Enter the weight first' : 'Enter a value first');
      return;
    }
    updateSet(exercise.key, set.id, {
      done: true,
      weight: set.weight || ph.weight,
      reps: set.reps || ph.reps,
      time: set.time || ph.time,
      distance: set.distance || ph.distance,
    });
    vibrate(25);
    if (exercise.restSeconds > 0) startRest(exercise.restSeconds, nextLabel(i));
  };

  const copyPrevious = (set: ActiveSet, i: number) => {
    const ph = placeholderFor(exercise, set, i, last, unit);
    updateSet(exercise.key, set.id, { weight: ph.weight, reps: ph.reps, time: ph.time, distance: ph.distance });
  };

  return (
    <section className="card p-3" aria-label={exercise.name}>
      <div className="flex items-start gap-2 px-1.5 pb-1">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[22px] leading-tight text-primary">{exercise.name}</h3>
          <button onClick={() => setMenu(true)} className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <Timer className="h-4 w-4" /> {exercise.restSeconds ? `Rest ${clock(exercise.restSeconds)}` : 'No rest timer'}
          </button>
        </div>
        <button onClick={() => setMenu(true)} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-raised" aria-label="Exercise options">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      {(exercise.notes || editingNotes) && (
        <textarea
          autoFocus={editingNotes && !exercise.notes}
          value={exercise.notes}
          onChange={(e) => updateExercise(exercise.key, { notes: e.target.value })}
          onBlur={() => setEditingNotes(false)}
          placeholder="Seat height, grip, how it felt…"
          rows={2}
          className="mx-1.5 mb-2 w-[calc(100%-0.75rem)] resize-none rounded-lg bg-warning/10 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
      )}

      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.75rem_4.25rem_2.75rem] gap-2 px-1.5 pb-1 text-xs font-semibold text-muted">
        <span className="text-center">Set</span>
        <span>Previous</span>
        <span className="text-center">{f.weight ? unit : f.distance ? 'km' : ''}</span>
        <span className="text-center">{f.reps ? 'Reps' : f.time ? f.timeUnit : ''}</span>
        <span />
      </div>

      <div className="space-y-1">
        {exercise.sets.map((set, i) => {
          if (set.type !== 1) working++;
          const ph = placeholderFor(exercise, set, i, last, unit);
          return (
            <SetRow
              key={set.id}
              exercise={exercise}
              set={set}
              number={working}
              previous={previousLabel(exercise, i, last, unit)}
              placeholder={ph}
              canComplete={isSetFillable(exercise, set, ph)}
              onChange={(patch) => updateSet(exercise.key, set.id, patch)}
              onToggleDone={() => toggle(set, i)}
              onOpenMenu={() => setSetMenuFor(set)}
              onUsePrevious={() => copyPrevious(set, i)}
            />
          );
        })}
      </div>

      <button
        onClick={() => addSet(exercise.key)}
        className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-raised font-semibold"
      >
        <Plus className="h-5 w-5" /> Add set
      </button>

      {/* Exercise options */}
      <Sheet open={menu} onOpenChange={setMenu} title={exercise.name}>
        <div className="space-y-5">
          <div>
            <span className="label">Rest timer after each set</span>
            <div className="flex flex-wrap gap-2">
              <Chip active={exercise.restSeconds === 0} onClick={() => updateExercise(exercise.key, { restSeconds: 0 })}>Off</Chip>
              {REST_PRESETS.map((s) => (
                <Chip key={s} active={exercise.restSeconds === s} onClick={() => updateExercise(exercise.key, { restSeconds: s })}>
                  {clock(s)}
                </Chip>
              ))}
            </div>
          </div>
          <div className="divide-y divide-line overflow-hidden rounded-xl bg-raised/50">
            <MenuItem icon={<StickyNote />} label={exercise.notes ? 'Edit note' : 'Add note'} onClick={() => { setMenu(false); setEditingNotes(true); }} />
            <MenuItem icon={<Repeat />} label="Replace exercise" onClick={() => { setMenu(false); setReplacing(true); }} />
            {index > 0 && <MenuItem icon={<ArrowUp />} label="Move up" onClick={() => { moveExercise(exercise.key, -1); setMenu(false); }} />}
            {index < count - 1 && <MenuItem icon={<ArrowDown />} label="Move down" onClick={() => { moveExercise(exercise.key, 1); setMenu(false); }} />}
            <MenuItem icon={<Trash2 />} label="Remove exercise" danger onClick={() => { removeExercise(exercise.key); setMenu(false); }} />
          </div>
        </div>
      </Sheet>

      {/* Set options */}
      <Sheet open={!!setMenuFor} onOpenChange={(o) => !o && setSetMenuFor(null)} title="Set type" description="Warm-ups don’t count toward volume or records.">
        <div className="divide-y divide-line overflow-hidden rounded-xl bg-raised/50">
          {([0, 1, 2, 3] as SetType[]).map((t) => (
            <MenuItem
              key={t}
              icon={<span className={`w-5 text-center font-display text-lg font-bold ${SET_TYPES[t].className}`}>{SET_TYPES[t].short || '#'}</span>}
              label={SET_TYPES[t].label}
              active={setMenuFor?.type === t}
              onClick={() => { if (setMenuFor) updateSet(exercise.key, setMenuFor.id, { type: t }); setSetMenuFor(null); }}
            />
          ))}
          <MenuItem
            icon={<Trash2 />}
            label="Delete set"
            danger
            onClick={() => { if (setMenuFor) removeSet(exercise.key, setMenuFor.id); setSetMenuFor(null); }}
          />
        </div>
      </Sheet>

      <ExercisePicker open={replacing} onOpenChange={setReplacing} multi={false} onPick={([e]) => e && replaceExercise(exercise.key, e)} />
    </section>
  );
}
