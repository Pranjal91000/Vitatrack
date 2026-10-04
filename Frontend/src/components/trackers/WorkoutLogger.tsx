import { useState } from 'react';
import { useForm, useFieldArray, type Resolver, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useExercises, useCreateWorkout, useAppendExercises, useWorkouts } from '@/hooks/useWorkouts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Dumbbell } from 'lucide-react';
import { useDateStore } from '@/store/dateStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CreateExerciseDialog } from './CreateExerciseDialog';
import { MeasurementType } from '@/Enumerations/MeasurementTypeEnum';
import { ExerciseDemoVideo } from './ExerciseDemoVideo';

const numRegisterOpts = {
  setValueAs: (v: unknown) => {
    if (v === '' || v == null) return undefined;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  },
} as const;

const rpeRegisterOpts = {
  setValueAs: (v: unknown) => {
    if (v === '' || v == null) return '';
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : '';
  },
} as const;

const setSchema = z.object({
  reps: z.number().min(0).optional(),
  weightKg: z.number().min(0).optional(),
  rpe: z.union([z.number().min(0).max(10), z.literal('')]).optional(),
  durationSeconds: z.number().min(0).optional(),
  distanceKm: z.number().min(0).optional(),
  elevationGainM: z.number().min(0).optional(),
});

const exerciseSchema = z.object({
  exerciseId: z.number(),
  exerciseName: z.string(),
  measurementType: z.number().optional(),
  demoMediaUrl: z.string().nullish(),
  order: z.number(),
  sets: z.array(setSchema),
});

const logTodaySchema = z.object({
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
});

type LogTodayFormValues = z.infer<typeof logTodaySchema>;

function defaultSetForMeasurementType(mt: number | undefined) {
  const m = mt ?? MeasurementType.WeightReps;
  if (m === MeasurementType.TimeDistance || m === MeasurementType.DistanceOnly) {
    return { distanceKm: 0, durationSeconds: 0, elevationGainM: 0, rpe: '' as const };
  }
  if (m === MeasurementType.TimedHold) {
    return { durationSeconds: 60, rpe: '' as const };
  }
  if (m === MeasurementType.BodyweightReps) {
    return { reps: 10, rpe: 8 };
  }
  return { reps: 10, weightKg: 0, rpe: 8 };
}

function showWeightCol(mt: number | undefined) {
  const m = mt ?? 0;
  return m === MeasurementType.WeightReps || m === MeasurementType.Other;
}

function showRepsCol(mt: number | undefined) {
  const m = mt ?? 0;
  return (
    m === MeasurementType.WeightReps ||
    m === MeasurementType.BodyweightReps ||
    m === MeasurementType.Other
  );
}

function showDistanceTime(mt: number | undefined) {
  const m = mt ?? 0;
  return (
    m === MeasurementType.TimeDistance ||
    m === MeasurementType.DistanceOnly ||
    m === MeasurementType.Other
  );
}

function showTimedOnly(mt: number | undefined) {
  return mt === MeasurementType.TimedHold;
}

function describeFirstError(errors: FieldErrors<LogTodayFormValues>): string {
  if (errors.exercises?.message) return errors.exercises.message;
  if (errors.exercises?.root?.message) return errors.exercises.root.message;

  const exErrors = errors.exercises;
  if (exErrors && typeof exErrors === 'object') {
    const keys = Object.keys(exErrors).filter((k) => /^\d+$/.test(k));
    for (const eiStr of keys) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ex = (exErrors as any)[eiStr];
      if (!ex) continue;
      const ei = Number(eiStr);

      for (const [field, err] of Object.entries(ex)) {
        if (field === 'sets') continue;
        const msg = (err as { message?: string })?.message;
        if (msg) return `Exercise ${ei + 1}: ${field} — ${msg}`;
      }

      const setsErrors = ex.sets;
      if (setsErrors && typeof setsErrors === 'object') {
        const setKeys = Object.keys(setsErrors).filter((k) => /^\d+$/.test(k));
        for (const siStr of setKeys) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const s = (setsErrors as any)[siStr];
          if (!s) continue;
          const si = Number(siStr);
          for (const [field, err] of Object.entries(s)) {
            const msg = (err as { message?: string })?.message;
            if (msg) return `Exercise ${ei + 1}, set ${si + 1}: ${field} — ${msg}`;
          }
        }
      }
    }
  }
  return 'Please check all fields and try again.';
}

