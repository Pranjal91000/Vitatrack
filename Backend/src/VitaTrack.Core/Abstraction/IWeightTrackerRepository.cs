using VitaTrack.Core.Entities;
using VitaTrack.Core.Models;

namespace VitaTrack.Core.Abstraction
{
    public interface IWeightTrackerRepository
    {
        Task<bool> SaveWeightAsync(WeightTracker data);
        Task<bool> UpdateWeightAsync(WeightTracker input);
        Task<bool> DeleteWeightAsync(long id);
        Task<GetWeightByDate> GetWeightById(long? id);
        Task<List<GetWeightByDate>> GetWeightHistory();
    }
}
