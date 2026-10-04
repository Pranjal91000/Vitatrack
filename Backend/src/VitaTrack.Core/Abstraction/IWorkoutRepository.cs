using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Abstraction
{
    public interface IWorkoutRepository
    {
        Task<List<Workout>> GetWorkoutsByDateAsync(long userId, DateOnly date, CancellationToken cancellationToken = default);
        Task<List<Food>> GetExercisesByIdsAsync(List<long> exerciseIds, CancellationToken cancellationToken = default);
        Task<List<Exercise>> GetExerciseEntitiesByIdsAsync(List<long> exerciseIds, CancellationToken cancellationToken = default);
        Task<Workout> CreateWorkoutAsync(Workout workout, CancellationToken cancellationToken = default);
        Task<Workout?> GetWorkoutWithDetailsAsync(long id, long userId, CancellationToken cancellationToken = default);
        Task<Workout?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
        Task<bool> DeleteWorkoutAsync(Workout workout, CancellationToken cancellationToken = default);
        Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task<List<(DateOnly Date, int Count)>> GetHeatmapDataAsync(long userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken = default);
        void RemoveWorkoutExercises(IEnumerable<WorkoutExercise> exercises);
    }
}
