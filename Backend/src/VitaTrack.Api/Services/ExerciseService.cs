using Microsoft.AspNetCore.Http;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Common.Models;
using VitaTrack.Api.Workouts.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class ExerciseService(IExerciseRepository exerciseRepository, IJwtHelperService jwtHelperService) : IExerciseService
    {
        private static readonly HashSet<string> AllowedVideoContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "video/mp4", "video/webm", "video/quicktime"
        };

        private readonly IExerciseRepository _exerciseRepository = exerciseRepository;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        private static string ExtensionForMime(string? mime) => mime?.ToLowerInvariant() switch
        {
            "video/mp4" => ".mp4",
            "video/webm" => ".webm",
            "video/quicktime" => ".mov",
            _ => ".bin"
        };

        private static ExerciseDto ToDto(Exercise e) => new(
            e.Id,
            e.Name,
            e.Type,
            e.MuscleGroups,
            e.MeasurementType,
            e.IsDefault,
            e.DemoMediaId.HasValue ? $"exercises/{e.Id}/demo-media" : null);

        public async Task<ApiResponse<List<ExerciseDto>>> GetExercisesAsync(string search, int page, int limit, CancellationToken cancellationToken = default)
        {
            var (exercises, totalCount) = await _exerciseRepository.GetExercisesAsync(search, page, limit, cancellationToken);
            var dtos = exercises.Select(ToDto).ToList();
            var paginatedList = new PaginatedList<ExerciseDto>(dtos, totalCount, page, limit);

            return new ApiResponse<List<ExerciseDto>>(paginatedList.Items, ResponseMeta.FromPagination(paginatedList));
        }

        public async Task<ExerciseDto> CreateExerciseAsync(CreateExerciseRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var exercise = new Exercise
            {
                UserId = userId,
                Name = request.Name,
                Type = request.Type,
                MuscleGroups = request.MuscleGroups,
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

            exercise.Name = request.Name;
            exercise.Type = request.Type;
            exercise.MuscleGroups = request.MuscleGroups;
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
