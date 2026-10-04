namespace VitaTrack.Api.Reports.DTOs;

// Nutrition
public record NutritionReportItem(DateOnly Date, decimal Calories, decimal ProteinG, decimal CarbsG, decimal FatG);

public record NutritionSlotAggregateDto(long MealSlotId, string MealSlotName, decimal TotalCalories, decimal ProteinG, decimal CarbsG, decimal FatG, int MealCount);

/// <param name="AvgProteinCaloriePercent">Average % of calories from protein over the range (0–100).</param>
public record NutritionReportDto(
    DateOnly From,
    DateOnly To,
    List<NutritionReportItem> DailyItems,
    List<NutritionSlotAggregateDto> SlotAggregates,
    decimal AvgProteinCaloriePercent);

// Workouts
public record WorkoutReportItem(string ExerciseName, decimal TotalVolume, int TotalSets, decimal AverageRpe);

public record WorkoutReportDto(
    DateOnly From,
    DateOnly To,
    List<WorkoutReportItem> Items,
    int TotalSessions,
    int TotalDurationMinutes,
    decimal TotalDistanceKm);
