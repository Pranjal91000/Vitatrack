using VitaTrack.Api.Meals.DTOs;

namespace VitaTrack.Api.Dashboard.DTOs;

public record QuickStat(string Label, string Value);

public record DashboardDailyDto(
    DateOnly Date,
    NutrientSummaryDto Meals,
    int WorkoutsCompleted,
    int WellnessStreak,
    int CalorieGoal,
    int MealsLoggedCount,
    List<QuickStat> QuickStats
);
