using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Common.Models;
using VitaTrack.Api.Workouts.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Common;
using VitaTrack.Core.Entities;
using VitaTrack.Core.Enums;

namespace VitaTrack.Api.Services
{
    public class WorkoutService(IWorkoutRepository workoutRepository, IJwtHelperService jwtHelperService) : IWorkoutService
    {
        private readonly IWorkoutRepository _repo = workoutRepository;
        private readonly IJwtHelperService _jwt = jwtHelperService;

        // ── Logged workouts ────────────────────────────────────────────────────

        public async Task<DailyWorkoutsDto?> GetWorkoutsAsync(string dateString, CancellationToken cancellationToken = default)
        {
            if (!DateOnly.TryParse(dateString, out var parsedDate))
                return null;

            var workouts = await _repo.GetWorkoutsByDateAsync(_jwt.GetUserId(), parsedDate, cancellationToken);
            return new DailyWorkoutsDto(workouts.Select(w => WorkoutMapper.ToDto(w)).ToList());
        }

        public async Task<WorkoutDto?> GetWorkoutAsync(long id, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            var workout = await _repo.GetWorkoutWithDetailsAsync(id, userId, cancellationToken);
            if (workout == null || workout.IsTemplate) return null;

            var records = await ComputeRecordsAsync(userId, workout, cancellationToken);
            return WorkoutMapper.ToDto(workout, records: records);
        }

        public async Task<ApiResponse<List<WorkoutSummaryDto>>> GetHistoryAsync(int page, int limit, CancellationToken cancellationToken = default)
        {
            page = Math.Max(1, page);
            limit = Math.Clamp(limit, 1, 100);

            var (items, total) = await _repo.GetHistoryAsync(_jwt.GetUserId(), page, limit, cancellationToken);
            var list = new PaginatedList<WorkoutSummaryDto>(items.Select(WorkoutMapper.ToSummary).ToList(), total, page, limit);
            return new ApiResponse<List<WorkoutSummaryDto>>(list.Items, ResponseMeta.FromPagination(list));
        }

        public async Task<WorkoutDto> CreateWorkoutAsync(CreateWorkoutRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            var duration = request.DurationMinutes;
            if (!duration.HasValue && request.StartedAt.HasValue && request.EndedAt.HasValue)
                duration = (int)Math.Max(1, Math.Round((request.EndedAt.Value - request.StartedAt.Value).TotalMinutes));

            var workout = new Workout
            {
                UserId = userId,
                Date = request.Date,
                Name = string.IsNullOrWhiteSpace(request.Name) ? DefaultName(request.StartedAt) : request.Name.Trim(),
                DurationMinutes = duration,
                Notes = request.Notes,
                StartedAt = ToUtc(request.StartedAt),
                EndedAt = ToUtc(request.EndedAt),
                IsTemplate = false
            };

            foreach (var we in WorkoutMapper.ToEntities(request.Exercises))
                workout.Exercises.Add(we);

            await _repo.CreateWorkoutAsync(workout, cancellationToken);

            var created = await _repo.GetWorkoutWithDetailsAsync(workout.Id, userId, cancellationToken) ?? workout;
            var records = await ComputeRecordsAsync(userId, created, cancellationToken);
            return WorkoutMapper.ToDto(created, records: records);
        }

        public async Task<(WorkoutDto? Workout, string? Error)> AppendExercisesAsync(long id, AppendExercisesRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            var workout = await _repo.GetWorkoutWithDetailsAsync(id, userId, cancellationToken);
            if (workout == null) return (null, "NotFound");

            var start = workout.Exercises.Any() ? workout.Exercises.Max(e => e.Order) + 1 : 1;
            foreach (var we in WorkoutMapper.ToEntities(request.Exercises, start))
                workout.Exercises.Add(we);

            await _repo.SaveChangesAsync(cancellationToken);
            var lookup = await LookupAsync(request.Exercises.Select(e => e.ExerciseId), cancellationToken);
            return (WorkoutMapper.ToDto(workout, lookup), null);
        }

