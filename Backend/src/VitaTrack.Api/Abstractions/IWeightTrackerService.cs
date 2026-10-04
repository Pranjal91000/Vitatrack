using VitaTrack.Api.Models.WeightTracker;

namespace VitaTrack.Api.Abstractions
{
    public interface IWeightTrackerService
    {
        Task<WeightTrackerViewModel> SaveWeightAsync(WeightTrackerSaveInputModel input, CancellationToken cancellationToken = default);
        Task<WeightTrackerViewModel?> UpdateWeightAsync(WeightTrackerUpdateInputModel input, CancellationToken cancellationToken = default);
        Task<bool> DeleteWeightTrackedAsync(long id, CancellationToken cancellationToken = default);
        Task<WeightTrackerViewModel?> GetWeightTracked(long? id, CancellationToken cancellationToken = default);
        Task<List<WeightTrackerViewModel>> GetWeightTrackedHistory(DateOnly? fromDate, DateOnly? toDate, CancellationToken cancellationToken = default);
    }
}
