using Microsoft.AspNetCore.Http;
using VitaTrack.Api.Common.Models;
using VitaTrack.Api.Workouts.DTOs;

namespace VitaTrack.Api.Abstractions
{
    public interface IExerciseService
    {
        Task<ApiResponse<List<ExerciseDto>>> GetExercisesAsync(string search, int page, int limit, CancellationToken cancellationToken = default);
        Task<ExerciseDto> CreateExerciseAsync(CreateExerciseRequest request, CancellationToken cancellationToken = default);
        Task<(ExerciseDto? Exercise, string? Error)> UpdateExerciseAsync(long id, UpdateExerciseRequest request, CancellationToken cancellationToken = default);
        Task<(bool Success, string? Error)> DeleteExerciseAsync(long id, string contentRootPath, CancellationToken cancellationToken = default);
        Task<(ExerciseDto? Exercise, string? Error)> UploadDemoMediaAsync(long id, IFormFile file, string contentRootPath, CancellationToken cancellationToken = default);
        Task<(string? PhysicalPath, string? ContentType, string? Error)> GetDemoMediaAsync(long id, string contentRootPath, CancellationToken cancellationToken = default);
        Task<(ExerciseDto? Exercise, string? Error)> DeleteDemoMediaAsync(long id, string contentRootPath, CancellationToken cancellationToken = default);
    }
}
