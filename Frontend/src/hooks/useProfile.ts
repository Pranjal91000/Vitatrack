import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { errorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSettings } from '@/store/settingsStore';
import type { DashboardSummary, ProgressReport, UpdateProfileRequest, UserProfile } from '@/types/api';

export const useProfile = () => {
  const token = useAuthStore((s) => s.token);
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get<UserProfile>('users/profile')).data,
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });

  // Server is the source of truth for unit & rest preferences; mirror them for offline use.
  const { setUnit, setDefaultRest } = useSettings.getState();
  useEffect(() => {
    if (query.data) {
      setUnit(query.data.weightUnit);
      setDefaultRest(query.data.defaultRestSeconds);
    }
  }, [query.data, setUnit, setDefaultRest]);

  return query;
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProfileRequest) => (await api.put<UserProfile>('users/profile', body)).data,
    onSuccess: (p) => {
      qc.setQueryData(['profile'], p);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['meals'] });
      useAuthStore.getState().setName(p.name);
      toast.success('Settings saved');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
};

/** Re-send the full profile with a few fields changed (the API replaces goals as sent). */
export function profileToRequest(p: UserProfile, patch: Partial<UpdateProfileRequest> = {}): UpdateProfileRequest {
  return {
    name: p.name, age: p.age, weightKg: p.weightKg, heightCm: p.heightCm, sex: p.sex, activityFactor: p.activityFactor,
    calorieGoal: p.calorieGoal, proteinGoalG: p.proteinGoalG, carbsGoalG: p.carbsGoalG, fatGoalG: p.fatGoalG,
    weightGoalKg: p.weightGoalKg, weightUnit: p.weightUnit, defaultRestSeconds: p.defaultRestSeconds,
    ...patch,
  };
}

export const useDashboard = (date: string) =>
  useQuery({
    queryKey: ['dashboard', date],
    queryFn: async () => (await api.get<DashboardSummary>('dashboard/summary', { params: { date } })).data,
    placeholderData: (prev) => prev,
  });

export const useProgressReport = (weeks: number) =>
  useQuery({
    queryKey: ['reports', 'progress', weeks],
    queryFn: async () => (await api.get<ProgressReport>('reports/progress', { params: { weeks } })).data,
    placeholderData: (prev) => prev,
  });
