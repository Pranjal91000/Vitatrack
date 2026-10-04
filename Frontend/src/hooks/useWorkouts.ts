
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
    DailyWorkoutsDto,
    CreateWorkoutCommand,
    ExerciseDto,
    CreateExerciseCommand,
    UpdateExerciseCommand,
    AppendExercisesCommand,
    WorkoutHeatmapDayDto
} from '@/types/api';
import { toast } from 'sonner';

export const useWorkouts = (date: string) => {
    return useQuery<DailyWorkoutsDto>({
        queryKey: ['workouts', date],
        queryFn: async () => {
            const { data } = await api.get(`/workouts?date=${date}`);
            return data;
        },
    });
};

export const useExercises = (search?: string) => {
    return useQuery<ExerciseDto[]>({
        queryKey: ['exercises', search],
        queryFn: async () => {
            const { data } = await api.get(`/exercises${search ? `?search=${search}` : ''}`);
            // Handle backend returning wrapped objects (e.g. { $values: [...] } or { items: [...] } or { data: [...] })
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data;
            if (data?.$values) return data.$values;
            if (data?.items) return data.items;
            return [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useCreateWorkout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newWorkout: CreateWorkoutCommand) => api.post('/workouts', newWorkout),
        onSuccess: (_data, variables) => {
            toast.success('Workout logged!');
            queryClient.invalidateQueries({ queryKey: ['workouts', variables.date] });
            queryClient.invalidateQueries({ queryKey: ['workouts', 'heatmap'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', variables.date] });
        },
        onError: () => {
            toast.error('Failed to log workout');
        }
    });
};

export const useAppendExercises = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: AppendExercisesCommand }) => api.post(`/workouts/${id}/exercises`, data),
        onSuccess: () => {
            toast.success('Exercises appended to daily session!');
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            queryClient.invalidateQueries({ queryKey: ['workouts', 'heatmap'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: () => {
            toast.error('Failed to append exercises');
        }
    });
};

export const useDeleteWorkout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.delete(`/workouts/${id}`),
        onSuccess: () => {
            toast.success('Workout deleted');
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            queryClient.invalidateQueries({ queryKey: ['workouts', 'heatmap'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: () => {
            toast.error('Failed to delete workout');
        }
    })
}

export const useCreateExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newExercise: CreateExerciseCommand) => {
            const { data } = await api.post<ExerciseDto>('/exercises', newExercise);
            return data;
        },
        onSuccess: () => {
            toast.success('Exercise created!');
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: () => {
            toast.error('Failed to create exercise');
        }
    });
};

export const useUpdateExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & UpdateExerciseCommand) =>
            api.put(`/exercises/${id}`, data),
        onSuccess: () => {
            toast.success('Exercise updated');
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: () => {
            toast.error('Failed to update exercise');
        }
    });
};

export const useDeleteExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.delete(`/exercises/${id}`),
        onSuccess: () => {
            toast.success('Exercise deleted');
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: () => {
            toast.error('Failed to delete exercise');
        }
    });
};

export const useGetWorkoutHeatmapData = (fromDate: string, toDate: string) =>
    useQuery<WorkoutHeatmapDayDto[]>({
        queryKey: ['workouts', 'heatmap', fromDate, toDate],
        queryFn: async () => {
            const { data } = await api.get<WorkoutHeatmapDayDto[]>(
                `/workouts/heatmap?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`
            );
            return Array.isArray(data) ? data : [];
        },
    });
