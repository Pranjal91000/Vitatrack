using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class FoodRepository(AppDbContext appDbContext) : IFoodRepository
    {
        private readonly AppDbContext _appDbContext = appDbContext;

        public async Task<List<Food>> SearchFoodsAsync(string search, int limit, CancellationToken cancellationToken = default)
        {
            var term = search?.ToLower() ?? "";
            var query = _appDbContext.Foods.AsQueryable();

            if (!string.IsNullOrEmpty(term))
            {
                query = query.Where(f => f.Name.ToLower().Contains(term));
            }

            return await query.Take(limit).ToListAsync(cancellationToken);
        }

        public async Task<Food?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Foods.FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
        }

        public async Task<Food> CreateFoodAsync(Food food, CancellationToken cancellationToken = default)
        {
            await _appDbContext.Foods.AddAsync(food, cancellationToken);
            await _appDbContext.SaveChangesAsync(cancellationToken);
            return food;
        }

        public async Task<bool> UpdateFoodAsync(Food food, CancellationToken cancellationToken = default)
        {
            _appDbContext.Foods.Update(food);
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteFoodAsync(Food food, CancellationToken cancellationToken = default)
        {
            _appDbContext.Foods.Remove(food);
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }
    }
}
