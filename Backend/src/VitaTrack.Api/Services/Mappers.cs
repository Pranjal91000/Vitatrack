using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Api.Users.DTOs;
using VitaTrack.Api.Workouts.DTOs;
using VitaTrack.Core.Common;
using VitaTrack.Core.Entities;
using VitaTrack.Core.Enums;

namespace VitaTrack.Api.Services;

public static class WorkoutMapper
{
    public static ExerciseDto ToDto(Exercise e) => new(
        e.Id,
        e.Name,
        e.Type,
        e.MuscleGroups,
        e.Equipment,
        e.MeasurementType,
        e.IsDefault,
        e.UserId != null,
        e.DemoMediaId.HasValue ? $"exercises/{e.Id}/demo-media" : null);

    public static SetDto ToDto(Set s) => new(
        s.Id,
        s.SetNumber,
        s.Reps,
        s.WeightKg,
        s.DurationSeconds,
        s.Rpe,
        TrainingMath.OneRepMax(s),
        s.DistanceKm,
        s.ElevationGainM,
        s.PaceMinPerKm,
        s.Pace,
        s.SetType,
        s.IsCompleted);

    public static WorkoutExerciseDto ToDto(WorkoutExercise we, IReadOnlyDictionary<long, Exercise>? lookup = null)
    {
        var exercise = we.Exercise ?? (lookup != null && lookup.TryGetValue(we.ExerciseId, out var e) ? e : null);
        return new WorkoutExerciseDto(
            we.Id,
            we.ExerciseId,
            exercise?.Name ?? "Unknown exercise",
            exercise?.MuscleGroups ?? Array.Empty<string>(),
            exercise?.Equipment,
            exercise?.MeasurementType ?? MeasurementType.WeightReps,
            we.Order,
            we.Notes,
            we.RestSeconds,
            we.Sets.Where(s => !s.IsDeleted).OrderBy(s => s.SetNumber).Select(s => ToDto(s)).ToList());
    }

    public static WorkoutDto ToDto(Workout w, IReadOnlyDictionary<long, Exercise>? lookup = null, List<PersonalRecordDto>? records = null)
    {
        var exercises = w.Exercises.Where(e => !e.IsDeleted).OrderBy(e => e.Order).ToList();
        var allSets = exercises.SelectMany(e => e.Sets.Where(s => !s.IsDeleted)).ToList();
        var working = allSets.Where(TrainingMath.IsWorkingSet).ToList();

        return new WorkoutDto(
            w.Id,
            w.Name,
            w.Date,
            w.DurationMinutes,
            w.Notes,
            w.StartedAt,
            w.EndedAt,
            exercises.Select(e => ToDto(e, lookup)).ToList(),
            TrainingMath.Volume(allSets),
            working.Count,
            working.Sum(s => s.Reps ?? 0),
            w.IsTemplate,
            records ?? new List<PersonalRecordDto>());
    }

    public static WorkoutSummaryDto ToSummary(Workout w)
    {
        var exercises = w.Exercises.Where(e => !e.IsDeleted).OrderBy(e => e.Order).ToList();
        var allSets = exercises.SelectMany(e => e.Sets.Where(s => !s.IsDeleted)).ToList();

        return new WorkoutSummaryDto(
            w.Id,
            w.Name,
            w.Date,
            w.StartedAt,
            w.DurationMinutes,
            TrainingMath.Volume(allSets),
            allSets.Count(TrainingMath.IsWorkingSet),
            exercises.Select(e =>
            {
                var working = e.Sets.Where(s => !s.IsDeleted && TrainingMath.IsWorkingSet(s)).ToList();
                // "Best set" = heaviest, tie-broken by reps.
                var best = working
                    .OrderByDescending(s => s.WeightKg ?? 0)
                    .ThenByDescending(s => s.Reps ?? 0)
                    .FirstOrDefault();
                return new WorkoutSummaryExerciseDto(
                    e.ExerciseId,
                    e.Exercise?.Name ?? "Unknown exercise",
                    working.Count,
                    best?.WeightKg,
                    best?.Reps,
                    e.Exercise?.MeasurementType ?? MeasurementType.WeightReps);
            }).ToList());
    }