        public async Task<(WorkoutDto? Workout, string? Error)> UpdateWorkoutAsync(long id, CreateWorkoutRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            var workout = await _repo.GetWorkoutWithDetailsAsync(id, userId, cancellationToken);
            if (workout == null || workout.IsTemplate) return (null, "NotFound");

            workout.Name = string.IsNullOrWhiteSpace(request.Name) ? workout.Name : request.Name.Trim();
            workout.Date = request.Date;
            workout.DurationMinutes = request.DurationMinutes ?? workout.DurationMinutes;
            workout.Notes = request.Notes;
            workout.StartedAt = ToUtc(request.StartedAt) ?? workout.StartedAt;
            workout.EndedAt = ToUtc(request.EndedAt) ?? workout.EndedAt;

            ReplaceExercises(workout, request.Exercises);
            await _repo.SaveChangesAsync(cancellationToken);

            var lookup = await LookupAsync(request.Exercises.Select(e => e.ExerciseId), cancellationToken);
            var records = await ComputeRecordsAsync(userId, workout, cancellationToken, lookup);
            return (WorkoutMapper.ToDto(workout, lookup, records), null);
        }

        public async Task<(bool Success, string? Error)> DeleteWorkoutAsync(long id, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            var workout = await _repo.GetByIdAsync(id, cancellationToken);
            if (workout == null) return (false, "NotFound");
            if (workout.UserId != userId) return (false, "Forbid");

            await _repo.DeleteWorkoutAsync(workout, cancellationToken);
            return (true, null);
        }

        public async Task<(IReadOnlyList<WorkoutHeatmapDayDto>? Heatmap, string? Error)> GetWorkoutHeatmapAsync(string from, string to, CancellationToken cancellationToken = default)
        {
            if (!DateOnly.TryParse(from, out var fromDate) || !DateOnly.TryParse(to, out var toDate))
                return (null, "InvalidDateFormat");
            if (fromDate > toDate)
                return (null, "InvalidDateRange");

            var data = await _repo.GetHeatmapDataAsync(_jwt.GetUserId(), fromDate, toDate, cancellationToken);
            var rows = data
                .OrderBy(x => x.Date)
                .Select(x => new WorkoutHeatmapDayDto(x.Date.ToString("yyyy-MM-dd"), x.Count))
                .ToList();

            return (rows, null);
        }

        // ── Routines ───────────────────────────────────────────────────────────

        public async Task<List<WorkoutDto>> GetRoutinesAsync(CancellationToken cancellationToken = default)
        {
            var routines = await _repo.GetTemplatesAsync(_jwt.GetUserId(), cancellationToken);
            return routines.Select(r => WorkoutMapper.ToDto(r)).ToList();
        }

        public async Task<WorkoutDto?> GetRoutineAsync(long id, CancellationToken cancellationToken = default)
        {
            var routine = await _repo.GetWorkoutWithDetailsAsync(id, _jwt.GetUserId(), cancellationToken);
            return routine is { IsTemplate: true } ? WorkoutMapper.ToDto(routine) : null;
        }

        public async Task<WorkoutDto> CreateRoutineAsync(RoutineRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            var routine = new Workout
            {
                UserId = userId,
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                Name = request.Name.Trim(),
                Notes = request.Notes,
                IsTemplate = true
            };
            foreach (var we in WorkoutMapper.ToEntities(request.Exercises))
                routine.Exercises.Add(we);

            await _repo.CreateWorkoutAsync(routine, cancellationToken);
            var created = await _repo.GetWorkoutWithDetailsAsync(routine.Id, userId, cancellationToken) ?? routine;
            return WorkoutMapper.ToDto(created);
        }

        public async Task<WorkoutDto?> UpdateRoutineAsync(long id, RoutineRequest request, CancellationToken cancellationToken = default)
        {
            var routine = await _repo.GetWorkoutWithDetailsAsync(id, _jwt.GetUserId(), cancellationToken);
            if (routine is not { IsTemplate: true }) return null;

            routine.Name = request.Name.Trim();
            routine.Notes = request.Notes;
            ReplaceExercises(routine, request.Exercises);
            await _repo.SaveChangesAsync(cancellationToken);

            var lookup = await LookupAsync(request.Exercises.Select(e => e.ExerciseId), cancellationToken);
            return WorkoutMapper.ToDto(routine, lookup);
        }

        public async Task<bool> DeleteRoutineAsync(long id, CancellationToken cancellationToken = default)
        {
            var routine = await _repo.GetByIdAsync(id, cancellationToken);
            if (routine is not { IsTemplate: true } || routine.UserId != _jwt.GetUserId()) return false;
            await _repo.DeleteWorkoutAsync(routine, cancellationToken);
            return true;
        }

