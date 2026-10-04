using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Models.WeightTracker;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class WeightTrackerService(IWeightTrackerRepository weightTrackerRepository) : IWeightTrackerService
    {
        private readonly IWeightTrackerRepository _weightTrackerRepository = weightTrackerRepository;

        public async Task<bool> SaveWeightAsync(WeightTrackerSaveInputModel input)
        {
            var data = new WeightTracker
            {
                DateRecordedOn = input.RecordedOn,
                Weight = input.Weight
            };

            return await _weightTrackerRepository.SaveWeightAsync(data);
        }

        public async Task<bool> UpdateWeightAsync(WeightTrackerUpdateInputModel input)
        {
            var data = new WeightTracker
            {
                Id = input.Id,
                DateRecordedOn = input.RecordedOn,
                Weight = input.Weight
            };

            return await _weightTrackerRepository.UpdateWeightAsync(data);
        }

        public async Task<bool> DeleteWeightTrackedAsync(long id)
        {
            return await _weightTrackerRepository.DeleteWeightAsync(id);
        }

        public async Task<WeightTrackerViewModel> GetWeightTracked(long? id)
        {
            var data = await _weightTrackerRepository.GetWeightById(id);
            if (data is null) return null!;

            return new WeightTrackerViewModel
            {
                Id = data.Id,
                RecordedOn = data.RecordedOn,
                Weight = data.Weight
            };
        }

        public async Task<List<WeightTrackerViewModel>> GetWeightTrackedHistory(DateOnly? FromDate, DateOnly ToDate)
        {
            var data = await _weightTrackerRepository.GetWeightHistory();
            return data.Select(x => new WeightTrackerViewModel
            {
                Id = x.Id,
                RecordedOn = x.RecordedOn,
                Weight = x.Weight
            }).ToList();
        }
    }
}