export function WorkoutLogger() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 h-4 w-4" /> Add workout
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-[700px] h-[min(90vh,720px)] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-2 border-b shrink-0">
          <DialogTitle>Log workout</DialogTitle>
          <DialogDescription>
            Add exercises and sets for the date selected in the header.
          </DialogDescription>
        </DialogHeader>
        <LogTodayForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function LogTodayForm({ onSuccess }: { onSuccess: () => void }) {
  const currentDate = useDateStore((state) => state.currentDate);
  const { data: dailyData } = useWorkouts(currentDate);

  const todayWorkout = dailyData?.workouts?.[0];

  const createWorkout = useCreateWorkout();
  const appendExercises = useAppendExercises();

  const form = useForm<LogTodayFormValues>({
    resolver: zodResolver(logTodaySchema) as Resolver<LogTodayFormValues>,
    defaultValues: { exercises: [] },
  });

  const onSubmit = (values: LogTodayFormValues) => {
    const payloadExercises = values.exercises.map((ex, i) => ({
      exerciseId: ex.exerciseId,
      order: i,
      sets: ex.sets.map((s, j) => ({
        setNumber: j + 1,
        reps: s.reps,
        weightKg: s.weightKg,
        rpe: s.rpe === '' || s.rpe == null ? undefined : (s.rpe as number),
        durationSeconds: s.durationSeconds,
        distanceKm: s.distanceKm,
        elevationGainM: s.elevationGainM,
        setType: 0 as const,
        isCompleted: true,
      })),
    }));

    if (todayWorkout) {
      appendExercises.mutate(
        { id: todayWorkout.id, data: { exercises: payloadExercises } },
        {
          onSuccess: () => {
            form.reset();
            onSuccess();
          },
        }
      );
    } else {
      createWorkout.mutate(
        {
          date: currentDate,
          name: 'Daily Session',
          exercises: payloadExercises,
        },
        {
          onSuccess: () => {
            form.reset();
            onSuccess();
          },
        }
      );
    }
  };

  return (
    <WorkoutFormWrapper
      form={form}
      onSubmit={onSubmit}
      isPending={createWorkout.isPending || appendExercises.isPending}
      submitText={todayWorkout ? 'Append to today' : 'Log workout'}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WorkoutFormWrapper({
  form,
  onSubmit,
  isPending,
  submitText,
}: {
  form: any;
  onSubmit: any;
  isPending: boolean;
  submitText: string;
}) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors: FieldErrors<LogTodayFormValues>) => {
        console.error('[WorkoutLogger] validation errors:', JSON.stringify(errors, null, 2));
        toast.error(describeFirstError(errors));
      })}
      className="flex-1 flex flex-col overflow-hidden min-h-0"
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pt-2">
        <ExerciseList form={form} />
      </div>
      <div className="p-4 border-t bg-muted/40 flex justify-end gap-2 shrink-0">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : submitText}
        </Button>
      </div>
    </form>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExerciseList({ form }: { form: any }) {
  const [openCombobox, setOpenCombobox] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [search, setSearch] = useState('');
  const { data: exercises } = useExercises(search);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addExercise = (exercise: any) => {
    const mt =
      exercise.measurementType !== undefined && exercise.measurementType !== null
        ? Number(exercise.measurementType)
        : MeasurementType.WeightReps;
    append({
      exerciseId: Number(exercise.id),
      exerciseName: exercise.name,
      measurementType: mt,
      demoMediaUrl: exercise.demoMediaUrl ?? undefined,
      order: fields.length,
      sets: [defaultSetForMeasurementType(mt)],
    });
    setOpenCombobox(false);
    setSearch('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="w-full sm:w-[220px] justify-between">
              Add exercise
              <Search className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(calc(100vw-2rem),320px)] p-0" align="end">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Search exercises…" value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2 space-y-2">
                    <p className="text-sm text-center text-muted-foreground">No exercises found.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setOpenCombobox(false);
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create exercise
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {exercises?.map((ex) => (
                    <CommandItem key={ex.id} value={ex.name} onSelect={() => addExercise(ex)}>
                      {ex.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <CreateExerciseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(exercise) => addExercise(exercise)}
      />

      {fields.map((field, index) => (
        <ExerciseCard
          key={field.id}
          index={index}
          control={form.control}
          remove={() => remove(index)}
          form={form}
        />
      ))}

      {fields.length === 0 && (
        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
          <Dumbbell className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>Add exercises to start tracking</p>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExerciseCard({
  index,
  control,
  remove,
  form,
}: {
  index: number;
  control: any;
  remove: () => void;
  form: any;
}) {
  const { fields, append, remove: removeSet } = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  });

  const exerciseName = form.watch(`exercises.${index}.exerciseName`);
  const measurementType = form.watch(`exercises.${index}.measurementType`) as number | undefined;
  const demoMediaUrl = form.watch(`exercises.${index}.demoMediaUrl`) as string | undefined;
  const exerciseId = form.watch(`exercises.${index}.exerciseId`) as number;

  const sw = showWeightCol(measurementType);
  const sr = showRepsCol(measurementType);
  const sdt = showDistanceTime(measurementType);
  const sto = showTimedOnly(measurementType);

  const appendSet = () => {
    append(defaultSetForMeasurementType(measurementType));
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-semibold leading-tight">{exerciseName}</CardTitle>
          {demoMediaUrl ? (
            <ExerciseDemoVideo exerciseId={exerciseId} relativePath={demoMediaUrl} />
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={remove}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Mobile stacked layout */}
        <div className="md:hidden space-y-3">
          {fields.map((set, setIndex) => (
            <div key={set.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Set {setIndex + 1}</div>
              <div className="grid grid-cols-2 gap-2">
                {sto ? (
                  <>
                    <div className="col-span-2">
                      <Label className="text-xs">Seconds</Label>
                      <Input
                        type="number"
                        className="h-9"
                        {...form.register(`exercises.${index}.sets.${setIndex}.durationSeconds`, numRegisterOpts)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">RPE</Label>
                      <Input
                        type="number"
                        className="h-9"
                        {...form.register(`exercises.${index}.sets.${setIndex}.rpe`, rpeRegisterOpts)}
                      />
                    </div>
                  </>
                ) : null}
                {!sto && sdt ? (
                  <>
                    <div>
                      <Label className="text-xs">km</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-9"
                        {...form.register(`exercises.${index}.sets.${setIndex}.distanceKm`, numRegisterOpts)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Time (s)</Label>
                      <Input
                        type="number"
                        className="h-9"
                        {...form.register(`exercises.${index}.sets.${setIndex}.durationSeconds`, numRegisterOpts)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Elev (m)</Label>
                      <Input
                        type="number"
                        className="h-9"
                        {...form.register(`exercises.${index}.sets.${setIndex}.elevationGainM`, numRegisterOpts)}
                      />
                    </div>
                  </>
                ) : null}
                {!sto && sw ? (
                  <div>
                    <Label className="text-xs">kg</Label>
                    <Input
                      type="number"
                      step="0.5"
                      className="h-9"
                      {...form.register(`exercises.${index}.sets.${setIndex}.weightKg`, numRegisterOpts)}
                    />
                  </div>
                ) : null}
                {!sto && sr ? (
                  <div>
                    <Label className="text-xs">Reps</Label>
                    <Input
                      type="number"
                      className="h-9"
                      {...form.register(`exercises.${index}.sets.${setIndex}.reps`, numRegisterOpts)}
                    />
                  </div>
                ) : null}
                {!sto && (sw || sr) ? (
                  <div>
                    <Label className="text-xs">RPE</Label>
                    <Input
                      type="number"
                      className="h-9"
                      {...form.register(`exercises.${index}.sets.${setIndex}.rpe`, rpeRegisterOpts)}
                    />
                  </div>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full h-8 text-destructive"
                onClick={() => removeSet(setIndex)}
              >
                Remove set
              </Button>
            </div>
          ))}
        </div>

        {/* Desktop table layout */}
        <div className="hidden md:block overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[52px]">Set</TableHead>
                {sto ? (
                  <>
                    <TableHead>Duration (s)</TableHead>
                    <TableHead>RPE</TableHead>
                  </>
                ) : (
                  <>
                    {sdt ? (
                      <>
                        <TableHead>Dist (km)</TableHead>
                        <TableHead>Time (s)</TableHead>
                        <TableHead>Elev (m)</TableHead>
                      </>
                    ) : null}
                    {sw ? <TableHead>kg</TableHead> : null}
                    {sr ? <TableHead>Reps</TableHead> : null}
                    {(sw || sr) && !sto ? <TableHead>RPE</TableHead> : null}
                  </>
                )}
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((set, setIndex) => (
                <TableRow key={set.id} className="hover:bg-transparent">
                  <TableCell className="font-medium">{setIndex + 1}</TableCell>
                  {sto ? (
                    <>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 min-w-[72px]"
                          {...form.register(`exercises.${index}.sets.${setIndex}.durationSeconds`, numRegisterOpts)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 min-w-[56px]"
                          {...form.register(`exercises.${index}.sets.${setIndex}.rpe`, rpeRegisterOpts)}
                        />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      {sdt ? (
                        <>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              className="h-8 min-w-[72px]"
                              {...form.register(`exercises.${index}.sets.${setIndex}.distanceKm`, numRegisterOpts)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="h-8 min-w-[72px]"
                              {...form.register(`exercises.${index}.sets.${setIndex}.durationSeconds`, numRegisterOpts)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="h-8 min-w-[64px]"
                              {...form.register(`exercises.${index}.sets.${setIndex}.elevationGainM`, numRegisterOpts)}
                            />
                          </TableCell>
                        </>
                      ) : null}
                      {sw ? (
                        <TableCell>
                          <Input
                            type="number"
                            step="0.5"
                            className="h-8 min-w-[64px]"
                            {...form.register(`exercises.${index}.sets.${setIndex}.weightKg`, numRegisterOpts)}
                          />
                        </TableCell>
                      ) : null}
                      {sr ? (
                        <TableCell>
                          <Input
                            type="number"
                            className="h-8 min-w-[56px]"
                            {...form.register(`exercises.${index}.sets.${setIndex}.reps`, numRegisterOpts)}
                          />
                        </TableCell>
                      ) : null}
                      {sw || sr ? (
                        <TableCell>
                          <Input
                            type="number"
                            className="h-8 min-w-[56px]"
                            {...form.register(`exercises.${index}.sets.${setIndex}.rpe`, rpeRegisterOpts)}
                          />
                        </TableCell>
                      ) : null}
                    </>
                  )}
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeSet(setIndex)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button type="button" variant="outline" size="sm" className="w-full" onClick={appendSet}>
          <Plus className="mr-2 h-3 w-3" /> Add set
        </Button>
      </CardContent>
    </Card>
  );
}
