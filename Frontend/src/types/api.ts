/** Mirrors the VitaTrack API DTOs. All weights are kilograms; dates are yyyy-MM-dd. */

// ── Auth & profile ───────────────────────────────────────────────────────────
export interface AuthResponse { token: string; refreshToken: string; userId: number; email: string; name: string }
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { email: string; password: string; name: string }

export interface NutritionGoals { calories: number; proteinG: number; carbsG: number; fatG: number; isCustom: boolean }

export type Sex = 'male' | 'female';
export type WeightUnit = 'kg' | 'lb';

export interface UserProfile {
  id: number; email: string; name: string;
  age: number | null; weightKg: number | null; heightCm: number | null; bmr: number | null;
  sex: Sex | null; activityFactor: number | null;
  calorieGoal: number | null; proteinGoalG: number | null; carbsGoalG: number | null; fatGoalG: number | null;
  weightGoalKg: number | null; weightUnit: WeightUnit; defaultRestSeconds: number;
  tdee: number | null; effectiveGoals: NutritionGoals;
}

export interface UpdateProfileRequest {
  name?: string; age?: number | null; weightKg?: number | null; heightCm?: number | null;
  sex?: Sex | null; activityFactor?: number | null;
  calorieGoal?: number | null; proteinGoalG?: number | null; carbsGoalG?: number | null; fatGoalG?: number | null;
  weightGoalKg?: number | null; weightUnit?: WeightUnit; defaultRestSeconds?: number;
}

// ── Exercises & workouts ─────────────────────────────────────────────────────
/** 0 WeightReps · 1 TimeDistance · 2 Other · 3 BodyweightReps · 4 TimedHold · 5 DistanceOnly */
export type MeasurementType = number;
/** 0 Normal · 1 Warm-up · 2 Drop · 3 Failure */
export type SetType = 0 | 1 | 2 | 3;

export interface Exercise {
  id: number; name: string; type: number; muscleGroups: string[]; equipment: string | null;
  measurementType: MeasurementType; isDefault: boolean; isCustom: boolean; demoMediaUrl: string | null;
}

export interface SetDto {
  id: number; setNumber: number; reps: number | null; weightKg: number | null; durationSeconds: number | null;
  rpe: number | null; oneRepMax: number | null; distanceKm: number | null; elevationGainM: number | null;
  paceMinPerKm: number | null; pace: number | null; setType: SetType; isCompleted: boolean;
}

export interface WorkoutExerciseDto {
  id: number; exerciseId: number; exerciseName: string; muscleGroups: string[]; equipment: string | null;
  measurementType: MeasurementType; order: number; notes: string | null; restSeconds: number | null; sets: SetDto[];
}

export interface PersonalRecord { exerciseId: number; exerciseName: string; kind: 'weight' | 'oneRepMax' | 'volume' | 'reps'; value: number; previous: number | null }

export interface WorkoutDto {
  id: number; name: string | null; date: string; durationMinutes: number | null; notes: string | null;
  startedAt: string | null; endedAt: string | null; exercises: WorkoutExerciseDto[];
  volume: number; totalSets: number; totalReps: number; isTemplate: boolean; records: PersonalRecord[];
}

export interface WorkoutSummaryExercise { exerciseId: number; exerciseName: string; setCount: number; bestWeightKg: number | null; bestReps: number | null; measurementType: MeasurementType }
export interface WorkoutSummary {
  id: number; name: string | null; date: string; startedAt: string | null; durationMinutes: number | null;
  volume: number; totalSets: number; exercises: WorkoutSummaryExercise[];
}

export interface SetRequest {
  setNumber: number; reps?: number | null; weightKg?: number | null; durationSeconds?: number | null;
  rpe?: number | null; distanceKm?: number | null; setType: SetType; isCompleted: boolean;
}
export interface WorkoutExerciseRequest { exerciseId: number; sets: SetRequest[]; notes?: string | null; restSeconds?: number | null }
export interface CreateWorkoutRequest {
  date: string; name: string; durationMinutes?: number | null; notes?: string | null;
  startedAt?: string | null; endedAt?: string | null; exercises: WorkoutExerciseRequest[];
}
export interface RoutineRequest { name: string; notes?: string | null; exercises: WorkoutExerciseRequest[] }

