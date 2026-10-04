using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Api.Users.DTOs;
using VitaTrack.Api.Workouts.DTOs;

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

public record WeightSnapshotDto(decimal LatestKg, DateOnly RecordedOn, decimal? ChangeKg30d, decimal? GoalKg);

public record DayActivityDto(DateOnly Date, int Workouts, int Calories);

/// <summary>Everything the "Today" screen needs in one request.</summary>
public record DashboardSummaryDto(
    DateOnly Date,
    NutrientSummaryDto Consumed,
    NutritionGoalsDto Goals,
    List<WorkoutSummaryDto> TodayWorkouts,
    WorkoutSummaryDto? LastWorkout,
    int WorkoutsThisWeek,
    decimal VolumeThisWeek,
    int ActiveDayStreak,
    WeightSnapshotDto? Weight,
    List<DayActivityDto> Week);
