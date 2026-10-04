using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class WorkoutRepository(AppDbContext appDbContext) : IWorkoutRepository
    {
        private readonly AppDbContext _appDbContext = appDbContext;

        public async Task<List<Workout>> GetWorkoutsByDateAsync(long userId, DateOnly date, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Workouts
               .Include(w => w.Exercises).ThenInclude(we => we.Exercise)
               .Include(w => w.Exercises).ThenInclude(we => we.Sets)
               .Where(w => w.UserId == userId && w.Date == date && !w.IsTemplate)
               .ToListAsync(cancellationToken);
        }

        public async Task<List<Food>> GetExercisesByIdsAsync(List<long> exerciseIds, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Foods
                .Where(f => exerciseIds.Contains(f.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Exercise>> GetExerciseEntitiesByIdsAsync(List<long> exerciseIds, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Exercises
                .Where(e => exerciseIds.Contains(e.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<Workout> CreateWorkoutAsync(Workout workout, CancellationToken cancellationToken = default)
        {
            await _appDbContext.Workouts.AddAsync(workout, cancellationToken);
            await _appDbContext.SaveChangesAsync(cancellationToken);
            return workout;
        }

        public async Task<Workout?> GetWorkoutWithDetailsAsync(long id, long userId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Workouts
                .Include(w => w.Exercises).ThenInclude(we => we.Exercise)
                .Include(w => w.Exercises).ThenInclude(we => we.Sets)
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId, cancellationToken);
        }

        public async Task<Workout?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Workouts.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
        }

        public async Task<bool> DeleteWorkoutAsync(Workout workout, CancellationToken cancellationToken = default)
        {
            _appDbContext.Workouts.Remove(workout);
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<List<(DateOnly Date, int Count)>> GetHeatmapDataAsync(long userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken = default)
        {
            var data = await _appDbContext.Workouts
                .AsNoTracking()
                .Where(w => w.UserId == userId && !w.IsTemplate && w.Date >= fromDate && w.Date <= toDate)
                .GroupBy(w => w.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            return data.Select(x => (x.Date, x.Count)).ToList();
        }

        public void RemoveWorkoutExercises(IEnumerable<WorkoutExercise> exercises)
        {
            _appDbContext.WorkoutExercises.RemoveRange(exercises);
        }
    }
}
