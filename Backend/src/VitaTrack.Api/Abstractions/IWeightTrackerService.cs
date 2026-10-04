using VitaTrack.Api.Models.WeightTracker;

namespace VitaTrack.Api.Abstractions
{
    public interface IWeightTrackerService
    {
        Task<bool> SaveWeightAsync(WeightTrackerSaveInputModel input);
        Task<bool> UpdateWeightAsync(WeightTrackerUpdateInputModel input);
        Task<bool> DeleteWeightTrackedAsync(long id);
        Task<WeightTrackerViewModel> GetWeightTracked(long? id);
        Task<List<WeightTrackerViewModel>> GetWeightTrackedHistory(DateOnly? FromDate, DateOnly ToDate);
    }
}
