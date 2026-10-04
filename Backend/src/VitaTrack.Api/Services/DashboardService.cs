using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Dashboard.DTOs;
using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Common;
using VitaTrack.Core.Interfaces;

namespace VitaTrack.Api.Services
{
    public class DashboardService(
        IMealRepository mealRepository,
        IWorkoutRepository workoutRepository,
        IReportRepository reportRepository,
        IUserRepository userRepository,
        IWeightTrackerRepository weightRepository,
        IAnalyticsService analyticsService,
        IJwtHelperService jwtHelperService) : IDashboardService
    {
        private readonly IMealRepository _mealRepository = mealRepository;
        private readonly IWorkoutRepository _workoutRepository = workoutRepository;
        private readonly IReportRepository _reportRepository = reportRepository;
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IWeightTrackerRepository _weightRepository = weightRepository;
        private readonly IAnalyticsService _analyticsService = analyticsService;
        private readonly IJwtHelperService _jwt = jwtHelperService;

        public async Task<DashboardDailyDto> GetDailyDashboardAsync(string dateString, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            if (!DateOnly.TryParse(dateString, out var parsedDate))
                parsedDate = DateOnly.FromDateTime(DateTime.UtcNow);

            var meals = await _mealRepository.GetDailyMealsAsync(userId, parsedDate, cancellationToken);
            var totals = NutrientSummaryDto.Sum(meals.Select(m => NutritionMapper.ToDto(m).GrandTotal));
            var workouts = await _workoutRepository.GetWorkoutsByDateAsync(userId, parsedDate, cancellationToken);
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            var goals = GoalCalculator.Resolve(user);
            var streak = await _analyticsService.GetWellnessStreakAsync(userId, cancellationToken);

            var stats = new List<QuickStat>
            {
                new("Calories Consumed", totals.Calories.ToString()),
                new("Protein", $"{totals.ProteinG:F0}g"),
                new("Workouts", workouts.Count.ToString()),
                new("Meals logged", meals.Count.ToString()),
            };

            return new DashboardDailyDto(parsedDate, totals, workouts.Count, streak, goals.Calories, meals.Count, stats);
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync(string? dateString, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            if (!DateOnly.TryParse(dateString, out var date))
                date = DateOnly.FromDateTime(DateTime.UtcNow);

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            var goals = GoalCalculator.Resolve(user);

            // Nutrition today
            var meals = await _mealRepository.GetDailyMealsAsync(userId, date, cancellationToken);
            var consumed = NutrientSummaryDto.Sum(meals.Select(m => NutritionMapper.ToDto(m).GrandTotal));

            // Training week (Monday-based)
            var offset = ((int)date.DayOfWeek + 6) % 7;
            var weekStart = date.AddDays(-offset);
            var weekEnd = weekStart.AddDays(6);
            var weekWorkouts = await _workoutRepository.GetWorkoutsInRangeAsync(userId, weekStart, weekEnd, cancellationToken);
            var weekMeals = await _reportRepository.GetMealsForReportAsync(userId, weekStart, weekEnd, cancellationToken);

            var week = Enumerable.Range(0, 7).Select(i =>
            {
                var d = weekStart.AddDays(i);
                var kcal = weekMeals.Where(m => m.Date == d)
                    .SelectMany(m => m.MealFoods.Where(mf => !mf.IsDeleted))
                    .Sum(mf => mf.Quantity * mf.Food.Calories);
                return new DayActivityDto(d, weekWorkouts.Count(w => w.Date == d), (int)Math.Round(kcal));
            }).ToList();

            var todayWorkouts = weekWorkouts.Where(w => w.Date == date).Select(WorkoutMapper.ToSummary).ToList();
            var (latestHistory, _) = await _workoutRepository.GetHistoryAsync(userId, 1, 1, cancellationToken);
            var lastWorkout = latestHistory.Select(WorkoutMapper.ToSummary).FirstOrDefault();

            // Weight
            WeightSnapshotDto? weight = null;
            var latestWeight = await _weightRepository.GetLatestAsync(cancellationToken);
            if (latestWeight != null)
            {
                var monthAgo = await _weightRepository.GetLatestOnOrBeforeAsync(latestWeight.DateRecordedOn.AddDays(-30), cancellationToken);
                weight = new WeightSnapshotDto(
                    latestWeight.Weight,
                    latestWeight.DateRecordedOn,
                    monthAgo != null ? latestWeight.Weight - monthAgo.Weight : null,
                    user?.WeightGoalKg);
            }

            var streak = await _analyticsService.GetWellnessStreakAsync(userId, cancellationToken);

            return new DashboardSummaryDto(
                date,
                consumed,
                goals,
                todayWorkouts,
                lastWorkout,
                weekWorkouts.Count,
                weekWorkouts.Sum(w => TrainingMath.Volume(w.Exercises.SelectMany(e => e.Sets))),
                streak,
                weight,
                week);
        }
    }
}
