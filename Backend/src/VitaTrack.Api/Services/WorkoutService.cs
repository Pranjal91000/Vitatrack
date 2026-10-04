using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Workouts.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class WorkoutService(IWorkoutRepository workoutRepository, IJwtHelperService jwtHelperService) : IWorkoutService
    {
        private readonly IWorkoutRepository _workoutRepository = workoutRepository;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        public async Task<DailyWorkoutsDto?> GetWorkoutsAsync(string dateString, CancellationToken cancellationToken = default)
        {
            if (!DateOnly.TryParse(dateString, out var parsedDate))
                return null;

            var userId = _jwtHelperService.GetUserId();
            var workouts = await _workoutRepository.GetWorkoutsByDateAsync(userId, parsedDate, cancellationToken);

            var dtos = workouts.Select(w =>
            {
                var exercises = w.Exercises.OrderBy(e => e.Order).Select(we =>
                {
                    var sets = we.Sets.OrderBy(s => s.SetNumber).Select(s =>
                    {
                        decimal? oneRepMax = null;
                        if (s.WeightKg.HasValue && s.Reps.HasValue && s.Reps > 0)
                        {
                            oneRepMax = s.WeightKg.Value * (1 + (decimal)s.Reps.Value / 30m);
                        }
                        return new SetDto(s.SetNumber, s.Reps, s.WeightKg, s.DurationSeconds, s.Rpe, oneRepMax, s.DistanceKm, s.ElevationGainM, s.PaceMinPerKm, s.Pace);
                    }).ToList();
                    return new WorkoutExerciseDto(we.ExerciseId, we.Exercise?.Name ?? "Unknown", we.Order, sets);
                }).ToList();

                decimal volume = exercises.Sum(e => e.Sets.Sum(s => (s.WeightKg ?? 0) * (s.Reps ?? 0)));

                return new WorkoutDto(w.Id, w.Name, w.Date, w.DurationMinutes, exercises, volume, w.RecurrencePattern, w.IsTemplate);
            }).ToList();

            return new DailyWorkoutsDto(dtos);
        }

        public async Task<WorkoutDto> CreateWorkoutAsync(CreateWorkoutRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var workout = new Workout
            {
                UserId = userId,
                Date = request.Date,
                Name = request.Name,
                DurationMinutes = request.DurationMinutes,
                Notes = request.Notes,
                RecurrencePattern = null,
                IsTemplate = false
            };

            int order = 1;
            var exerciseIds = request.Exercises.Select(e => e.ExerciseId).Distinct().ToList();
            var exercises = await _workoutRepository.GetExerciseEntitiesByIdsAsync(exerciseIds, cancellationToken);

            foreach (var exReq in request.Exercises)
            {
                var we = new WorkoutExercise
                {
                    ExerciseId = exReq.ExerciseId,
                    Order = order++
                };

                foreach (var setReq in exReq.Sets)
                {
                    we.Sets.Add(new Set
                    {
                        SetNumber = setReq.SetNumber,
                        Reps = setReq.Reps,
                        WeightKg = setReq.WeightKg,
                        DurationSeconds = setReq.DurationSeconds,
                        Rpe = setReq.Rpe,
                        DistanceKm = setReq.DistanceKm,
                        ElevationGainM = setReq.ElevationGainM,
                        PaceMinPerKm = setReq.PaceMinPerKm
                    });
                }
                workout.Exercises.Add(we);
            }

            var created = await _workoutRepository.CreateWorkoutAsync(workout, cancellationToken);

            var dtos = created.Exercises.Select(we =>
            {
                var exName = exercises.FirstOrDefault(e => e.Id == we.ExerciseId)?.Name ?? "Unknown";
                var sets = we.Sets.Select(s =>
                {
                    decimal? oneRepMax = null;
                    if (s.WeightKg.HasValue && s.Reps.HasValue && s.Reps > 0)
                    {
                        oneRepMax = s.WeightKg.Value * (1 + (decimal)s.Reps.Value / 30m);
                    }
                    return new SetDto(s.SetNumber, s.Reps, s.WeightKg, s.DurationSeconds, s.Rpe, oneRepMax, s.DistanceKm, s.ElevationGainM, s.PaceMinPerKm, s.Pace);
                }).ToList();
                return new WorkoutExerciseDto(we.ExerciseId, exName, we.Order, sets);
            }).ToList();

            decimal volume = dtos.Sum(e => e.Sets.Sum(s => (s.WeightKg ?? 0) * (s.Reps ?? 0)));
            return new WorkoutDto(created.Id, created.Name, created.Date, created.DurationMinutes, dtos, volume, created.RecurrencePattern, created.IsTemplate);
        }

        public async Task<(WorkoutDto? Workout, string? Error)> AppendExercisesAsync(long id, AppendExercisesRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var workout = await _workoutRepository.GetWorkoutWithDetailsAsync(id, userId, cancellationToken);
            if (workout == null) return (null, "NotFound");

            var exerciseIds = request.Exercises.Select(e => e.ExerciseId).Distinct().ToList();
            var exercises = await _workoutRepository.GetExerciseEntitiesByIdsAsync(exerciseIds, cancellationToken);

            int order = workout.Exercises.Any() ? workout.Exercises.Max(e => e.Order) + 1 : 1;

            foreach (var exReq in request.Exercises)
            {
                var we = new WorkoutExercise
                {
                    ExerciseId = exReq.ExerciseId,
                    Order = order++
                };

                foreach (var setReq in exReq.Sets)
                {
                    we.Sets.Add(new Set
                    {
                        SetNumber = setReq.SetNumber,
                        Reps = setReq.Reps,
                        WeightKg = setReq.WeightKg,
                        DurationSeconds = setReq.DurationSeconds,
                        Rpe = setReq.Rpe,
                        DistanceKm = setReq.DistanceKm,
                        ElevationGainM = setReq.ElevationGainM,
                        PaceMinPerKm = setReq.PaceMinPerKm
                    });
                }
                workout.Exercises.Add(we);
            }

            await _workoutRepository.SaveChangesAsync(cancellationToken);

            var dtos = workout.Exercises.OrderBy(e => e.Order).Select(we =>
            {
                var exName = we.Exercise?.Name ?? exercises.FirstOrDefault(e => e.Id == we.ExerciseId)?.Name ?? "Unknown";
                var sets = we.Sets.OrderBy(s => s.SetNumber).Select(s =>
                {
                    decimal? oneRepMax = null;
                    if (s.WeightKg.HasValue && s.Reps.HasValue && s.Reps > 0)
                    {
                        oneRepMax = s.WeightKg.Value * (1 + (decimal)s.Reps.Value / 30m);
                    }
                    return new SetDto(s.SetNumber, s.Reps, s.WeightKg, s.DurationSeconds, s.Rpe, oneRepMax, s.DistanceKm, s.ElevationGainM, s.PaceMinPerKm, s.Pace);
                }).ToList();
                return new WorkoutExerciseDto(we.ExerciseId, exName, we.Order, sets);
            }).ToList();

            decimal volume = dtos.Sum(e => e.Sets.Sum(s => (s.WeightKg ?? 0) * (s.Reps ?? 0)));
            return (new WorkoutDto(workout.Id, workout.Name, workout.Date, workout.DurationMinutes, dtos, volume, workout.RecurrencePattern, workout.IsTemplate), null);
        }

        public async Task<(WorkoutDto? Workout, string? Error)> UpdateWorkoutAsync(long id, CreateWorkoutRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var workout = await _workoutRepository.GetWorkoutWithDetailsAsync(id, userId, cancellationToken);
            if (workout == null) return (null, "NotFound");

            workout.Name = request.Name;
            workout.Date = request.Date;
            workout.DurationMinutes = request.DurationMinutes;
            workout.Notes = request.Notes;
            workout.RecurrencePattern = null;
            workout.IsTemplate = false;

            _workoutRepository.RemoveWorkoutExercises(workout.Exercises);

            int order = 1;
            var exerciseIds = request.Exercises.Select(e => e.ExerciseId).Distinct().ToList();
            var exercises = await _workoutRepository.GetExerciseEntitiesByIdsAsync(exerciseIds, cancellationToken);

            var newExercises = new List<WorkoutExercise>();

            foreach (var exReq in request.Exercises)
            {
                var we = new WorkoutExercise
                {
                    ExerciseId = exReq.ExerciseId,
                    Order = order++
                };

                foreach (var setReq in exReq.Sets)
                {
                    we.Sets.Add(new Set
                    {
                        SetNumber = setReq.SetNumber,
                        Reps = setReq.Reps,
                        WeightKg = setReq.WeightKg,
                        DurationSeconds = setReq.DurationSeconds,
                        Rpe = setReq.Rpe,
                        DistanceKm = setReq.DistanceKm,
                        ElevationGainM = setReq.ElevationGainM,
                        PaceMinPerKm = setReq.PaceMinPerKm
                    });
                }
                newExercises.Add(we);
            }

            workout.Exercises = newExercises;
            await _workoutRepository.SaveChangesAsync(cancellationToken);

            var dtos = workout.Exercises.Select(we =>
            {
                var exName = exercises.FirstOrDefault(e => e.Id == we.ExerciseId)?.Name ?? "Unknown";
                var sets = we.Sets.Select(s =>
                {
                    decimal? oneRepMax = null;
                    if (s.WeightKg.HasValue && s.Reps.HasValue && s.Reps > 0)
                    {
                        oneRepMax = s.WeightKg.Value * (1 + (decimal)s.Reps.Value / 30m);
                    }
                    return new SetDto(s.SetNumber, s.Reps, s.WeightKg, s.DurationSeconds, s.Rpe, oneRepMax, s.DistanceKm, s.ElevationGainM, s.PaceMinPerKm, s.Pace);
                }).ToList();
                return new WorkoutExerciseDto(we.ExerciseId, exName, we.Order, sets);
            }).ToList();

            decimal volume = dtos.Sum(e => e.Sets.Sum(s => (s.WeightKg ?? 0) * (s.Reps ?? 0)));
            return (new WorkoutDto(workout.Id, workout.Name, workout.Date, workout.DurationMinutes, dtos, volume, workout.RecurrencePattern, workout.IsTemplate), null);
        }

        public async Task<(bool Success, string? Error)> DeleteWorkoutAsync(long id, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var workout = await _workoutRepository.GetByIdAsync(id, cancellationToken);
            if (workout == null) return (false, "NotFound");
            if (workout.UserId != userId) return (false, "Forbid");

            await _workoutRepository.DeleteWorkoutAsync(workout, cancellationToken);
            return (true, null);
        }

        public async Task<(IReadOnlyList<WorkoutHeatmapDayDto>? Heatmap, string? Error)> GetWorkoutHeatmapAsync(string from, string to, CancellationToken cancellationToken = default)
        {
            if (!DateOnly.TryParse(from, out var fromDate) || !DateOnly.TryParse(to, out var toDate))
                return (null, "InvalidDateFormat");
            if (fromDate > toDate)
                return (null, "InvalidDateRange");

            var userId = _jwtHelperService.GetUserId();
            var data = await _workoutRepository.GetHeatmapDataAsync(userId, fromDate, toDate, cancellationToken);
            var rows = data
                .OrderBy(x => x.Date)
                .Select(x => new WorkoutHeatmapDayDto(x.Date.ToString("yyyy-MM-dd"), x.Count))
                .ToList();

            return (rows, null);
        }
    }
}
