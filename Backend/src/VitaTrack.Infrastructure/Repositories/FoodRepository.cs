using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class FoodRepository(AppDbContext appDbContext) : IFoodRepository
    {
        private readonly AppDbContext _db = appDbContext;

        public async Task<List<Food>> SearchFoodsAsync(string search, int limit, CancellationToken cancellationToken = default)
        {
            var query = _db.Foods.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var trimmed = search.Trim();
                var term = $"%{trimmed}%";
                var prefix = $"{trimmed}%";
                query = query
                    .Where(f => EF.Functions.ILike(f.Name, term))
                    // Prefix matches first, then the user's own foods, then alphabetical.
                    .OrderByDescending(f => EF.Functions.ILike(f.Name, prefix))
                    .ThenByDescending(f => f.UserId != null)
                    .ThenBy(f => f.Name);
            }
            else
            {
                query = query.OrderBy(f => f.Name);
            }

            return await query.Take(limit).ToListAsync(cancellationToken);
        }

        public async Task<List<Food>> GetRecentFoodsAsync(int limit, CancellationToken cancellationToken = default)
        {
            // MealFood is user-scoped by the global query filter.
            var recentIds = await _db.MealFoods
                .AsNoTracking()
                .GroupBy(mf => mf.FoodId)
                .Select(g => new { FoodId = g.Key, Last = g.Max(x => x.CreatedAt) })
                .OrderByDescending(x => x.Last)
                .Take(limit)
                .Select(x => x.FoodId)
                .ToListAsync(cancellationToken);

            var foods = await _db.Foods.AsNoTracking()
                .Where(f => recentIds.Contains(f.Id))
                .ToListAsync(cancellationToken);

            return recentIds
                .Select(id => foods.FirstOrDefault(f => f.Id == id))
                .Where(f => f != null)
                .Select(f => f!)
                .ToList();
        }

        public async Task<List<Food>> GetCustomFoodsAsync(long userId, CancellationToken cancellationToken = default)
        {
            return await _db.Foods.AsNoTracking()
                .Where(f => f.UserId == userId)
                .OrderBy(f => f.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<Food?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            return await _db.Foods.FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
        }

        public async Task<Food> CreateFoodAsync(Food food, CancellationToken cancellationToken = default)
        {
            await _db.Foods.AddAsync(food, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            return food;
        }

        public async Task<bool> UpdateFoodAsync(Food food, CancellationToken cancellationToken = default)
        {
            _db.Foods.Update(food);
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteFoodAsync(Food food, CancellationToken cancellationToken = default)
        {
            _db.Foods.Remove(food);
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }
    }
}
