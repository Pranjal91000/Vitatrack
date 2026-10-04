using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Reports.DTOs;
using VitaTrack.Api.Workouts.DTOs;
using VitaTrack.Core.Abstraction;

namespace VitaTrack.Api.Services
{
    public class ReportService(IReportRepository reportRepository, IJwtHelperService jwtHelperService) : IReportService
    {
        private readonly IReportRepository _reportRepository = reportRepository;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        public async Task<(NutritionReportDto? Report, string? Error)> GetNutritionReportAsync(string from, string to, CancellationToken cancellationToken = default)
        {
            if (!DateOnly.TryParse(from, out var fromDate) || !DateOnly.TryParse(to, out var toDate))
                return (null, "InvalidDateFormat");
            if (toDate < fromDate)
                return (null, "InvalidDateRange");

            var userId = _jwtHelperService.GetUserId();
            var meals = await _reportRepository.GetMealsForReportAsync(userId, fromDate, toDate, cancellationToken);

            var groupedByDate = meals
                .GroupBy(m => m.Date)
                .Select(g => new NutritionReportItem(
                    g.Key,
                    g.Sum(m => m.MealFoods.Sum(mf => mf.Quantity * mf.Food.Calories)),
                    g.Sum(m => m.MealFoods.Sum(mf => (decimal)mf.Quantity * mf.Food.ProteinG)),
                    g.Sum(m => m.MealFoods.Sum(mf => (decimal)mf.Quantity * mf.Food.CarbsG)),
                    g.Sum(m => m.MealFoods.Sum(mf => (decimal)mf.Quantity * mf.Food.FatG))
                ))
                .OrderBy(x => x.Date)
                .ToList();

            var slotAggregates = meals
                .GroupBy(m => new { m.MealSlotId, SlotName = m.MealSlot.Name })
                .Select(g => new NutritionSlotAggregateDto(
                    g.Key.MealSlotId,
                    g.Key.SlotName,
                    g.Sum(m => m.MealFoods.Sum(mf => mf.Quantity * mf.Food.Calories)),
                    g.Sum(m => m.MealFoods.Sum(mf => (decimal)mf.Quantity * mf.Food.ProteinG)),
                    g.Sum(m => m.MealFoods.Sum(mf => (decimal)mf.Quantity * mf.Food.CarbsG)),
                    g.Sum(m => m.MealFoods.Sum(mf => (decimal)mf.Quantity * mf.Food.FatG)),
                    g.Count()
                ))
                .OrderByDescending(x => x.TotalCalories)
                .ToList();

            decimal avgProteinPct = 0;
            if (groupedByDate.Count > 0)
            {
                var proteinCalsPerDay = groupedByDate
                    .Where(d => d.Calories > 0)
                    .Select(d => (d.ProteinG * 4m) / d.Calories * 100m)
                    .ToList();
                if (proteinCalsPerDay.Count > 0)
                    avgProteinPct = Math.Round(proteinCalsPerDay.Average(), 1);
            }

            return (new NutritionReportDto(fromDate, toDate, groupedByDate, slotAggregates, avgProteinPct), null);
        }

        public async Task<(WorkoutReportDto? Report, string? Error)> GetWorkoutReportAsync(string from, string to, CancellationToken cancellationToken = default)
        {
            if (!DateOnly.TryParse(from, out var fromDate) || !DateOnly.TryParse(to, out var toDate))
                return (null, "InvalidDateFormat");
            if (toDate < fromDate)
                return (null, "InvalidDateRange");

            var userId = _jwtHelperService.GetUserId();
            var workouts = await _reportRepository.GetWorkoutsForReportAsync(userId, fromDate, toDate, cancellationToken);

            var allExerciseRows = workouts.SelectMany(w => w.Exercises).ToList();

            var grouped = allExerciseRows
                .GroupBy(we => we.Exercise.Name)
                .Select(g => new WorkoutReportItem(
                    g.Key,
                    g.Sum(we => we.Sets.Sum(s => (s.WeightKg ?? 0) * (s.Reps ?? 0))),
                    g.Sum(we => we.Sets.Count),
                    g.SelectMany(we => we.Sets).Where(s => s.Rpe.HasValue).Select(s => s.Rpe!.Value).DefaultIfEmpty(0).Average()
                ))
                .OrderByDescending(x => x.TotalVolume)
                .ToList();

            var totalDurationMinutes = allExerciseRows.Sum(we => we.Sets.Sum(s => (s.DurationSeconds ?? 0) / 60));
            var totalDistanceKm = allExerciseRows.Sum(we => we.Sets.Sum(s => s.DistanceKm ?? 0));

            return (new WorkoutReportDto(fromDate, toDate, grouped, workouts.Count, totalDurationMinutes, totalDistanceKm), null);
        }

        public async Task<(ExerciseMonthlyReportDto? Report, string? Error)> GetExerciseMonthlyReportAsync(long exerciseId, string month, CancellationToken cancellationToken = default)
        {
            if (!DateTime.TryParse($"{month}-01", out var startOfMonth))
                return (null, "InvalidMonthFormat");

            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
            var rangeFrom = DateOnly.FromDateTime(startOfMonth);
            var rangeTo = DateOnly.FromDateTime(endOfMonth);

            var userId = _jwtHelperService.GetUserId();
            var workouts = await _reportRepository.GetWorkoutsForExerciseMonthlyReportAsync(userId, exerciseId, rangeFrom, rangeTo, cancellationToken);
            var exercise = await _reportRepository.GetExerciseByIdAsync(exerciseId, cancellationToken);
            if (exercise == null) return (null, "NotFound");

            var dailySummaries = new List<ExerciseDailySummaryDto>();
            var groupedByDate = workouts.GroupBy(w => w.Date).OrderBy(g => g.Key);

            foreach (var group in groupedByDate)
            {
                var sets = group.SelectMany(w => w.Exercises.Where(we => we.ExerciseId == exerciseId).SelectMany(we => we.Sets)).ToList();
                if (!sets.Any()) continue;

                decimal totalVolume = sets.Sum(s => (s.WeightKg ?? 0) * (s.Reps ?? 0));
                decimal maxWeight = sets.Max(s => s.WeightKg) ?? 0;
                decimal totalDistance = sets.Sum(s => s.DistanceKm) ?? 0;
                int totalDuration = sets.Sum(s => s.DurationSeconds) ?? 0;
                int totalReps = sets.Sum(s => s.Reps) ?? 0;

                decimal avgPace = 0;
                var paceSets = sets.Where(s => s.PaceMinPerKm.HasValue).ToList();
                if (paceSets.Any())
                {
                    avgPace = paceSets.Average(s => s.PaceMinPerKm!.Value);
                }
                else if (totalDistance > 0 && totalDuration > 0)
                {
                    avgPace = (decimal)totalDuration / 60m / totalDistance;
                }

                dailySummaries.Add(new ExerciseDailySummaryDto(
                    group.Key,
                    totalVolume,
                    maxWeight,
                    totalDistance,
                    avgPace,
                    totalDuration,
                    totalReps
                ));
            }

            return (new ExerciseMonthlyReportDto(exerciseId, exercise.Name, dailySummaries), null);
        }
    }
}
