using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class MealRepository(AppDbContext appDbContext) : IMealRepository
    {
        private readonly AppDbContext _appDbContext = appDbContext;

        public async Task<List<Meal>> GetDailyMealsAsync(long userId, DateOnly date, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Meals
                .Include(m => m.MealFoods)
                .ThenInclude(mf => mf.Food)
                .Include(m => m.MealSlot)
                .Where(m => m.UserId == userId && m.Date == date)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> CanUseMealSlotAsync(long userId, long mealSlotId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.MealSlots.AnyAsync(
                s => s.Id == mealSlotId && (s.UserId == null || s.UserId == userId),
                cancellationToken);
        }

        public async Task<List<Food>> GetFoodsByIdsAsync(List<long> foodIds, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Foods
                .Where(f => foodIds.Contains(f.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<Meal> CreateMealAsync(Meal meal, CancellationToken cancellationToken = default)
        {
            await _appDbContext.Meals.AddAsync(meal, cancellationToken);
            await _appDbContext.SaveChangesAsync(cancellationToken);

            await _appDbContext.Entry(meal).Reference(m => m.MealSlot).LoadAsync(cancellationToken);
            await _appDbContext.Entry(meal).Collection(m => m.MealFoods).Query().Include(mf => mf.Food).LoadAsync(cancellationToken);

            return meal;
        }

        public async Task<Meal?> GetByIdAsync(long mealId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Meals.FirstOrDefaultAsync(m => m.Id == mealId, cancellationToken);
        }

        public async Task<bool> DeleteMealAsync(Meal meal, CancellationToken cancellationToken = default)
        {
            _appDbContext.Meals.Remove(meal);
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<MealFood?> GetMealFoodAsync(long mealId, long foodId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.MealFoods
                .Include(mf => mf.Food)
                .FirstOrDefaultAsync(mf => mf.MealId == mealId && mf.FoodId == foodId, cancellationToken);
        }

        public async Task<bool> DeleteMealFoodAsync(MealFood mealFood, CancellationToken cancellationToken = default)
        {
            _appDbContext.MealFoods.Remove(mealFood);
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }
    }
}
