# VitaTrack API

Base URL: `/api`. All endpoints except `auth/*` and `health` need `Authorization: Bearer <token>`.
Dates are `yyyy-MM-dd`; timestamps are ISO-8601 UTC; IDs are integers; **all weights are kilograms**.
Validation errors return `400` with RFC 7807 `ValidationProblemDetails`; unhandled errors return `500` problem details.

## Auth
| Method | Path | Notes |
|---|---|---|
| POST | `auth/register` | `{ email, password (≥8), name }` → `{ token, refreshToken, userId, email, name }` |
| POST | `auth/login` | `{ email, password }` |
| POST | `auth/refresh` | `{ refreshToken }` — rotates the refresh token (30-day lifetime) |

## Profile
| GET | `users/profile` | Profile + `tdee` + `effectiveGoals` (explicit goals, or derived: TDEE, 1.8 g/kg protein, 25 % fat) |
|---|---|---|
| PUT | `users/profile` | Full replace: `age, weightKg, heightCm, sex ('male'/'female'), activityFactor, calorieGoal, proteinGoalG, carbsGoalG, fatGoalG, weightGoalKg, weightUnit ('kg'/'lb'), defaultRestSeconds`. `null` clears a goal. |

## Exercises
| GET | `exercises?search=&muscle=&equipment=&page=1&limit=500` | `{ data: ExerciseDto[], meta }` |
|---|---|---|
| GET | `exercises/{id}?sessions=30` | Exercise, all-time bests (`bestOneRepMax`, `maxWeightKg`, `bestSetVolume`, `maxReps`) and recent sessions |
| GET | `exercises/last-performance?ids=1,2,3` | Sets from the last time each exercise was done ("Previous" column) |
| POST / PUT / DELETE | `exercises`, `exercises/{id}` | Custom exercises: `{ name, type, muscleGroups[], measurementType, equipment }` |

`measurementType`: 0 weight×reps, 1 distance & time, 2 other, 3 reps only, 4 timed hold, 5 distance.

## Workouts
| GET | `workouts?date=` | Workouts on a day |
|---|---|---|
| GET | `workouts/history?page=&limit=` | Paged summaries, newest first |
| GET | `workouts/{id}` | Full workout incl. `records` (PRs it set) |
| POST | `workouts` | Save a session (see below). Response includes `records`. |
| PUT | `workouts/{id}` | Replace a logged workout |
| DELETE | `workouts/{id}` | |
| POST | `workouts/{id}/save-as-routine` | `{ name? }` |
| GET | `workouts/heatmap?from=&to=` | `[{ date, count }]` |

```jsonc
// POST /api/workouts
{
  "date": "2026-10-04", "name": "Push day", "notes": null,
  "startedAt": "2026-10-04T05:30:00Z", "endedAt": "2026-10-04T06:34:00Z", "durationMinutes": 64,
  "exercises": [{
    "exerciseId": 1, "restSeconds": 120, "notes": "Seat 4",
    "sets": [
      { "setNumber": 1, "weightKg": 40, "reps": 10, "setType": 1, "isCompleted": true },
      { "setNumber": 2, "weightKg": 75, "reps": 6,  "setType": 0, "isCompleted": true }
    ]
  }]
}
```
`setType`: 0 normal, 1 warm-up, 2 drop, 3 failure. Warm-ups and incomplete sets are excluded from volume and records.

## Routines
`GET routines`, `GET routines/{id}`, `POST routines`, `PUT routines/{id}`, `DELETE routines/{id}` —
body `{ name, notes?, exercises: WorkoutExerciseRequest[] }`; set values are targets.

## Nutrition
| GET | `meal-slots` / POST `meal-slots` | Built-in Breakfast, Lunch, Snacks, Dinner + custom |
|---|---|---|
| GET | `meals?date=` | `{ date, meals, total, goals }` |
| POST | `meals/entries` | `{ date, mealSlotId, foodId, quantity }` — adds to that slot's meal (created if needed) |
| PUT | `meals/entries/{id}` | `{ quantity }` (servings; 0 removes) |
| DELETE | `meals/entries/{id}` | |
| POST | `meals/copy` | `{ fromDate, toDate, mealSlotId? }` (null slot = whole day) |
| GET | `foods?search=&limit=` | Prefix matches and your foods first |
| GET | `foods/recent`, `foods/mine` | |
| POST / PUT / DELETE | `foods`, `foods/{id}` | `{ name, servingSize, unit, calories, proteinG, carbsG, fatG }` (per serving) |

Legacy `POST meals`, `DELETE meals/{id}`, `PUT meals/{mealId}/foods/{foodId}` still work.

## Body weight
| POST | `weight-tracker` | `{ recordedOn, weight, bodyFatPercent?, notes? }` — one entry per day (re-posting replaces) |
|---|---|---|
| PUT / DELETE / GET | `weight-tracker/{id}` | |
| GET | `weight-tracker/latest-record` | |
| GET | `weight-tracker/weight-history?fromDate=&toDate=` | Ascending by date |

The latest weigh-in is copied to the profile weight (used for BMR and protein targets).

## Dashboard & reports
| GET | `dashboard/summary?date=` | Today's intake vs goals, today's/last workout, this week (Mon–Sun), streak, weight snapshot |
|---|---|---|
| GET | `reports/progress?weeks=12` | Weekly workouts/volume/sets/minutes + sets per muscle (last 4 weeks; secondary muscles count 0.5) |
| GET | `reports/nutrition?from=&to=` | Daily totals |
| GET | `reports/workouts?from=&to=` | Per-exercise volume |
| GET | `reports/exercises/{id}/monthly?month=yyyy-MM` | |
