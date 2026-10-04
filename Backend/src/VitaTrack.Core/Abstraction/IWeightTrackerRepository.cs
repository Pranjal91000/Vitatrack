using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Abstraction
{
    public interface IWeightTrackerRepository
    {
        Task<WeightTracker?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
        Task<WeightTracker?> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default);
        Task<WeightTracker?> GetLatestAsync(CancellationToken cancellationToken = default);
        Task<WeightTracker?> GetLatestOnOrBeforeAsync(DateOnly date, CancellationToken cancellationToken = default);
        Task<List<WeightTracker>> GetHistoryAsync(DateOnly? from, DateOnly? to, CancellationToken cancellationToken = default);
        Task AddAsync(WeightTracker entry, CancellationToken cancellationToken = default);
        Task DeleteAsync(WeightTracker entry, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
