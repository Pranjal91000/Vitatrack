# VitaTrack API Documentation

**Version:** 1.0.0
**Status:** 🟢 Stable
**Base URL:** `http://localhost:5000/api` (Local) / `/api` (Production)
**Content-Type:** `application/json`

---

## 📚 Table of Contents
1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Users Module](#3-users-module)
4. [Activities Module](#4-activities-module)
5. [Meals Module](#5-meals-module)
6. [Workouts Module](#6-workouts-module)
7. [Dashboard Module](#7-dashboard-module)
8. [Reports Module](#8-reports-module)
9. [Error Handling](#9-error-handling)
10. [React Integration Guide](#10-react-integration-guide)

---

## 1. Overview

VitaTrack is a wellness tracking application built with a .NET 8 backend and a React (Vite) frontend. This API is RESTful and strictly typed.

### Conventions
*   **Authorization**: Bearer Token in `Authorization` header.
    *   `Authorization: Bearer <your_jwt_token>`
*   **Dates**: `YYYY-MM-DD` (ISO 8601 DateOnly). Example: `2024-02-16`.
*   **Timestamps**: `YYYY-MM-DDTHH:mm:ss.sssZ` (ISO 8601 UTC).
*   **IDs**: UUID v4 strings. Example: `3fa85f64-5717-4562-b3fc-2c963f66afa6`.
*   **Soft Deletes**: Deleted resources are never returned in lists.
*   **Pagination**: Lists use simplified pagination query params: `?page=1&limit=20`.

### Standard Responses
**Success (List/Paginated):**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "totalPages": 5,
    "hasNext": true
  }
}
```

**Success (Single Resource):**
Resources are usually returned directly as the root object, or wrapped in `data` depending on the complexity. See specific endpoint docs.

---

## 2. Authentication

### Register
Create a new user account.

**POST** `/auth/register`

#### Request Body
```typescript
interface RegisterRequest {
  email: string;      // valid email format, unique
  password: string;   // min 8 chars
  name: string;       // Public display name
}
```

#### Response (201 Created)
```typescript
interface AuthResponse {
  token: string;        // Short-lived JWT Access Token (expires in 60m)
  refreshToken: string; // Long-lived refresh token (stored in HTTP-only cookie or secure storage)
  userId: string;
  email: string;
  name: string;
}
```

---

### Login
Authenticate an existing user.

**POST** `/auth/login`

#### Request Body
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

#### Response (200 OK)
Returns `AuthResponse` (same as Register).

---

### Refresh Token
Obtain a new access token when the current one expires (401 Unauthorized).

**POST** `/auth/refresh`

#### Request Body
```typescript
interface RefreshRequest {
  refreshToken: string;
  token?: string; // Optional: The expired access token
}
```

#### Response (200 OK)
```typescript
interface RefreshResponse {
  token: string;        // New Access Token
  refreshToken: string; // New Refresh Token (Rotation)
}
```

---

## 3. Users Module

### Get User Profile
Fetch current user's profile and settings.

**GET** `/users/profile`

#### Response (200 OK)
```typescript
interface UserProfileDto {
  id: string; // UUID
  email: string;
  name: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  bmr?: number; // Calculated Basal Metabolic Rate
}
```

### Update User Profile
Update biometrics. Updates trigger automatic BMR recalculation.

**PUT** `/users/profile`

#### Request Body
```typescript
interface UpdateProfileCommand {
  name?: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
}
```

#### Response (200 OK)
Returns updated `UserProfileDto`.

---

## 4. Activities Module

### Get Activities
List available activity types (e.g., Reading, Gym, Coding).

**GET** `/activities`
**Query Params**: `?userOnly=true` (optional - filter custom activities)

#### Response (200 OK)
```typescript
interface ActivityDto {
  id: string;
  name: string;
  category: "Leisure" | "Productivity" | "Fitness" | "Sleep" | "Other";
  icon: string;      // Emoji or Icon name e.g. "📖"
  isDefault: boolean;
}

// Response: ActivityDto[]
```

---

### Get Activity Logs
Get logs for a specific date (Daily View).

**GET** `/activitylogs?date=YYYY-MM-DD`

#### Response (200 OK)
```typescript
interface DailyLogSummaryDto {
  date: string; // "2024-02-16"
  logs: ActivityLogDto[];
  totalMinutes: number;
  streak: number; // Current daily streak count
}

interface ActivityLogDto {
  id: string;
  activityId: string;
  activityName: string;
  userId: string;
  date: string;
  durationMinutes: number;
  notes?: string;
  tags: string[];
}
```

### Create Activity Log
Log a performed activity.

**POST** `/activitylogs`

#### Request Body
```typescript
interface CreateActivityLogCommand {
  activityId: string;
  date: string;       // "2024-02-16"
  durationMinutes: number; // > 0
  notes?: string;
  tags?: string[];
}
```

#### Response (201 Created)
Returns created `ActivityLogDto`.

### Update Activity Log
Edit an existing log entry.

**PUT** `/activitylogs/{id}`

#### Request Body
```typescript
interface UpdateActivityLogCommand {
  durationMinutes?: number;
  notes?: string;
  tags?: string[];
}
```

#### Response (200 OK)
Returns updated `ActivityLogDto`.

### Delete Activity Log
Remove a log entry.

**DELETE** `/activitylogs/{id}`

#### Response (204 No Content)
Empty response on success.

---

## 5. Meals Module

### Search Foods
Search for foods in global dict + user customs.

**GET** `/foods?search=apple&limit=10`

#### Response (200 OK)
```typescript
interface FoodDto {
  id: string;
  name: string;
  servingSize: number;
  unit: string; // "g", "ml", "oz", "slice"
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
// Response: FoodDto[]
```

### Get Daily Meals
Get full diet log for a day.

**GET** `/meals?date=YYYY-MM-DD`

#### Response (200 OK)
```typescript
interface DailyMealsDto {
  date: string;
  meals: MealDto[];
  grandTotal: NutrientSummaryDto;
}

interface MealDto {
  id: string;
  name: string; // "Breakfast", "Snack"
  foods: MealFoodDto[];
  grandTotal: NutrientSummaryDto;
}

interface MealFoodDto {
  id: string; // Mapping ID (MealFood ID)
  food: FoodDto;
  quantity: number; // Multiplier of serving size (e.g. 1.5)
  totals: NutrientSummaryDto; // Calculated: Food * Qty
}

interface NutrientSummaryDto {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
```

### Create Meal
Start a meal entry.

**POST** `/meals`

#### Request Body
```typescript
interface CreateMealCommand {
  date: string;
  name: string;
  foods: Array<{
    foodId: string;
    quantity: number;
  }>;
}
```
**Response (201 Created)**: `MealDto`

### Update Food in Meal
Change quantity of a food item within a meal.

**PUT** `/meals/{mealId}/foods/{foodId}`

#### Request Body
```typescript
interface UpdateMealFoodCommand {
  quantity: number; // New quantity. 0 = remove? (Better use DELETE)
}
```
**Response (200 OK)**: `NutrientSummaryDto` (Returns the new totals for this specific item).

### Delete Meal
Remove entire meal.

**DELETE** `/meals/{mealId}`

**Response (204 No Content)**

---

## 6. Workouts Module

### Get Workouts
Get workouts for a day.

**GET** `/workouts?date=YYYY-MM-DD`

#### Response (200 OK)
```typescript
interface DailyWorkoutsDto {
  workouts: WorkoutDto[];
}

interface WorkoutDto {
  id: string;
  name: string; // "Leg Day"
  durationMinutes?: number;
  volume: number; // Total volume (kg * reps)
  exercises: WorkoutExerciseDto[];
}

interface WorkoutExerciseDto {
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: SetDto[];
}

interface SetDto {
  setNumber: number;
  reps?: number;
  weightKg?: number;
  rpe?: number;
  oneRepMax?: number; // Calculated 1RM Epley formula
}
```

### Create Workout
Log a full session.

**POST** `/workouts`

#### Request Body
```typescript
interface CreateWorkoutCommand {
  date: string;
  name: string;
  exercises: Array<{
    exerciseId: string;
    order: number; // 0-indexed
    sets: Array<{
      setNumber: number;
      reps: number;
      weightKg: number;
      rpe?: number;
    }>;
  }>;
}
```
**Response (201 Created)**: `WorkoutDto`

### Delete Workout
**DELETE** `/workouts/{id}`

**Response (204 No Content)**

---

## 7. Dashboard Module

### Get Daily Dashboard
Aggregated metrics for the home screen.

**GET** `/dashboard/daily?date=YYYY-MM-DD`

#### Response (200 OK)
```typescript
interface DashboardDailyDto {
  date: string;
  activities: DailyLogSummaryDto; // See Activities Module
  meals: NutrientSummaryDto;      // See Meals Module
  workoutsCompleted: number;
  activityStreak: number;
  calorieGoal: number;            // Based on User Profile BMR
  quickStats: QuickStat[];
}

interface QuickStat {
  label: string; // "Total Calories", "Workouts"
  value: string; // "2400", "1"
}
```

## 8. Reports Module

### Get Activity Reports
Data for charts/graphs.

**GET** `/reports/activities?from=YYYY-MM-DD&to=YYYY-MM-DD`

#### Response (200 OK)
```typescript
interface ActivityReportDto {
  from: string;
  to: string;
  items: Array<{
    activityName: string;
    totalHours: number;
    count: number;
  }>;
}
```

---

## 9. Error Handling

We use **RFC 7807 Problem Details**.

**400 Bad Request (Validation Error)**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "DurationMinutes": [
      "'Duration Minutes' must be greater than '0'."
    ]
  }
}
```

**401 Unauthorized**: Token missing or invalid.
**403 Forbidden**: Token valid but user lacks permission (e.g. accessing another user's data).
**404 Not Found**: ID does not exist.
**500 Internal Server Error**: Something went wrong on the server.

---

## 10. React Integration Guide

### 📂 `src/types/api.ts`
Copy/paste the interfaces above into this file.

### 📂 `src/lib/api.ts` (Axios Client)
```typescript
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 📂 `src/hooks/useDashboard.ts` (React Query)
```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardDailyDto } from '@/types/api';

export const useDailyDashboard = (date: string) => {
  return useQuery<DashboardDailyDto>({
    queryKey: ['dashboard', date],
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/daily?date=${date}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};
```

### ✨ Optimistic Updates Example (Meals)
```typescript
const useUpdateMealFood = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => api.put(...),
    onMutate: async ({ mealId, foodId, quantity }) => {
       await queryClient.cancelQueries({ queryKey: ['meals'] });
       const previous = queryClient.getQueryData(['meals']);
       
       // Optimistically update quantity in cache
       queryClient.setQueryData(['meals'], (old) => {
          // logic to find meal -> food and set quantity
          return newOld;
       });
       
       return { previous };
    },
    onError: (err, newTodo, context) => {
       queryClient.setQueryData(['meals'], context.previous);
       toast.error("Failed to update quantity");
    },
    onSettled: () => {
       queryClient.invalidateQueries({ queryKey: ['meals'] });
    }
  });
};
```
