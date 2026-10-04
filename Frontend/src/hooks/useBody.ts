import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { errorMessage } from '@/lib/api';
import type { SaveWeightRequest, WeightEntry } from '@/types/api';

export const useWeightHistory = (fromDate?: string) =>
  useQuery({
    queryKey: ['weight', 'history', fromDate ?? 'all'],
    queryFn: async () => (await api.get<WeightEntry[]>('weight-tracker/weight-history', { params: fromDate ? { fromDate } : {} })).data,
    placeholderData: (prev) => prev,
  });

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['weight'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['profile'] });
};

export const useSaveWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: SaveWeightRequest & { id?: number }) =>
      (id ? await api.put<WeightEntry>(`weight-tracker/${id}`, body) : await api.post<WeightEntry>('weight-tracker', body)).data,
    onSuccess: () => { invalidate(qc); toast.success('Weight saved'); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

export const useDeleteWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`weight-tracker/${id}`),
    onSuccess: () => { invalidate(qc); toast.success('Entry deleted'); },
    onError: (e) => toast.error(errorMessage(e)),
  });
};
