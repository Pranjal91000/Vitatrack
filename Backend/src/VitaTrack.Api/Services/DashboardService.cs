using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Dashboard.DTOs;
using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Interfaces;

namespace VitaTrack.Api.Services
{
    public class DashboardService(
        IMealRepository mealRepository,
        IWorkoutRepository workoutRepository,
        IUserRepository userRepository,
        IAnalyticsService analyticsService,
        IJwtHelperService jwtHelperService) : IDashboardService
    {
        private readonly IMealRepository _mealRepository = mealRepository;
        private readonly IWorkoutRepository _workoutRepository = workoutRepository;
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IAnalyticsService _analyticsService = analyticsService;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        public async Task<DashboardDailyDto> GetDailyDashboardAsync(string dateString, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();

            if (!DateOnly.TryParse(dateString, out var parsedDate))
                parsedDate = DateOnly.FromDateTime(DateTime.UtcNow);

            var meals = await _mealRepository.GetDailyMealsAsync(userId, parsedDate, cancellationToken);

            decimal totalCalories = 0;
            decimal totalProtein = 0;
            decimal totalCarbs = 0;
            decimal totalFat = 0;

            foreach (var meal in meals)
            {
                foreach (var mf in meal.MealFoods)
                {
                    totalCalories += (decimal)mf.Quantity * mf.Food.Calories;
                    totalProtein += (decimal)mf.Quantity * mf.Food.ProteinG;
                    totalCarbs += (decimal)mf.Quantity * mf.Food.CarbsG;
                    totalFat += (decimal)mf.Quantity * mf.Food.FatG;
                }
            }

            var mealTotals = new NutrientSummaryDto((int)totalCalories, totalProtein, totalCarbs, totalFat);

            var workouts = await _workoutRepository.GetWorkoutsByDateAsync(userId, parsedDate, cancellationToken);
            var workoutsCount = workouts.Count;

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            int calorieGoal = user?.Bmr.HasValue == true ? (int)(user.Bmr.Value * 1.2m) : 2000;

            var streak = await _analyticsService.GetWellnessStreakAsync(userId, cancellationToken);

            var stats = new List<QuickStat>
            {
                new QuickStat("Calories Consumed", ((int)totalCalories).ToString()),
                new QuickStat("Protein", $"{totalProtein:F0}g"),
                new QuickStat("Workouts", workoutsCount.ToString()),
                new QuickStat("Meals logged", meals.Count.ToString()),
            };

            return new DashboardDailyDto(
                parsedDate,
                mealTotals,
                workoutsCount,
                streak,
                calorieGoal,
                meals.Count(),
                stats
            );
        }
    }
}
