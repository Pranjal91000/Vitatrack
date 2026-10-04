using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Abstraction
{
    public interface IMealSlotRepository
    {
        Task<List<MealSlot>> GetSlotsByUserIdAsync(long userId, CancellationToken cancellationToken = default);
        Task<int> GetMaxSortOrderAsync(long userId, CancellationToken cancellationToken = default);
        Task<MealSlot> CreateSlotAsync(MealSlot slot, CancellationToken cancellationToken = default);
    }
}
