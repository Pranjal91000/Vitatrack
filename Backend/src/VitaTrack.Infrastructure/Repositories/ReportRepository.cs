using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class ReportRepository(AppDbContext appDbContext) : IReportRepository
    {
        private readonly AppDbContext _appDbContext = appDbContext;

        public async Task<List<Meal>> GetMealsForReportAsync(long userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Meals
                .Include(m => m.MealFoods)
                .ThenInclude(mf => mf.Food)
                .Include(m => m.MealSlot)
                .Where(m => m.UserId == userId && m.Date >= fromDate && m.Date <= toDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Workout>> GetWorkoutsForReportAsync(long userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Workouts
                .Include(w => w.Exercises).ThenInclude(we => we.Sets)
                .Include(w => w.Exercises).ThenInclude(we => we.Exercise)
                .Where(w => w.UserId == userId && w.Date >= fromDate && w.Date <= toDate && !w.IsTemplate)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Workout>> GetWorkoutsForExerciseMonthlyReportAsync(long userId, long exerciseId, DateOnly rangeFrom, DateOnly rangeTo, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Workouts
                .Include(w => w.Exercises).ThenInclude(we => we.Sets)
                .Include(w => w.Exercises).ThenInclude(we => we.Exercise)
                .Where(w => w.UserId == userId && w.Date >= rangeFrom && w.Date <= rangeTo && w.Exercises.Any(e => e.ExerciseId == exerciseId))
                .ToListAsync(cancellationToken);
        }

        public async Task<Exercise?> GetExerciseByIdAsync(long exerciseId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Exercises.FirstOrDefaultAsync(e => e.Id == exerciseId, cancellationToken);
        }
    }
}
