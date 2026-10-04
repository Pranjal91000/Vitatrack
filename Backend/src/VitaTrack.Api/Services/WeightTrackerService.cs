using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Models.WeightTracker;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Common;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class WeightTrackerService(IWeightTrackerRepository weightTrackerRepository, IUserRepository userRepository, IJwtHelperService jwtHelperService) : IWeightTrackerService
    {
        private readonly IWeightTrackerRepository _repo = weightTrackerRepository;
        private readonly IUserRepository _users = userRepository;
        private readonly IJwtHelperService _jwt = jwtHelperService;

        public async Task<WeightTrackerViewModel> SaveWeightAsync(WeightTrackerSaveInputModel input, CancellationToken cancellationToken = default)
        {
            var date = input.RecordedOn == default ? DateOnly.FromDateTime(DateTime.UtcNow) : input.RecordedOn;

            // One weigh-in per day: logging again on the same day replaces the value.
            var entry = await _repo.GetByDateAsync(date, cancellationToken);
            if (entry != null)
            {
                entry.Weight = input.Weight;
                entry.BodyFatPercent = input.BodyFatPercent;
                entry.Notes = input.Notes;
                await _repo.SaveChangesAsync(cancellationToken);
            }
            else
            {
                entry = new WeightTracker
                {
                    DateRecordedOn = date,
                    Weight = input.Weight,
                    BodyFatPercent = input.BodyFatPercent,
                    Notes = input.Notes
                };
                await _repo.AddAsync(entry, cancellationToken);
            }

            await SyncProfileWeightAsync(cancellationToken);
            return ToView(entry);
        }

        public async Task<WeightTrackerViewModel?> UpdateWeightAsync(WeightTrackerUpdateInputModel input, CancellationToken cancellationToken = default)
        {
            var entry = await _repo.GetByIdAsync(input.Id, cancellationToken);
            if (entry == null) return null;

            entry.Weight = input.Weight;
            entry.DateRecordedOn = input.RecordedOn;
            entry.BodyFatPercent = input.BodyFatPercent;
            entry.Notes = input.Notes;
            await _repo.SaveChangesAsync(cancellationToken);

            await SyncProfileWeightAsync(cancellationToken);
            return ToView(entry);
        }

        public async Task<bool> DeleteWeightTrackedAsync(long id, CancellationToken cancellationToken = default)
        {
            var entry = await _repo.GetByIdAsync(id, cancellationToken);
            if (entry == null) return false;

            await _repo.DeleteAsync(entry, cancellationToken);
            await SyncProfileWeightAsync(cancellationToken);
            return true;
        }

        public async Task<WeightTrackerViewModel?> GetWeightTracked(long? id, CancellationToken cancellationToken = default)
        {
            var entry = id.HasValue
                ? await _repo.GetByIdAsync(id.Value, cancellationToken)
                : await _repo.GetLatestAsync(cancellationToken);
            return entry == null ? null : ToView(entry);
        }

        public async Task<List<WeightTrackerViewModel>> GetWeightTrackedHistory(DateOnly? fromDate, DateOnly? toDate, CancellationToken cancellationToken = default)
        {
            var data = await _repo.GetHistoryAsync(fromDate, toDate, cancellationToken);
            return data.Select(ToView).ToList();
        }

        /// <summary>Keeps the profile's body weight (used for BMR and protein targets) equal to the latest weigh-in.</summary>
        private async Task SyncProfileWeightAsync(CancellationToken ct)
        {
            var latest = await _repo.GetLatestAsync(ct);
            if (latest == null) return;

            var user = await _users.GetByIdAsync(_jwt.GetUserId(), ct);
            if (user == null || user.WeightKg == latest.Weight) return;

            user.WeightKg = latest.Weight;
            user.Bmr = TrainingMath.Bmr(user.WeightKg, user.HeightCm, user.Age, user.Sex);
            await _users.UpdateUserAsync(user, ct);
        }

        private static WeightTrackerViewModel ToView(WeightTracker x) => new()
        {
            Id = x.Id,
            RecordedOn = x.DateRecordedOn,
            Weight = x.Weight,
            BodyFatPercent = x.BodyFatPercent,
            Notes = x.Notes
        };
    }
}
