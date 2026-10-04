using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Abstraction
{
    public interface IExerciseRepository
    {
        Task<(List<Exercise> Exercises, int TotalCount)> GetExercisesAsync(string search, int page, int limit, CancellationToken cancellationToken = default);
        Task<Exercise?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
        Task<Exercise> CreateExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default);
        Task<bool> UpdateExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default);
        Task<bool> DeleteExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default);
        Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
