using VitaTrack.Api.Workouts.DTOs;

namespace VitaTrack.Api.Abstractions
{
    public interface IWorkoutService
    {
        Task<DailyWorkoutsDto?> GetWorkoutsAsync(string dateString, CancellationToken cancellationToken = default);
        Task<WorkoutDto> CreateWorkoutAsync(CreateWorkoutRequest request, CancellationToken cancellationToken = default);
        Task<(WorkoutDto? Workout, string? Error)> AppendExercisesAsync(long id, AppendExercisesRequest request, CancellationToken cancellationToken = default);
        Task<(WorkoutDto? Workout, string? Error)> UpdateWorkoutAsync(long id, CreateWorkoutRequest request, CancellationToken cancellationToken = default);
        Task<(bool Success, string? Error)> DeleteWorkoutAsync(long id, CancellationToken cancellationToken = default);
        Task<(IReadOnlyList<WorkoutHeatmapDayDto>? Heatmap, string? Error)> GetWorkoutHeatmapAsync(string from, string to, CancellationToken cancellationToken = default);
    }
}
