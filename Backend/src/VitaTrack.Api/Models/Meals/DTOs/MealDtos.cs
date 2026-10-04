namespace VitaTrack.Api.Meals.DTOs;

public record NutrientSummaryDto(int Calories, decimal ProteinG, decimal CarbsG, decimal FatG);

public record FoodDto(long Id, string Name, decimal ServingSize, string Unit, int Calories, decimal ProteinG, decimal CarbsG, decimal FatG);

public record MealFoodDto(long Id, FoodDto Food, decimal Quantity, NutrientSummaryDto Totals);

public record MealDto(long Id, long MealSlotId, string MealSlotName, DateOnly Date, string? Notes, List<MealFoodDto> Foods, NutrientSummaryDto GrandTotal);

public record MealSlotDto(long Id, long? UserId, string Name, int SortOrder);

public record DailyMealsDto(List<MealDto> Meals);
