using VitaTrack.Api.Meals.DTOs;

namespace VitaTrack.Api.Abstractions
{
    public interface IMealService
    {
        Task<DailyMealsDto?> GetDailyMealsAsync(string dateString, CancellationToken cancellationToken = default);
        Task<(MealDto? Meal, string? Error)> CreateMealAsync(CreateMealRequest request, CancellationToken cancellationToken = default);
        Task<(bool Success, string? Error)> DeleteMealAsync(long mealId, CancellationToken cancellationToken = default);
        Task<(NutrientSummaryDto? Summary, string? Error)> UpdateMealFoodAsync(long mealId, long foodId, UpdateMealFoodRequest request, CancellationToken cancellationToken = default);

        Task<(MealEntryDto? Entry, string? Error)> AddEntryAsync(AddMealEntryRequest request, CancellationToken cancellationToken = default);
        Task<(MealEntryDto? Entry, string? Error)> UpdateEntryAsync(long mealFoodId, UpdateMealFoodRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteEntryAsync(long mealFoodId, CancellationToken cancellationToken = default);
        Task<(int Copied, string? Error)> CopyMealsAsync(CopyMealsRequest request, CancellationToken cancellationToken = default);
    }
}
