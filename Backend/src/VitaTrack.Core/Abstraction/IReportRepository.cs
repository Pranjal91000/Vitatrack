using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Abstraction
{
    public interface IReportRepository
    {
        Task<List<Meal>> GetMealsForReportAsync(long userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken = default);
        Task<List<Workout>> GetWorkoutsForReportAsync(long userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken = default);
        Task<List<Workout>> GetWorkoutsForExerciseMonthlyReportAsync(long userId, long exerciseId, DateOnly rangeFrom, DateOnly rangeTo, CancellationToken cancellationToken = default);
        Task<Exercise?> GetExerciseByIdAsync(long exerciseId, CancellationToken cancellationToken = default);
    }
}
