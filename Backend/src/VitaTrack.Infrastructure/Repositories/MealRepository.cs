using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class MealRepository(AppDbContext appDbContext) : IMealRepository
    {
        private readonly AppDbContext _db = appDbContext;

        public async Task<List<Meal>> GetDailyMealsAsync(long userId, DateOnly date, CancellationToken cancellationToken = default)
        {
            return await _db.Meals
                .Include(m => m.MealFoods)
                .ThenInclude(mf => mf.Food)
                .Include(m => m.MealSlot)
                .Where(m => m.UserId == userId && m.Date == date)
                .OrderBy(m => m.MealSlot.SortOrder)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> CanUseMealSlotAsync(long userId, long mealSlotId, CancellationToken cancellationToken = default)
        {
            return await _db.MealSlots.AnyAsync(
                s => s.Id == mealSlotId && (s.UserId == null || s.UserId == userId),
                cancellationToken);
        }

        public async Task<List<Food>> GetFoodsByIdsAsync(List<long> foodIds, CancellationToken cancellationToken = default)
        {
            return await _db.Foods
                .Where(f => foodIds.Contains(f.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<Meal> CreateMealAsync(Meal meal, CancellationToken cancellationToken = default)
        {
            await _db.Meals.AddAsync(meal, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);

            await _db.Entry(meal).Reference(m => m.MealSlot).LoadAsync(cancellationToken);
            await _db.Entry(meal).Collection(m => m.MealFoods).Query().Include(mf => mf.Food).LoadAsync(cancellationToken);

            return meal;
        }

        public async Task<Meal?> GetByIdAsync(long mealId, CancellationToken cancellationToken = default)
        {
            return await _db.Meals.FirstOrDefaultAsync(m => m.Id == mealId, cancellationToken);
        }

        public async Task<Meal?> GetBySlotAndDateAsync(long userId, long mealSlotId, DateOnly date, CancellationToken cancellationToken = default)
        {
            return await _db.Meals
                .Include(m => m.MealFoods)
                .FirstOrDefaultAsync(m => m.UserId == userId && m.MealSlotId == mealSlotId && m.Date == date, cancellationToken);
        }

        public async Task<bool> DeleteMealAsync(Meal meal, CancellationToken cancellationToken = default)
        {
            _db.Meals.Remove(meal);
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<MealFood?> GetMealFoodAsync(long mealId, long foodId, CancellationToken cancellationToken = default)
        {
            return await _db.MealFoods
                .Include(mf => mf.Food)
                .FirstOrDefaultAsync(mf => mf.MealId == mealId && mf.FoodId == foodId, cancellationToken);
        }

        public async Task<MealFood?> GetMealFoodByIdAsync(long mealFoodId, CancellationToken cancellationToken = default)
        {
            return await _db.MealFoods
                .Include(mf => mf.Food)
                .Include(mf => mf.Meal).ThenInclude(m => m.MealSlot)
                .FirstOrDefaultAsync(mf => mf.Id == mealFoodId, cancellationToken);
        }

        public async Task AddMealFoodAsync(MealFood mealFood, CancellationToken cancellationToken = default)
        {
            await _db.MealFoods.AddAsync(mealFood, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            await _db.Entry(mealFood).Reference(mf => mf.Food).LoadAsync(cancellationToken);
        }

        public async Task<bool> DeleteMealFoodAsync(MealFood mealFood, CancellationToken cancellationToken = default)
        {
            _db.MealFoods.Remove(mealFood);
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }
    }
}
