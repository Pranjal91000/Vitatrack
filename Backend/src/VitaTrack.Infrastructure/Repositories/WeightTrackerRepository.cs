using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Core.Models;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class WeightTrackerRepository(AppDbContext appDbContext) : IWeightTrackerRepository
    {
        private readonly AppDbContext _appDbContext = appDbContext;

        public async Task<bool> SaveWeightAsync(WeightTracker data)
        {
            await _appDbContext.WeightTrackers.AddAsync(data);
            return await _appDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateWeightAsync(WeightTracker input)
        {
            var data = await _appDbContext.WeightTrackers.Where(x => x.Id == input.Id).FirstOrDefaultAsync();
            if (data == null) return false;

            data.Weight = input.Weight;
            data.DateRecordedOn = input.DateRecordedOn;

            return await _appDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteWeightAsync(long id)
        {
            var data = await _appDbContext.WeightTrackers.FirstOrDefaultAsync(x => x.Id == id);
            if (data == null) return false;

            _appDbContext.WeightTrackers.Remove(data);
            return await _appDbContext.SaveChangesAsync() > 0;
        }

        public async Task<GetWeightByDate> GetWeightById(long? id)
        {
            var data = await _appDbContext.WeightTrackers
                .Where(x => id == null || x.Id == id)
                .OrderByDescending(x => x.DateRecordedOn)
                .FirstOrDefaultAsync();

            if (data == null) return null!;

            return new GetWeightByDate
            {
                Id = data.Id,
                RecordedOn = data.DateRecordedOn,
                Weight = data.Weight
            };
        }

        public async Task<List<GetWeightByDate>> GetWeightHistory()
        {
            var data = await _appDbContext.WeightTrackers.Select(x => new GetWeightByDate
            {
                Id = x.Id,
                RecordedOn = x.DateRecordedOn,
                Weight = x.Weight
            }).ToListAsync();

            return data;
        }
    }
}
