using VitaTrack.Api.Users.DTOs;

namespace VitaTrack.Api.Meals.DTOs;

public record NutrientSummaryDto(int Calories, decimal ProteinG, decimal CarbsG, decimal FatG)
{
    public static NutrientSummaryDto Empty => new(0, 0, 0, 0);

    public static NutrientSummaryDto Sum(IEnumerable<NutrientSummaryDto> items)
    {
        var list = items.ToList();
        return new NutrientSummaryDto(
            list.Sum(x => x.Calories),
            Math.Round(list.Sum(x => x.ProteinG), 1),
            Math.Round(list.Sum(x => x.CarbsG), 1),
            Math.Round(list.Sum(x => x.FatG), 1));
    }
}

public record FoodDto(long Id, string Name, decimal ServingSize, string Unit, int Calories, decimal ProteinG, decimal CarbsG, decimal FatG, bool IsCustom);

public record MealFoodDto(long Id, FoodDto Food, decimal Quantity, NutrientSummaryDto Totals);

public record MealDto(long Id, long MealSlotId, string MealSlotName, DateOnly Date, string? Notes, List<MealFoodDto> Foods, NutrientSummaryDto GrandTotal);

public record MealSlotDto(long Id, long? UserId, string Name, int SortOrder);

public record DailyMealsDto(DateOnly Date, List<MealDto> Meals, NutrientSummaryDto Total, NutritionGoalsDto Goals);

/// <summary>Returned when a single food entry is added / edited.</summary>
public record MealEntryDto(long MealId, long MealSlotId, DateOnly Date, MealFoodDto Entry);