export interface ExerciseSession { workoutId: number; workoutName: string | null; date: string; sets: SetDto[]; volume: number; bestOneRepMax: number | null; maxWeightKg: number | null }
export interface ExerciseDetail {
  exercise: Exercise; sessionCount: number; bestOneRepMax: number | null; maxWeightKg: number | null;
  bestSetVolume: number | null; maxReps: number | null; sessions: ExerciseSession[];
}
export interface LastPerformance { exerciseId: number; date: string; sets: SetDto[] }

export interface CreateExerciseRequest { name: string; type: number; muscleGroups: string[]; measurementType: MeasurementType; equipment?: string | null }

export interface Paged<T> { data: T; meta: { total: number; page: number; totalPages: number; hasNext: boolean } | null }
export interface HeatmapDay { date: string; count: number }

// ── Nutrition ────────────────────────────────────────────────────────────────
export interface Nutrients { calories: number; proteinG: number; carbsG: number; fatG: number }
export interface Food { id: number; name: string; servingSize: number; unit: string; calories: number; proteinG: number; carbsG: number; fatG: number; isCustom: boolean }
export interface MealFood { id: number; food: Food; quantity: number; totals: Nutrients }
export interface Meal { id: number; mealSlotId: number; mealSlotName: string; date: string; notes: string | null; foods: MealFood[]; grandTotal: Nutrients }
export interface MealSlot { id: number; userId: number | null; name: string; sortOrder: number }
export interface DailyMeals { date: string; meals: Meal[]; total: Nutrients; goals: NutritionGoals }
export interface MealEntry { mealId: number; mealSlotId: number; date: string; entry: MealFood }
export interface CreateFoodRequest { name: string; servingSize: number; unit: string; calories: number; proteinG: number; carbsG: number; fatG: number }

// ── Body ─────────────────────────────────────────────────────────────────────
export interface WeightEntry { id: number; recordedOn: string; weight: number; bodyFatPercent: number | null; notes: string | null }
export interface SaveWeightRequest { recordedOn: string; weight: number; bodyFatPercent?: number | null; notes?: string | null }

// ── Dashboard & reports ──────────────────────────────────────────────────────
export interface DashboardSummary {
  date: string; consumed: Nutrients; goals: NutritionGoals; todayWorkouts: WorkoutSummary[]; lastWorkout: WorkoutSummary | null;
  workoutsThisWeek: number; volumeThisWeek: number; activeDayStreak: number;
  weight: { latestKg: number; recordedOn: string; changeKg30d: number | null; goalKg: number | null } | null;
  week: { date: string; workouts: number; calories: number }[];
}

export interface ProgressReport {
  from: string; to: string;
  weeks: { weekStart: string; workouts: number; volume: number; sets: number; durationMinutes: number }[];
  muscles: { muscle: string; sets: number }[];
  totalWorkouts: number; totalVolume: number; totalDurationMinutes: number;
}

export interface NutritionReport {
  from: string; to: string;
  dailyItems: { date: string; calories: number; proteinG: number; carbsG: number; fatG: number }[];
  avgProteinCaloriePercent: number;
}


// ── Compatibility aliases for legacy tracker components ─────────────────────
export type WeightMeasurement = WeightEntry;
export type CreateWeightRequest = SaveWeightRequest;
export type UpdateWeightRequest = SaveWeightRequest & { id: number };
export type NutrientSummaryDto = Nutrients;
export type DailyMealsDto = DailyMeals;
export type FoodDto = Food;
export type MealSlotDto = MealSlot;
export type CreateMealCommand = any;
export type UpdateMealFoodCommand = any;
export type CreateFoodCommand = CreateFoodRequest;
export type UpdateFoodCommand = Partial<CreateFoodRequest>;
export type CreateMealSlotCommand = any;
export type DashboardDailyDto = DashboardSummary;
export interface ExerciseDailySummaryDto { date: string; totalDistanceKm: number; averagePaceMinPerKm: number; totalDurationSeconds: number; totalVolume: number; maxWeight: number; totalReps: number; }
export interface ExerciseMonthlyReportDto { dailySummaries: ExerciseDailySummaryDto[]; }