        public async Task<WorkoutDto?> SaveWorkoutAsRoutineAsync(long workoutId, string? name, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            var source = await _repo.GetWorkoutWithDetailsAsync(workoutId, userId, cancellationToken);
            if (source == null) return null;

            var request = new RoutineRequest(
                string.IsNullOrWhiteSpace(name) ? (source.Name ?? "My routine") : name,
                source.Notes,
                source.Exercises.Where(e => !e.IsDeleted).OrderBy(e => e.Order).Select(e => new WorkoutExerciseRequest(
                    e.ExerciseId,
                    e.Sets.Where(s => !s.IsDeleted && s.IsCompleted).OrderBy(s => s.SetNumber).Select(s => new SetRequest(
                        s.SetNumber, s.Reps, s.WeightKg, s.DurationSeconds, null, s.DistanceKm, null, null, s.SetType, true)).ToList(),
                    e.Notes,
                    e.RestSeconds)).ToList());

            return await CreateRoutineAsync(request, cancellationToken);
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private void ReplaceExercises(Workout workout, List<WorkoutExerciseRequest> requests)
        {
            _repo.RemoveWorkoutExercises(workout.Exercises);
            workout.Exercises = WorkoutMapper.ToEntities(requests);
        }

        private async Task<Dictionary<long, Exercise>> LookupAsync(IEnumerable<long> ids, CancellationToken ct)
        {
            var list = await _repo.GetExerciseEntitiesByIdsAsync(ids.Distinct().ToList(), ct);
            return list.ToDictionary(e => e.Id);
        }

        /// <summary>
        /// Compares this workout's best working sets with everything logged before it.
        /// Exercises done for the first time don't produce records (nothing to beat yet).
        /// </summary>
        private async Task<List<PersonalRecordDto>> ComputeRecordsAsync(long userId, Workout workout, CancellationToken ct, IReadOnlyDictionary<long, Exercise>? lookup = null)
        {
            var exercises = workout.Exercises.Where(e => !e.IsDeleted).ToList();
            var ids = exercises.Select(e => e.ExerciseId).Distinct().ToList();
            if (ids.Count == 0) return new List<PersonalRecordDto>();

            var previous = (await _repo.GetBestsAsync(userId, ids, workout.Date, workout.Id, ct)).ToDictionary(b => b.ExerciseId);
            var records = new List<PersonalRecordDto>();

            foreach (var group in exercises.GroupBy(e => e.ExerciseId))
            {
                if (!previous.TryGetValue(group.Key, out var prev)) continue;

                var exercise = group.First().Exercise ?? (lookup != null && lookup.TryGetValue(group.Key, out var ex) ? ex : null);
                var name = exercise?.Name ?? "Exercise";
                var sets = group.SelectMany(e => e.Sets).Where(s => !s.IsDeleted && TrainingMath.IsWorkingSet(s)).ToList();
                if (sets.Count == 0) continue;

                var measure = exercise?.MeasurementType ?? MeasurementType.WeightReps;
                if (measure is MeasurementType.WeightReps or MeasurementType.Other)
                {
                    var maxWeight = sets.Max(s => s.WeightKg);
                    if (maxWeight > 0 && maxWeight > (prev.MaxWeightKg ?? 0))
                        records.Add(new PersonalRecordDto(group.Key, name, "weight", maxWeight.Value, prev.MaxWeightKg));

                    var best1Rm = sets.Select(s => TrainingMath.OneRepMax(s)).Max();
                    if (best1Rm > 0 && best1Rm > (prev.BestOneRepMax ?? 0))
                        records.Add(new PersonalRecordDto(group.Key, name, "oneRepMax", best1Rm.Value, prev.BestOneRepMax));

                    var bestVolume = sets.Where(s => s.WeightKg.HasValue && s.Reps.HasValue).Select(s => (decimal?)(s.WeightKg!.Value * s.Reps!.Value)).Max();
                    if (bestVolume > 0 && bestVolume > (prev.BestSetVolume ?? 0))
                        records.Add(new PersonalRecordDto(group.Key, name, "volume", bestVolume.Value, prev.BestSetVolume));
                }
                else if (measure == MeasurementType.BodyweightReps)
                {
                    var maxReps = sets.Max(s => s.Reps);
                    if (maxReps > 0 && maxReps > (prev.MaxReps ?? 0))
                        records.Add(new PersonalRecordDto(group.Key, name, "reps", maxReps.Value, prev.MaxReps));
                }
            }

            return records;
        }

        private static DateTime? ToUtc(DateTime? value) =>
            value.HasValue ? (value.Value.Kind == DateTimeKind.Utc ? value.Value : value.Value.ToUniversalTime()) : null;

        private static string DefaultName(DateTime? startedAt)
        {
            var hour = (startedAt ?? DateTime.UtcNow).ToLocalTime().Hour;
            return hour switch
            {
                < 12 => "Morning workout",
                < 17 => "Afternoon workout",
                _ => "Evening workout"
            };
        }
    }
}
