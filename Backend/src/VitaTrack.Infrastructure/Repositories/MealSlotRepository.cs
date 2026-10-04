using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class MealSlotRepository(AppDbContext appDbContext) : IMealSlotRepository
    {
        private readonly AppDbContext _appDbContext = appDbContext;

        public async Task<List<MealSlot>> GetSlotsByUserIdAsync(long userId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.MealSlots
                .Where(s => s.UserId == null || s.UserId == userId)
                .OrderBy(s => s.SortOrder)
                .ThenBy(s => s.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> GetMaxSortOrderAsync(long userId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.MealSlots
                .Where(s => s.UserId == userId)
                .Select(s => (int?)s.SortOrder)
                .MaxAsync(cancellationToken) ?? 99;
        }

        public async Task<MealSlot> CreateSlotAsync(MealSlot slot, CancellationToken cancellationToken = default)
        {
            await _appDbContext.MealSlots.AddAsync(slot, cancellationToken);
            await _appDbContext.SaveChangesAsync(cancellationToken);
            return slot;
        }
    }
}
