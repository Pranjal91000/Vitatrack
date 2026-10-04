
export interface RegisterRequest {
  email: string;      // valid email format, unique
  password: string;   // min 8 chars
  name: string;       // Public display name
}

export interface AuthResponse {
  token: string;        // Short-lived JWT Access Token (expires in 60m)
  refreshToken: string; // Long-lived refresh token (stored in HTTP-only cookie or secure storage)
  userId: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
  token?: string; // Optional: The expired access token
}

export interface RefreshResponse {
  token: string;        // New Access Token
  refreshToken: string; // New Refresh Token (Rotation)
}

export interface UserProfileDto {
  id: string; // UUID
  email: string;
  name: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  bmr?: number; // Calculated Basal Metabolic Rate
}

export interface UpdateProfileCommand {
  name?: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
}

export interface FoodDto {
  id: string;
  name: string;
  servingSize: number;
  unit: string; // "g", "ml", "oz", "slice"
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DailyMealsDto {
  meals: MealDto[];
}

export interface MealSlotDto {
  id: string;
  userId: string | null;
  name: string;
  sortOrder: number;
}

export interface MealDto {
  id: string;
  mealSlotId: string;
  mealSlotName: string;
  date: string;
  notes?: string | null;
  foods: MealFoodDto[];
  grandTotal: NutrientSummaryDto;
}

export interface MealFoodDto {
  id: string; // Mapping ID (MealFood ID)
  food: FoodDto;
  quantity: number; // Multiplier of serving size (e.g. 1.5)
  totals: NutrientSummaryDto; // Calculated: Food * Qty
}

export interface MealNutrientSummaryDto {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface NutrientSummaryDto {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface CreateMealCommand {
  date: string;
  mealSlotId: number;
  notes?: string | null;
  foods: Array<{
    foodId: number;
    quantity: number;
  }>;
}

export interface CreateMealSlotCommand {
  name: string;
}

export interface UpdateMealFoodCommand {
  quantity: number; // New quantity. 0 = remove? (Better use DELETE)
}

export interface ExerciseDto {
  id: string;
  name: string;
  type: number;
  muscleGroups: string[];
  measurementType: number;
  isDefault?: boolean;
  demoMediaUrl?: string | null;
}

export interface CreateExerciseCommand {
  name: string;
  type: number;
  muscleGroups: string[];
  measurementType: number;
}

export interface UpdateExerciseCommand {
  name: string;
  type: number;
  muscleGroups: string[];
  measurementType: number;
}

export interface CreateFoodCommand {
  name: string;
  servingSize: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface UpdateFoodCommand {
  name?: string;
  servingSize?: number;
  unit?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface DailyWorkoutsDto {
  workouts: WorkoutDto[];
}

/** Backend: GET /workouts/heatmap — matches CalendarHeatmap getData shape */
export interface WorkoutHeatmapDayDto {
  date: string;
  count: number;
}

export interface WorkoutDto {
  id: string;
  name: string;
  durationMinutes?: number;
  volume: number;
  exercises: WorkoutExerciseDto[];
  recurrencePattern?: string | null;
  isTemplate?: boolean;
}

export interface WorkoutExerciseDto {
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: SetDto[];
}

export interface SetDto {
  setNumber: number;
  reps?: number;
  weightKg?: number;
  rpe?: number;
  oneRepMax?: number;
  durationSeconds?: number;
  distanceKm?: number;
  elevationGainM?: number;
  paceMinPerKm?: number;
  pace?: number;
}

export interface CreateWorkoutCommand {
  date: string;
  name: string;
  durationMinutes?: number;
  notes?: string;
  recurrencePattern?: string | null;
  isTemplate?: boolean;
  exercises: Array<{
    exerciseId: number;
    order: number;
    sets: Array<{
      setNumber: number;
      reps?: number;
      weightKg?: number;
      durationSeconds?: number;
      distanceKm?: number;
      elevationGainM?: number;
      paceMinPerKm?: number;
      rpe?: number;
    }>;
  }>;
}

export interface AppendExercisesCommand {
  exercises: Array<{
    exerciseId: number;
    sets: Array<{
      setNumber: number;
      reps?: number;
      weightKg?: number;
      durationSeconds?: number;
      distanceKm?: number;
      elevationGainM?: number;
      paceMinPerKm?: number;
      rpe?: number;
    }>;
  }>;
}

export interface ExerciseDailySummaryDto {
  date: string;
  totalVolume: number;
  maxWeight: number;
  totalDistanceKm: number;
  averagePaceMinPerKm: number;
  totalDurationSeconds: number;
  totalReps: number;
}

export interface ExerciseMonthlyReportDto {
  exerciseId: number;
  exerciseName: string;
  dailySummaries: ExerciseDailySummaryDto[];
}

export interface DashboardDailyDto {
  date: string;
  meals: NutrientSummaryDto;
  workoutsCompleted: number;
  wellnessStreak: number;
  calorieGoal: number;
  mealsLoggedCount: number;
  quickStats: QuickStat[];
}

export interface QuickStat {
  label: string; // "Total Calories", "Workouts"
  value: string; // "2400", "1"
}

// Weight Tracker
export interface WeightMeasurement {
  id: number;
  recordedOn: string; // DateOnly: "yyyy-MM-dd"
  weight: number;
}

export interface CreateWeightRequest {
  recordedOn: string; // DateOnly: "yyyy-MM-dd"
  weight: number;
}

export interface UpdateWeightRequest {
  id: number;
  recordedOn: string; // DateOnly: "yyyy-MM-dd"
  weight: number;
}
