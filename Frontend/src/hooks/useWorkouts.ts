import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { errorMessage } from '@/lib/api';
import type {
  CreateExerciseRequest, CreateWorkoutRequest, Exercise, ExerciseDetail, HeatmapDay, LastPerformance,
  Paged, RoutineRequest, WorkoutDto, WorkoutSummary,
} from '@/types/api';

export const keys = {
  exercises: ['exercises'] as const,
  exercise: (id: number) => ['exercises', id] as const,
  last: (ids: number[]) => ['exercises', 'last', ids.slice().sort((a, b) => a - b).join(',')] as const,
  history: ['workouts', 'history'] as const,
  workout: (id: number) => ['workouts', id] as const,
  routines: ['routines'] as const,
  routine: (id: number) => ['routines', id] as const,
  heatmap: (from: string, to: string) => ['workouts', 'heatmap', from, to] as const,
};

/** Whole library (built-in + custom) — fetched once and filtered on the device. */
export const useExerciseLibrary = () =>
  useQuery({
    queryKey: keys.exercises,
    queryFn: async () => (await api.get<Paged<Exercise[]>>('exercises', { params: { limit: 500 } })).data.data,
    staleTime: 1000 * 60 * 30,
  });

export const useExerciseDetail = (id: number) =>
  useQuery({
    queryKey: keys.exercise(id),
    queryFn: async () => (await api.get<ExerciseDetail>(`exercises/${id}`, { params: { sessions: 50 } })).data,
    enabled: id > 0,
  });

export const useLastPerformance = (ids: number[]) =>
  useQuery({
    queryKey: keys.last(ids),
    queryFn: async () => {
      const { data } = await api.get<LastPerformance[]>('exercises/last-performance', { params: { ids: ids.join(',') } });
      return Object.fromEntries(data.map((p) => [p.exerciseId, p])) as Record<number, LastPerformance>;
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

export const useCreateExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateExerciseRequest) => (await api.post<Exercise>('exercises', body)).data,
    onSuccess: (ex) => {
      qc.setQueryData<Exercise[]>(keys.exercises, (old) => (old ? [...old, ex].sort((a, b) => a.name.localeCompare(b.name)) : old));
      toast.success(`${ex.name} added to your library`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useUpdateExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: CreateExerciseRequest & { id: number }) => (await api.put<Exercise>(`exercises/${id}`, body)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.exercises }); toast.success('Exercise updated'); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useDeleteExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`exercises/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.exercises }); toast.success('Exercise deleted'); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

// ── Workouts ─────────────────────────────────────────────────────────────────

export const useWorkoutHistory = () =>
  useInfiniteQuery({
    queryKey: keys.history,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      (await api.get<Paged<WorkoutSummary[]>>('workouts/history', { params: { page: pageParam, limit: 20 } })).data,
    getNextPageParam: (last) => (last.meta?.hasNext ? last.meta.page + 1 : undefined),
  });

export const useWorkout = (id: number) =>
  useQuery({
    queryKey: keys.workout(id),
    queryFn: async () => (await api.get<WorkoutDto>(`workouts/${id}`)).data,
    enabled: id > 0,
  });

const invalidateTraining = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['workouts'] });
  qc.invalidateQueries({ queryKey: ['exercises'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['reports'] });
};

export const useSaveWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: CreateWorkoutRequest }) =>
      (id ? await api.put<WorkoutDto>(`workouts/${id}`, body) : await api.post<WorkoutDto>('workouts', body)).data,
    onSuccess: (w) => {
      qc.setQueryData(keys.workout(w.id), w);
      invalidateTraining(qc);
    },
  });
};

export const useDeleteWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`workouts/${id}`),
    onSuccess: () => { invalidateTraining(qc); toast.success('Workout deleted'); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useHeatmap = (from: string, to: string) =>
  useQuery({
    queryKey: keys.heatmap(from, to),
    queryFn: async () => (await api.get<HeatmapDay[]>('workouts/heatmap', { params: { from, to } })).data,
  });

// ── Routines ─────────────────────────────────────────────────────────────────

export const useRoutines = () =>
  useQuery({ queryKey: keys.routines, queryFn: async () => (await api.get<WorkoutDto[]>('routines')).data });

export const useRoutine = (id: number) =>
  useQuery({ queryKey: keys.routine(id), queryFn: async () => (await api.get<WorkoutDto>(`routines/${id}`)).data, enabled: id > 0 });

export const useSaveRoutine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: RoutineRequest }) =>
      (id ? await api.put<WorkoutDto>(`routines/${id}`, body) : await api.post<WorkoutDto>('routines', body)).data,
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: keys.routines });
      qc.setQueryData(keys.routine(r.id), r);
      toast.success('Routine saved');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useDeleteRoutine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`routines/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.routines }); toast.success('Routine deleted'); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useSaveAsRoutine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ workoutId, name }: { workoutId: number; name?: string }) =>
      (await api.post<WorkoutDto>(`workouts/${workoutId}/save-as-routine`, { name })).data,
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: keys.routines }); toast.success(`Saved as routine “${r.name}”`); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};


// Legacy tracker compatibility wrappers
export const useExercises = () => useExerciseLibrary();
export const useCreateWorkout = () => {
  const save = useSaveWorkout();
  return { ...save, mutate: (body: CreateWorkoutRequest, options?: Parameters<typeof save.mutate>[1]) => save.mutate({ body }, options) };
};
export const useAppendExercises = () => {
  const save = useSaveWorkout();
  return { ...save, mutate: ({ id, data }: { id: number; data: { exercises: WorkoutExerciseRequest[] } }, options?: Parameters<typeof save.mutate>[1]) => {
    const existing = { date: new Date().toISOString().slice(0, 10), name: 'Daily Session', exercises: data.exercises } as CreateWorkoutRequest;
    save.mutate({ id, body: existing }, options);
  }};
};
export const useWorkouts = (date: string) => useQuery({
  queryKey: ['workouts', 'daily', date],
  queryFn: async () => {
    const { data } = await api.get<{ workouts: WorkoutSummary[] }>('workouts/history', { params: { date, page: 1, limit: 20 } });
    return data;
  },
});
export const useGetWorkoutHeatmapData = (from: string, to: string) => useHeatmap(from, to);
