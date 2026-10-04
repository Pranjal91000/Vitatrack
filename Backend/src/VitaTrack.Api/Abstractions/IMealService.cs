using VitaTrack.Api.Meals.DTOs;

namespace VitaTrack.Api.Abstractions
{
    public interface IMealService
    {
        Task<DailyMealsDto?> GetDailyMealsAsync(string dateString, CancellationToken cancellationToken = default);
        Task<(MealDto? Meal, string? Error)> CreateMealAsync(CreateMealRequest request, CancellationToken cancellationToken = default);
        Task<(bool Success, string? Error)> DeleteMealAsync(long mealId, CancellationToken cancellationToken = default);
        Task<(NutrientSummaryDto? Summary, string? Error)> UpdateMealFoodAsync(long mealId, long foodId, UpdateMealFoodRequest request, CancellationToken cancellationToken = default);
    }
}
