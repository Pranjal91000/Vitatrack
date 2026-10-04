import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { errorMessage } from '@/lib/api';
import type { CreateFoodRequest, DailyMeals, Food, MealEntry, MealSlot, NutritionReport } from '@/types/api';

export const useDailyMeals = (date: string) =>
  useQuery({
    queryKey: ['meals', date],
    queryFn: async () => (await api.get<DailyMeals>('meals', { params: { date } })).data,
    placeholderData: (prev) => prev,
  });

export const useMealSlots = () =>
  useQuery({
    queryKey: ['meal-slots'],
    queryFn: async () => (await api.get<MealSlot[]>('meal-slots')).data,
    staleTime: 1000 * 60 * 60,
  });

export const useFoodSearch = (search: string) =>
  useQuery({
    queryKey: ['foods', 'search', search],
    queryFn: async () => (await api.get<Food[]>('foods', { params: { search, limit: 30 } })).data,
    enabled: search.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

export const useRecentFoods = () =>
  useQuery({ queryKey: ['foods', 'recent'], queryFn: async () => (await api.get<Food[]>('foods/recent', { params: { limit: 25 } })).data });

export const useMyFoods = () =>
  useQuery({ queryKey: ['foods', 'mine'], queryFn: async () => (await api.get<Food[]>('foods/mine')).data });

const invalidateDay = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['meals'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['foods', 'recent'] });
  qc.invalidateQueries({ queryKey: ['reports'] });
};

export const useAddEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { date: string; mealSlotId: number; foodId: number; quantity: number }) =>
      (await api.post<MealEntry>('meals/entries', body)).data,
    onSuccess: () => invalidateDay(qc),
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useUpdateEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => (await api.put(`meals/entries/${id}`, { quantity })).data,
    onSuccess: () => invalidateDay(qc),
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useDeleteEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`meals/entries/${id}`),
    onSuccess: () => invalidateDay(qc),
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useCopyMeals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { fromDate: string; toDate: string; mealSlotId?: number | null }) =>
      (await api.post<{ copied: number }>('meals/copy', body)).data,
    onSuccess: (r) => {
      invalidateDay(qc);
      toast.success(r.copied ? `Copied ${r.copied} item${r.copied === 1 ? '' : 's'}` : 'Nothing logged on that day');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useCreateFood = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateFoodRequest) => (await api.post<Food>('foods', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods'] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useUpdateFood = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: CreateFoodRequest & { id: number }) => (await api.put<Food>(`foods/${id}`, body)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['foods'] }); invalidateDay(qc); toast.success('Food updated'); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useDeleteFood = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`foods/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['foods'] }); toast.success('Food deleted'); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useNutritionReport = (from: string, to: string) =>
  useQuery({
    queryKey: ['reports', 'nutrition', from, to],
    queryFn: async () => (await api.get<NutritionReport>('reports/nutrition', { params: { from, to } })).data,
  });
