using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    /// <summary>All queries are scoped to the current user by the global query filter.</summary>
    public class WeightTrackerRepository(AppDbContext appDbContext) : IWeightTrackerRepository
    {
        private readonly AppDbContext _db = appDbContext;

        public Task<WeightTracker?> GetByIdAsync(long id, CancellationToken cancellationToken = default) =>
            _db.WeightTrackers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        public Task<WeightTracker?> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default) =>
            _db.WeightTrackers.FirstOrDefaultAsync(x => x.DateRecordedOn == date, cancellationToken);

        public Task<WeightTracker?> GetLatestAsync(CancellationToken cancellationToken = default) =>
            _db.WeightTrackers.AsNoTracking()
                .OrderByDescending(x => x.DateRecordedOn).ThenByDescending(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

        public Task<WeightTracker?> GetLatestOnOrBeforeAsync(DateOnly date, CancellationToken cancellationToken = default) =>
            _db.WeightTrackers.AsNoTracking()
                .Where(x => x.DateRecordedOn <= date)
                .OrderByDescending(x => x.DateRecordedOn).ThenByDescending(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

        public Task<List<WeightTracker>> GetHistoryAsync(DateOnly? from, DateOnly? to, CancellationToken cancellationToken = default)
        {
            var query = _db.WeightTrackers.AsNoTracking().AsQueryable();
            if (from.HasValue) query = query.Where(x => x.DateRecordedOn >= from.Value);
            if (to.HasValue) query = query.Where(x => x.DateRecordedOn <= to.Value);
            return query.OrderBy(x => x.DateRecordedOn).ToListAsync(cancellationToken);
        }

        public async Task AddAsync(WeightTracker entry, CancellationToken cancellationToken = default)
        {
            await _db.WeightTrackers.AddAsync(entry, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(WeightTracker entry, CancellationToken cancellationToken = default)
        {
            _db.WeightTrackers.Remove(entry);
            await _db.SaveChangesAsync(cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default) => _db.SaveChangesAsync(cancellationToken);
    }
}
