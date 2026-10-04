using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Abstraction
{
    /// <summary>Aggregated best performance for one exercise (warm-ups excluded).</summary>
    public record ExerciseBestRecord(long ExerciseId, decimal? MaxWeightKg, decimal? BestOneRepMax, int? MaxReps, decimal? BestSetVolume);

    public interface IWorkoutRepository
    {
        Task<List<Workout>> GetWorkoutsByDateAsync(long userId, DateOnly date, CancellationToken cancellationToken = default);
        Task<List<Exercise>> GetExerciseEntitiesByIdsAsync(List<long> exerciseIds, CancellationToken cancellationToken = default);
        Task<Workout> CreateWorkoutAsync(Workout workout, CancellationToken cancellationToken = default);
        Task<Workout?> GetWorkoutWithDetailsAsync(long id, long userId, CancellationToken cancellationToken = default);
        Task<Workout?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
        Task<bool> DeleteWorkoutAsync(Workout workout, CancellationToken cancellationToken = default);
        Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task<List<(DateOnly Date, int Count)>> GetHeatmapDataAsync(long userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken = default);
        void RemoveWorkoutExercises(IEnumerable<WorkoutExercise> exercises);

        // History & routines
        Task<(List<Workout> Items, int Total)> GetHistoryAsync(long userId, int page, int limit, CancellationToken cancellationToken = default);
        Task<List<Workout>> GetTemplatesAsync(long userId, CancellationToken cancellationToken = default);
        Task<List<Workout>> GetWorkoutsInRangeAsync(long userId, DateOnly from, DateOnly to, CancellationToken cancellationToken = default);

        // Exercise performance
        Task<List<WorkoutExercise>> GetExerciseHistoryAsync(long userId, long exerciseId, int limit, CancellationToken cancellationToken = default);
        Task<List<WorkoutExercise>> GetLastPerformancesAsync(long userId, List<long> exerciseIds, CancellationToken cancellationToken = default);
        /// <summary>
        /// Best performances per exercise. When <paramref name="beforeDate"/> is given, only sessions that happened
        /// strictly before that workout (earlier date, or same date with a lower id) are considered.
        /// </summary>
        Task<List<ExerciseBestRecord>> GetBestsAsync(long userId, List<long> exerciseIds, DateOnly? beforeDate, long? beforeWorkoutId, CancellationToken cancellationToken = default);
    }
}
