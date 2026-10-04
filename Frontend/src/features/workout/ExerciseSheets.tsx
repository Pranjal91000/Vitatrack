import { useState } from 'react';
import { useOnChange } from '@/lib/hooks';
import { useFilteredExercises } from './useFilteredExercises';
import { Check, Plus, Search } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Chip, Empty, Field, Input, Loading, Select } from '@/components/ui/primitives';
import { useCreateExercise, useUpdateExercise } from '@/hooks/useWorkouts';
import { EQUIPMENT, MEASUREMENT_OPTIONS, MUSCLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Exercise, MeasurementType } from '@/types/api';

export function MuscleFilter({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
      <Chip active={!value} onClick={() => onChange(null)}>All</Chip>
      {MUSCLES.map((m) => (
        <Chip key={m} active={value === m} onClick={() => onChange(value === m ? null : m)}>{m}</Chip>
      ))}
      <Chip active={value === 'Custom'} onClick={() => onChange(value === 'Custom' ? null : 'Custom')}>My exercises</Chip>
    </div>
  );
}

export function ExerciseRow({ e, selected, onClick, trailing }: { e: Exercise; selected?: boolean; onClick: () => void; trailing?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors', selected ? 'bg-primary/15' : 'hover:bg-raised')}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold',
          selected ? 'bg-primary text-primary-foreground' : 'bg-raised text-muted',
        )}
      >
        {selected ? <Check className="h-5 w-5" /> : e.name[0]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{e.name}</span>
        <span className="block truncate text-sm text-muted">
          {[e.muscleGroups[0], e.equipment].filter(Boolean).join(' · ') || 'Custom'}
        </span>
      </span>
      {trailing}
    </button>
  );
}

interface PickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  multi?: boolean;
  title?: string;
  onPick: (list: Exercise[]) => void;
}

export function ExercisePicker({ open, onOpenChange, multi = true, title, onPick }: PickerProps) {
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [creating, setCreating] = useState(false);
  const { list, isLoading } = useFilteredExercises(search, muscle);

  useOnChange(open, (o) => { if (o) { setSelected([]); setSearch(''); } });

  const toggle = (e: Exercise) => {
    if (!multi) { onPick([e]); onOpenChange(false); return; }
    setSelected((s) => (s.some((x) => x.id === e.id) ? s.filter((x) => x.id !== e.id) : [...s, e]));
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={title ?? (multi ? 'Add exercises' : 'Replace exercise')}
        tall
        footer={
          multi ? (
            <Button
              size="lg"
              className="w-full"
              disabled={!selected.length}
              onClick={() => { onPick(selected); onOpenChange(false); }}
            >
              {selected.length ? `Add ${selected.length} exercise${selected.length > 1 ? 's' : ''}` : 'Select exercises'}
            </Button>
          ) : undefined
        }
      >
        <div className="sticky top-0 z-10 -mx-5 space-y-3 bg-surface px-5 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises"
              className="pl-11"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
          <MuscleFilter value={muscle} onChange={setMuscle} />
        </div>

        {isLoading ? (
          <Loading />
        ) : list.length === 0 ? (
          <Empty
            title="No matching exercise"
            body={search ? `Create “${search}” and it will be in your library from now on.` : 'Try another muscle group.'}
            action={<Button variant="secondary" onClick={() => setCreating(true)}><Plus /> Create exercise</Button>}
          />
        ) : (
          <div className="space-y-0.5">
            {list.map((e) => (
              <ExerciseRow key={e.id} e={e} selected={selected.some((x) => x.id === e.id)} onClick={() => toggle(e)} />
            ))}
            <button onClick={() => setCreating(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 font-semibold text-primary">
              <Plus className="h-5 w-5" /> Create a custom exercise
            </button>
          </div>
        )}
      </Sheet>
      <ExerciseFormSheet
        open={creating}
        onOpenChange={setCreating}
        initialName={search}
        onSaved={(e) => (multi ? setSelected((s) => [...s, e]) : (onPick([e]), onOpenChange(false)))}
      />
    </>
  );
}

interface FormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: Exercise;
  initialName?: string;
  onSaved?: (e: Exercise) => void;
}

export function ExerciseFormSheet({ open, onOpenChange, exercise, initialName, onSaved }: FormProps) {
  const create = useCreateExercise();
  const update = useUpdateExercise();
  const [name, setName] = useState('');
  const [measure, setMeasure] = useState<MeasurementType>(0);
  const [muscles, setMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState('');

  useOnChange(open, (o) => {
    if (!o) return;
    setName(exercise?.name ?? initialName ?? '');
    setMeasure(exercise?.measurementType ?? 0);
    setMuscles(exercise?.muscleGroups ?? []);
    setEquipment(exercise?.equipment ?? '');
  });

  const toggleMuscle = (m: string) => setMuscles((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));

  const save = async () => {
    const body = {
      name: name.trim(),
      type: measure === 1 ? 2 : 1,
      measurementType: measure,
      muscleGroups: muscles,
      equipment: equipment || null,
    };
    const saved = exercise ? await update.mutateAsync({ id: exercise.id, ...body }) : await create.mutateAsync(body);
    onSaved?.(saved);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={exercise ? 'Edit exercise' : 'New exercise'}
      footer={
        <Button size="lg" className="w-full" disabled={!name.trim()} loading={create.isPending || update.isPending} onClick={save}>
          {exercise ? 'Save changes' : 'Create exercise'}
        </Button>
      }
    >
      <div className="space-y-5 pt-1">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Landmine press" autoFocus={!exercise} />
        </Field>
        <div>
          <span className="label">What do you log?</span>
          <div className="grid grid-cols-2 gap-2">
            {MEASUREMENT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setMeasure(o.value)}
                className={cn('rounded-xl border p-3 text-left', measure === o.value ? 'border-primary bg-primary/10' : 'border-line')}
              >
                <span className="block font-semibold">{o.label}</span>
                <span className="block text-xs text-muted">{o.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="label">Muscles worked — tap the main one first</span>
          <div className="flex flex-wrap gap-2">
            {MUSCLES.map((m) => (
              <Chip key={m} active={muscles.includes(m)} onClick={() => toggleMuscle(m)}>
                {muscles[0] === m ? `${m} (main)` : m}
              </Chip>
            ))}
          </div>
        </div>
        <Field label="Equipment">
          <Select value={equipment} onChange={(e) => setEquipment(e.target.value)}>
            <option value="">Not specified</option>
            {EQUIPMENT.map((e) => <option key={e} value={e}>{e}</option>)}
          </Select>
        </Field>
      </div>
    </Sheet>
  );
}
