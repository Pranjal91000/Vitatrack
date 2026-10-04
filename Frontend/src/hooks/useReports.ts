import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ExerciseMonthlyReportDto } from '@/types/api';

export interface NutritionReportItem {
  date: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface NutritionSlotAggregateDto {
  mealSlotId: number;
  mealSlotName: string;
  totalCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mealCount: number;
}

export interface NutritionReportDto {
  from: string;
  to: string;
  dailyItems: NutritionReportItem[];
  slotAggregates: NutritionSlotAggregateDto[];
  avgProteinCaloriePercent: number;
}

export interface WorkoutReportItem {
  exerciseName: string;
  totalVolume: number;
  totalSets: number;
  averageRpe: number;
}

export interface WorkoutReportDto {
  from: string;
  to: string;
  items: WorkoutReportItem[];
  totalSessions: number;
  totalDurationMinutes: number;
  totalDistanceKm: number;
}

export const useNutritionReport = (from: string, to: string) => {
  return useQuery<NutritionReportDto>({
    queryKey: ['reports', 'nutrition', from, to],
    queryFn: async () => {
      const { data } = await api.get<NutritionReportDto>(
        `/reports/nutrition?from=${from}&to=${to}`
      );
      return data;
    },
    enabled: !!from && !!to,
  });
};

export const useWorkoutReport = (from: string, to: string) => {
  return useQuery<WorkoutReportDto>({
    queryKey: ['reports', 'workouts', from, to],
    queryFn: async () => {
      const { data } = await api.get<WorkoutReportDto>(
        `/reports/workouts?from=${from}&to=${to}`
      );
      return data;
    },
    enabled: !!from && !!to,
  });
};

export const useExerciseMonthlyReport = (exerciseId: number, month: string) => {
  return useQuery<ExerciseMonthlyReportDto>({
    queryKey: ['exerciseMonthlyReport', exerciseId, month],
    queryFn: async () => {
      const { data } = await api.get(`/reports/exercises/${exerciseId}/monthly?month=${month}`);
      return data;
    },
    enabled: !!exerciseId && !!month,
  });
};
