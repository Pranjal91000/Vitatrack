using Microsoft.AspNetCore.Http;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Common.Models;
using VitaTrack.Api.Workouts.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Common;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class ExerciseService(IExerciseRepository exerciseRepository, IWorkoutRepository workoutRepository, IJwtHelperService jwtHelperService) : IExerciseService
    {
        private static readonly HashSet<string> AllowedVideoContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "video/mp4", "video/webm", "video/quicktime"
        };

        private readonly IExerciseRepository _exerciseRepository = exerciseRepository;
        private readonly IWorkoutRepository _workoutRepository = workoutRepository;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        private static string ExtensionForMime(string? mime) => mime?.ToLowerInvariant() switch
        {
            "video/mp4" => ".mp4",
            "video/webm" => ".webm",
            "video/quicktime" => ".mov",
            _ => ".bin"
        };

        private static ExerciseDto ToDto(Exercise e) => WorkoutMapper.ToDto(e);

        public async Task<ApiResponse<List<ExerciseDto>>> GetExercisesAsync(string? search, string? muscle, string? equipment, int page, int limit, CancellationToken cancellationToken = default)
        {
            page = Math.Max(1, page);
            limit = Math.Clamp(limit, 1, 500);
            var (exercises, totalCount) = await _exerciseRepository.GetExercisesAsync(search, muscle, equipment, page, limit, cancellationToken);
            var dtos = exercises.Select(ToDto).ToList();
            var paginatedList = new PaginatedList<ExerciseDto>(dtos, totalCount, page, limit);

            return new ApiResponse<List<ExerciseDto>>(paginatedList.Items, ResponseMeta.FromPagination(paginatedList));
        }

        public async Task<ExerciseDetailDto?> GetExerciseDetailAsync(long id, int sessions, CancellationToken cancellationToken = default)
        {
            var exercise = await _exerciseRepository.GetByIdAsync(id, cancellationToken);
            if (exercise == null) return null;

            var userId = _jwtHelperService.GetUserId();
            sessions = Math.Clamp(sessions, 1, 200);
            var history = await _workoutRepository.GetExerciseHistoryAsync(userId, id, sessions, cancellationToken);
            var bests = (await _workoutRepository.GetBestsAsync(userId, new List<long> { id }, null, null, cancellationToken)).FirstOrDefault();

            var sessionDtos = history
                .GroupBy(we => we.WorkoutId)
                .Select(g =>
                {
                    var first = g.First();
                    var sets = g.SelectMany(we => we.Sets).Where(s => !s.IsDeleted).OrderBy(s => s.SetNumber).ToList();
                    var working = sets.Where(TrainingMath.IsWorkingSet).ToList();
                    return new ExerciseSessionDto(
                        first.WorkoutId,
                        first.Workout.Name,
                        first.Workout.Date,
                        sets.Select(s => WorkoutMapper.ToDto(s)).ToList(),
                        TrainingMath.Volume(sets),
                        working.Select(s => TrainingMath.OneRepMax(s)).Max(),
                        working.Max(s => s.WeightKg));
                })
                .OrderByDescending(s => s.Date)
                .ToList();

            return new ExerciseDetailDto(
                ToDto(exercise),
                sessionDtos.Count,
                bests?.BestOneRepMax,
                bests?.MaxWeightKg,
                bests?.BestSetVolume,
                bests?.MaxReps,
                sessionDtos);
        }

        public async Task<List<LastPerformanceDto>> GetLastPerformancesAsync(List<long> exerciseIds, CancellationToken cancellationToken = default)
        {
            var ids = exerciseIds.Distinct().Take(50).ToList();
            var rows = await _workoutRepository.GetLastPerformancesAsync(_jwtHelperService.GetUserId(), ids, cancellationToken);
            return rows.Select(we => new LastPerformanceDto(
                we.ExerciseId,
                we.Workout.Date,
                we.Sets.Where(s => !s.IsDeleted).OrderBy(s => s.SetNumber).Select(s => WorkoutMapper.ToDto(s)).ToList()))
                .ToList();
        }

        public async Task<ExerciseDto> CreateExerciseAsync(CreateExerciseRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var exercise = new Exercise
            {
                UserId = userId,
                Name = request.Name.Trim(),
                Type = request.Type,
                MuscleGroups = request.MuscleGroups ?? Array.Empty<string>(),
                Equipment = string.IsNullOrWhiteSpace(request.Equipment) ? null : request.Equipment.Trim(),
                MeasurementType = request.MeasurementType,
                IsDefault = false
            };

            var created = await _exerciseRepository.CreateExerciseAsync(exercise, cancellationToken);
            return ToDto(created);
        }

        public async Task<(ExerciseDto? Exercise, string? Error)> UpdateExerciseAsync(long id, UpdateExerciseRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var exercise = await _exerciseRepository.GetByIdAsync(id, cancellationToken);
            if (exercise == null) return (null, "NotFound");
            if (exercise.UserId != userId) return (null, "Forbid");

            exercise.Name = request.Name.Trim();
            exercise.Type = request.Type;
            exercise.MuscleGroups = request.MuscleGroups ?? Array.Empty<string>();
            exercise.Equipment = string.IsNullOrWhiteSpace(request.Equipment) ? null : request.Equipment.Trim();
            exercise.MeasurementType = request.MeasurementType;

            await _exerciseRepository.UpdateExerciseAsync(exercise, cancellationToken);
            return (ToDto(exercise), null);
        }

        public async Task<(bool Success, string? Error)> DeleteExerciseAsync(long id, string contentRootPath, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var exercise = await _exerciseRepository.GetByIdAsync(id, cancellationToken);
            if (exercise == null) return (false, "NotFound");
            if (exercise.UserId != userId) return (false, "Forbid");

            TryDeleteDemoFile(exercise, userId, contentRootPath);
            exercise.DemoMediaId = null;
            exercise.DemoMediaFileName = null;
            exercise.DemoMediaContentType = null;

            await _exerciseRepository.DeleteExerciseAsync(exercise, cancellationToken);
            return (true, null);
        }

        public async Task<(ExerciseDto? Exercise, string? Error)> UploadDemoMediaAsync(long id, IFormFile file, string contentRootPath, CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
                return (null, "FileRequired");

            var contentType = file.ContentType;
            if (string.IsNullOrEmpty(contentType) || !AllowedVideoContentTypes.Contains(contentType))
                return (null, "InvalidFileType");

            var userId = _jwtHelperService.GetUserId();
            var exercise = await _exerciseRepository.GetByIdAsync(id, cancellationToken);
            if (exercise == null) return (null, "NotFound");
            if (exercise.UserId != userId) return (null, "Forbid");

            TryDeleteDemoFile(exercise, userId, contentRootPath);

            var mediaId = Guid.NewGuid();
            var ext = ExtensionForMime(contentType);
            var userDir = Path.Combine(contentRootPath, "uploads", "exercise-media", userId.ToString());
            Directory.CreateDirectory(userDir);
            var physicalPath = Path.Combine(userDir, mediaId + ext);

            await using (var stream = System.IO.File.Create(physicalPath))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            exercise.DemoMediaId = mediaId;
            exercise.DemoMediaContentType = contentType;
            exercise.DemoMediaFileName = file.FileName;
            await _exerciseRepository.SaveChangesAsync(cancellationToken);

            return (ToDto(exercise), null);
        }

        public async Task<(string? PhysicalPath, string? ContentType, string? Error)> GetDemoMediaAsync(long id, string contentRootPath, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var exercise = await _exerciseRepository.GetByIdAsync(id, cancellationToken);
            if (exercise == null) return (null, null, "NotFound");
            if (exercise.UserId != userId) return (null, null, "Forbid");
            if (exercise.DemoMediaId is null || string.IsNullOrEmpty(exercise.DemoMediaContentType))
                return (null, null, "MediaNotFound");

            var ext = ExtensionForMime(exercise.DemoMediaContentType);
            var path = Path.Combine(contentRootPath, "uploads", "exercise-media", userId.ToString(), exercise.DemoMediaId + ext);
            if (!System.IO.File.Exists(path))
                return (null, null, "FileNotFound");

            return (path, exercise.DemoMediaContentType, null);
        }

        public async Task<(ExerciseDto? Exercise, string? Error)> DeleteDemoMediaAsync(long id, string contentRootPath, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var exercise = await _exerciseRepository.GetByIdAsync(id, cancellationToken);
            if (exercise == null) return (null, "NotFound");
            if (exercise.UserId != userId) return (null, "Forbid");

            TryDeleteDemoFile(exercise, userId, contentRootPath);
            exercise.DemoMediaId = null;
            exercise.DemoMediaFileName = null;
            exercise.DemoMediaContentType = null;
            await _exerciseRepository.SaveChangesAsync(cancellationToken);

            return (ToDto(exercise), null);
        }

        private static void TryDeleteDemoFile(Exercise exercise, long userId, string contentRootPath)
        {
            if (exercise.DemoMediaId is null || string.IsNullOrEmpty(exercise.DemoMediaContentType))
                return;
            var ext = ExtensionForMime(exercise.DemoMediaContentType);
            var path = Path.Combine(contentRootPath, "uploads", "exercise-media", userId.ToString(), exercise.DemoMediaId + ext);
            if (System.IO.File.Exists(path))
            {
                try { System.IO.File.Delete(path); } catch { /* ignore */ }
            }
        }
    }
}