    public static Set ToEntity(SetRequest r) => new()
    {
        SetNumber = r.SetNumber,
        Reps = r.Reps,
        WeightKg = r.WeightKg,
        DurationSeconds = r.DurationSeconds,
        Rpe = r.Rpe,
        DistanceKm = r.DistanceKm,
        ElevationGainM = r.ElevationGainM,
        PaceMinPerKm = r.PaceMinPerKm,
        SetType = r.SetType,
        IsCompleted = r.IsCompleted
    };

    public static List<WorkoutExercise> ToEntities(IEnumerable<WorkoutExerciseRequest> requests, int startOrder = 1)
    {
        var order = startOrder;
        var result = new List<WorkoutExercise>();
        foreach (var req in requests)
        {
            var we = new WorkoutExercise
            {
                ExerciseId = req.ExerciseId,
                Order = order++,
                Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim(),
                RestSeconds = req.RestSeconds
            };
            var setNo = 1;
            foreach (var s in req.Sets.OrderBy(s => s.SetNumber))
            {
                var set = ToEntity(s);
                set.SetNumber = setNo++; // renumber so gaps from deleted rows never reach the DB
                we.Sets.Add(set);
            }
            result.Add(we);
        }
        return result;
    }
}

public static class NutritionMapper
{
    public static FoodDto ToDto(Food f) => new(
        f.Id, f.Name, f.ServingSize, f.Unit, f.Calories, f.ProteinG, f.CarbsG, f.FatG, f.UserId != null);

    public static NutrientSummaryDto Totals(MealFood mf) => new(
        (int)Math.Round(mf.Quantity * mf.Food.Calories, 0),
        Math.Round(mf.Quantity * mf.Food.ProteinG, 1),
        Math.Round(mf.Quantity * mf.Food.CarbsG, 1),
        Math.Round(mf.Quantity * mf.Food.FatG, 1));

    public static MealFoodDto ToDto(MealFood mf) => new(mf.Id, ToDto(mf.Food), mf.Quantity, Totals(mf));

    public static MealDto ToDto(Meal m)
    {
        var foods = m.MealFoods.Where(mf => !mf.IsDeleted).OrderBy(mf => mf.CreatedAt).Select(mf => ToDto(mf)).ToList();
        return new MealDto(m.Id, m.MealSlotId, m.MealSlot?.Name ?? "Meal", m.Date, m.Notes, foods,
            NutrientSummaryDto.Sum(foods.Select(f => f.Totals)));
    }
}

public static class GoalCalculator
{
    public const decimal DefaultActivityFactor = 1.55m; // moderately active — typical for someone training 3–5x/week

    public static int? Tdee(User u)
    {
        var bmr = u.Bmr ?? TrainingMath.Bmr(u.WeightKg, u.HeightCm, u.Age, u.Sex);
        if (!bmr.HasValue) return null;
        return (int)Math.Round(bmr.Value * (u.ActivityFactor ?? DefaultActivityFactor), 0);
    }

    /// <summary>
    /// Explicit goals win. Otherwise: calories = TDEE (or 2000), protein = 1.8 g/kg (or 25% kcal),
    /// fat = 25% kcal, carbs = the remainder.
    /// </summary>
    public static NutritionGoalsDto Resolve(User? u)
    {
        if (u == null) return new NutritionGoalsDto(2000, 125, 225, 56, false);

        var calories = u.CalorieGoal ?? Tdee(u) ?? 2000;
        var protein = u.ProteinGoalG
                      ?? (u.WeightKg.HasValue ? (int)Math.Round(u.WeightKg.Value * 1.8m) : (int)Math.Round(calories * 0.25m / 4m));
        var fat = u.FatGoalG ?? (int)Math.Round(calories * 0.25m / 9m);
        var carbs = u.CarbsGoalG ?? Math.Max(0, (int)Math.Round((calories - protein * 4m - fat * 9m) / 4m));

        var isCustom = u.CalorieGoal.HasValue || u.ProteinGoalG.HasValue || u.CarbsGoalG.HasValue || u.FatGoalG.HasValue;
        return new NutritionGoalsDto(calories, protein, carbs, fat, isCustom);
    }
}
