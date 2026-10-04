
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
    DailyMealsDto,
    FoodDto,
    CreateMealCommand,
    UpdateMealFoodCommand,
    CreateFoodCommand,
    UpdateFoodCommand,
    MealSlotDto,
    CreateMealSlotCommand,
} from '@/types/api';

import { toast } from 'sonner';

export const useMeals = (date: string) => {
    return useQuery<DailyMealsDto>({
        queryKey: ['meals', date],
        queryFn: async () => {
            const { data } = await api.get(`/meals?date=${date}`);
            return data;
        },
    });
};

export const useMealSlots = () => {
    return useQuery<MealSlotDto[]>({
        queryKey: ['meal-slots'],
        queryFn: async () => {
            const { data } = await api.get<MealSlotDto[]>('/meal-slots');
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 30,
    });
};

export const useCreateMealSlot = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: CreateMealSlotCommand) => {
            const { data } = await api.post<MealSlotDto>('/meal-slots', body);
            return data;
        },
        onSuccess: () => {
            toast.success('Meal type added');
            queryClient.invalidateQueries({ queryKey: ['meal-slots'] });
        },
        onError: () => {
            toast.error('Failed to add meal type');
        },
    });
};

export const useFoodSearch = (search: string) => {
    return useQuery<FoodDto[]>({
        queryKey: ['foods', search],
        queryFn: async () => {
            if (!search || search.length < 2) return [];
            const { data } = await api.get(`/foods?search=${search}&limit=10`);
            if (Array.isArray(data)) return data;
            if (data?.$values) return data.$values;
            if (data?.items) return data.items;
            return [];
        },
        enabled: !!search && search.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 mins
    });
};

export const useCreateMeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newMeal: CreateMealCommand) => api.post('/meals', newMeal),
        onSuccess: (_data, variables) => {
            toast.success('Meal logged!');
            queryClient.invalidateQueries({ queryKey: ['meals', variables.date] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', variables.date] });
        },
        onError: () => {
            toast.error('Failed to log meal');
        }
    });
};

export const useUpdateMealFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ mealId, foodId, quantity }: { mealId: string, foodId: string } & UpdateMealFoodCommand) =>
            api.put(`/meals/${mealId}/foods/${foodId}`, { quantity }),

        onMutate: async () => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['meals'] });
            const previousMeals = queryClient.getQueryData(['meals']);

            // This is complex to update deeply nested structure optimistically perfectly without full logic,
            // so we will just rely on invalidation for MVP or simple update if possible.
            // For now, let's just invalidate on success to ensure data consistency.
            return { previousMeals };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: () => {
            toast.error("Failed to update quantity");
        }
    });
};

export const useDeleteMeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.delete(`/meals/${id}`),
        onSuccess: () => {
            toast.success('Meal deleted');
            queryClient.invalidateQueries({ queryKey: ['meals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: () => {
            toast.error('Failed to delete meal');
        }
    })
}

export const useCreateFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newFood: CreateFoodCommand) => api.post('/foods', newFood),
        onSuccess: () => {
            toast.success('Food created!');
            queryClient.invalidateQueries({ queryKey: ['foods'] });
        },
        onError: () => {
            toast.error('Failed to create food');
        }
    });
};

export const useUpdateFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & UpdateFoodCommand) =>
            api.put(`/foods/${id}`, data),
        onSuccess: () => {
            toast.success('Food updated');
            queryClient.invalidateQueries({ queryKey: ['foods'] });
            queryClient.invalidateQueries({ queryKey: ['meals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: () => {
            toast.error('Failed to update food');
        }
    });
};

export const useDeleteFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.delete(`/foods/${id}`),
        onSuccess: () => {
            toast.success('Food deleted');
            queryClient.invalidateQueries({ queryKey: ['foods'] });
        },
        onError: () => {
            toast.error('Failed to delete food');
        }
    });
};
