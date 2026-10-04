using VitaTrack.Api.Common.Models;
using VitaTrack.Api.Workouts.DTOs;

namespace VitaTrack.Api.Abstractions
{
    public interface IWorkoutService
    {
        Task<DailyWorkoutsDto?> GetWorkoutsAsync(string dateString, CancellationToken cancellationToken = default);
        Task<WorkoutDto?> GetWorkoutAsync(long id, CancellationToken cancellationToken = default);
        Task<ApiResponse<List<WorkoutSummaryDto>>> GetHistoryAsync(int page, int limit, CancellationToken cancellationToken = default);
        Task<WorkoutDto> CreateWorkoutAsync(CreateWorkoutRequest request, CancellationToken cancellationToken = default);
        Task<(WorkoutDto? Workout, string? Error)> AppendExercisesAsync(long id, AppendExercisesRequest request, CancellationToken cancellationToken = default);
        Task<(WorkoutDto? Workout, string? Error)> UpdateWorkoutAsync(long id, CreateWorkoutRequest request, CancellationToken cancellationToken = default);
        Task<(bool Success, string? Error)> DeleteWorkoutAsync(long id, CancellationToken cancellationToken = default);
        Task<(IReadOnlyList<WorkoutHeatmapDayDto>? Heatmap, string? Error)> GetWorkoutHeatmapAsync(string from, string to, CancellationToken cancellationToken = default);

        // Routines (templates)
        Task<List<WorkoutDto>> GetRoutinesAsync(CancellationToken cancellationToken = default);
        Task<WorkoutDto?> GetRoutineAsync(long id, CancellationToken cancellationToken = default);
        Task<WorkoutDto> CreateRoutineAsync(RoutineRequest request, CancellationToken cancellationToken = default);
        Task<WorkoutDto?> UpdateRoutineAsync(long id, RoutineRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteRoutineAsync(long id, CancellationToken cancellationToken = default);
        Task<WorkoutDto?> SaveWorkoutAsRoutineAsync(long workoutId, string? name, CancellationToken cancellationToken = default);
    }
}
