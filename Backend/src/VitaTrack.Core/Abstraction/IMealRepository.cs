using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Abstraction
{
    public interface IMealRepository
    {
        Task<List<Meal>> GetDailyMealsAsync(long userId, DateOnly date, CancellationToken cancellationToken = default);
        Task<bool> CanUseMealSlotAsync(long userId, long mealSlotId, CancellationToken cancellationToken = default);
        Task<List<Food>> GetFoodsByIdsAsync(List<long> foodIds, CancellationToken cancellationToken = default);
        Task<Meal> CreateMealAsync(Meal meal, CancellationToken cancellationToken = default);
        Task<Meal?> GetByIdAsync(long mealId, CancellationToken cancellationToken = default);
        Task<bool> DeleteMealAsync(Meal meal, CancellationToken cancellationToken = default);
        Task<MealFood?> GetMealFoodAsync(long mealId, long foodId, CancellationToken cancellationToken = default);
        Task<bool> DeleteMealFoodAsync(MealFood mealFood, CancellationToken cancellationToken = default);
        Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
