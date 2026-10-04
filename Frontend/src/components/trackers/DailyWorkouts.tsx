
import { useState } from 'react';
import { useWorkouts, useDeleteWorkout } from '@/hooks/useWorkouts';
import { useDateStore } from '@/store/dateStore';
import type { SetDto, WorkoutDto, WorkoutExerciseDto } from '@/types/api';

import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Dumbbell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseMonthlyViewDialog } from './ExerciseMonthlyViewDialog';

type ExerciseTableMode = 'cardio' | 'timed' | 'strength';

function getExerciseTableMode(ex: WorkoutExerciseDto): ExerciseTableMode {
    const sets = ex.sets;
    if (!sets.length) return 'strength';

    const hasDistance = sets.some((s) => s.distanceKm != null && Number(s.distanceKm) > 0);
    if (hasDistance) return 'cardio';

    const s0 = sets[0];
    const hasDuration = s0.durationSeconds != null && Number(s0.durationSeconds) > 0;
    const hasStrength =
        (s0.reps != null && Number(s0.reps) > 0) || (s0.weightKg != null && Number(s0.weightKg) > 0);
    if (hasDuration && !hasStrength) return 'timed';

    return 'strength';
}

function formatWorkoutSubtitle(workout: WorkoutDto): string {
    const n = workout.exercises.length;
    const vol = Number(workout.volume);
    const parts: string[] = [`${n} exercise${n === 1 ? '' : 's'}`];
    if (vol > 0) {
        parts.push(
            vol >= 1000 ? `${(vol / 1000).toFixed(1)}k strength volume` : `${Math.round(vol)} strength volume`
        );
    } else {
        parts.push('timed / distance / bodyweight');
    }
    return parts.join(' · ');
}

function cellNum(v: number | null | undefined): string {
    if (v == null) return '—';
    if (typeof v === 'number' && Number.isNaN(v)) return '—';
    return String(v);
}

function ExerciseSetTable({ ex }: { ex: WorkoutExerciseDto }) {
    const mode = getExerciseTableMode(ex);

    if (mode === 'cardio') {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="h-8 w-[52px] text-xs">Set</TableHead>
                        <TableHead className="h-8 text-xs">Distance (km)</TableHead>
                        <TableHead className="h-8 text-xs">Time (s)</TableHead>
                        <TableHead className="h-8 text-xs">Elev (m)</TableHead>
                        <TableHead className="h-8 text-right text-xs">Pace</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ex.sets.map((set: SetDto) => (
                        <TableRow key={set.setNumber} className="hover:bg-muted/50 border-b-0">
                            <TableCell className="py-1.5">{set.setNumber}</TableCell>
                            <TableCell className="py-1.5 font-medium">{cellNum(set.distanceKm)}</TableCell>
                            <TableCell className="py-1.5">{cellNum(set.durationSeconds)}</TableCell>
                            <TableCell className="py-1.5 text-muted-foreground">{cellNum(set.elevationGainM)}</TableCell>
                            <TableCell className="py-1.5 text-right text-muted-foreground text-xs">
                                {set.paceMinPerKm != null && set.paceMinPerKm > 0
                                    ? `${set.paceMinPerKm.toFixed(2)}/km`
                                    : '—'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    if (mode === 'timed') {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="h-8 w-[52px] text-xs">Set</TableHead>
                        <TableHead className="h-8 text-xs">Duration (s)</TableHead>
                        <TableHead className="h-8 text-xs">RPE</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ex.sets.map((set: SetDto) => (
                        <TableRow key={set.setNumber} className="hover:bg-muted/50 border-b-0">
                            <TableCell className="py-1.5">{set.setNumber}</TableCell>
                            <TableCell className="py-1.5 font-medium">{cellNum(set.durationSeconds)}</TableCell>
                            <TableCell className="py-1.5 text-muted-foreground">{cellNum(set.rpe)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="h-8 w-[52px] text-xs">Set</TableHead>
                    <TableHead className="h-8 text-xs">kg</TableHead>
                    <TableHead className="h-8 text-xs">Reps</TableHead>
                    <TableHead className="h-8 text-xs">RPE</TableHead>
                    <TableHead className="h-8 text-right text-xs">1RM (est)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {ex.sets.map((set: SetDto) => (
                    <TableRow key={set.setNumber} className="hover:bg-muted/50 border-b-0">
                        <TableCell className="py-1.5">{set.setNumber}</TableCell>
                        <TableCell className="py-1.5 font-medium">{cellNum(set.weightKg)}</TableCell>
                        <TableCell className="py-1.5">{cellNum(set.reps)}</TableCell>
                        <TableCell className="py-1.5 text-muted-foreground">{cellNum(set.rpe)}</TableCell>
                        <TableCell className="py-1.5 text-right text-muted-foreground">
                            {set.oneRepMax != null && set.oneRepMax > 0 ? Math.round(set.oneRepMax) : '—'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export function DailyWorkouts() {
    const [selectedExercise, setSelectedExercise] = useState<{ id: number; name: string } | null>(null);
    const currentDate = useDateStore((state) => state.currentDate);
    const { data, isLoading } = useWorkouts(currentDate);
    const deleteWorkout = useDeleteWorkout();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1].map((i) => (
                    <Skeleton key={i} className="h-[150px] w-full rounded-xl" />
                ))}
            </div>
        );
    }

    const workouts = (data?.workouts ?? []).filter((w) => !w.isTemplate);

    if (!workouts.length) {
        return (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                <p>No workouts logged for this day.</p>
            </div>
        );
    }

    return (
        <>
            <Accordion type="single" collapsible className="space-y-3">
                {workouts.map((workout) => (
                    <AccordionItem
                        key={workout.id}
                        value={String(workout.id)}
                        className="!border-b-0 rounded-xl border bg-card px-3 shadow-sm sm:px-4"
                    >
                        <div className="flex items-stretch gap-2">
                            <AccordionTrigger className="flex-1 py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
                                        <Dumbbell className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-base leading-snug">{workout.name}</h3>
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            {formatWorkoutSubtitle(workout)}
                                        </p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 self-center text-muted-foreground hover:text-destructive"
                                aria-label={`Delete workout ${workout.name}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteWorkout.mutate(workout.id);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <AccordionContent className="pb-2 pt-0">
                            <div className="space-y-6 border-t pt-4">
                                {workout.exercises.map((ex) => (
                                    <div key={`${workout.id}-${ex.order}-${ex.exerciseId}`}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedExercise({ id: ex.exerciseId, name: ex.exerciseName })}
                                            className="font-medium text-sm mb-2 hover:underline text-primary text-left bg-transparent border-none cursor-pointer"
                                        >
                                            {ex.exerciseName}
                                        </button>
                                        <div className="overflow-x-auto rounded-md border">
                                            <ExerciseSetTable ex={ex} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <ExerciseMonthlyViewDialog
                exerciseId={selectedExercise?.id ?? null}
                exerciseName={selectedExercise?.name ?? ''}
                open={!!selectedExercise}
                onOpenChange={(open) => !open && setSelectedExercise(null)}
            />
        </>
    );
}
