using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Common;
using VitaTrack.Core.Entities;
using VitaTrack.Core.Enums;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class WorkoutRepository(AppDbContext appDbContext) : IWorkoutRepository
    {
        private readonly AppDbContext _db = appDbContext;

        private IQueryable<Workout> WithDetails() => _db.Workouts
            .Include(w => w.Exercises).ThenInclude(we => we.Exercise)
            .Include(w => w.Exercises).ThenInclude(we => we.Sets)
            .AsSplitQuery();

        public async Task<List<Workout>> GetWorkoutsByDateAsync(long userId, DateOnly date, CancellationToken cancellationToken = default)
        {
            return await WithDetails()
               .Where(w => w.UserId == userId && w.Date == date && !w.IsTemplate)
               .OrderBy(w => w.StartedAt).ThenBy(w => w.Id)
               .ToListAsync(cancellationToken);
        }

        public async Task<List<Exercise>> GetExerciseEntitiesByIdsAsync(List<long> exerciseIds, CancellationToken cancellationToken = default)
        {
            return await _db.Exercises
                .Where(e => exerciseIds.Contains(e.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<Workout> CreateWorkoutAsync(Workout workout, CancellationToken cancellationToken = default)
        {
            await _db.Workouts.AddAsync(workout, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            return workout;
        }

        public async Task<Workout?> GetWorkoutWithDetailsAsync(long id, long userId, CancellationToken cancellationToken = default)
        {
            return await WithDetails()
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId, cancellationToken);
        }

        public async Task<Workout?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            return await _db.Workouts.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
        }

        public async Task<bool> DeleteWorkoutAsync(Workout workout, CancellationToken cancellationToken = default)
        {
            _db.Workouts.Remove(workout);
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<List<(DateOnly Date, int Count)>> GetHeatmapDataAsync(long userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken = default)
        {
            var data = await _db.Workouts
                .AsNoTracking()
                .Where(w => w.UserId == userId && !w.IsTemplate && w.Date >= fromDate && w.Date <= toDate)
                .GroupBy(w => w.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            return data.Select(x => (x.Date, x.Count)).ToList();
        }

        public void RemoveWorkoutExercises(IEnumerable<WorkoutExercise> exercises)
        {
            var list = exercises.ToList();
            _db.Sets.RemoveRange(list.SelectMany(e => e.Sets));
            _db.WorkoutExercises.RemoveRange(list);
        }

        public async Task<(List<Workout> Items, int Total)> GetHistoryAsync(long userId, int page, int limit, CancellationToken cancellationToken = default)
        {
            var baseQuery = _db.Workouts.Where(w => w.UserId == userId && !w.IsTemplate);
            var total = await baseQuery.CountAsync(cancellationToken);

            var ids = await baseQuery
                .OrderByDescending(w => w.Date)
                .ThenByDescending(w => w.StartedAt)
                .ThenByDescending(w => w.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(w => w.Id)
                .ToListAsync(cancellationToken);

            var items = await WithDetails().AsNoTracking()
                .Where(w => ids.Contains(w.Id))
                .ToListAsync(cancellationToken);

            // Preserve paging order
            var ordered = ids.Select(id => items.First(w => w.Id == id)).ToList();
            return (ordered, total);
        }

        public async Task<List<Workout>> GetTemplatesAsync(long userId, CancellationToken cancellationToken = default)
        {
            return await WithDetails().AsNoTracking()
                .Where(w => w.UserId == userId && w.IsTemplate)
                .OrderBy(w => w.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Workout>> GetWorkoutsInRangeAsync(long userId, DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
        {
            return await WithDetails().AsNoTracking()
                .Where(w => w.UserId == userId && !w.IsTemplate && w.Date >= from && w.Date <= to)
                .OrderBy(w => w.Date)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<WorkoutExercise>> GetExerciseHistoryAsync(long userId, long exerciseId, int limit, CancellationToken cancellationToken = default)
        {
            return await _db.WorkoutExercises
                .AsNoTracking()
                .Include(we => we.Workout)
                .Include(we => we.Sets)
                .Where(we => we.ExerciseId == exerciseId && we.Workout.UserId == userId && !we.Workout.IsTemplate)
                .OrderByDescending(we => we.Workout.Date)
                .ThenByDescending(we => we.Workout.StartedAt)
                .ThenByDescending(we => we.Id)
                .Take(limit)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<WorkoutExercise>> GetLastPerformancesAsync(long userId, List<long> exerciseIds, CancellationToken cancellationToken = default)
        {
            if (exerciseIds.Count == 0) return new List<WorkoutExercise>();

            // Light query first: find the most recent workout_exercise row per exercise.
            var candidates = await _db.WorkoutExercises
                .AsNoTracking()
                .Where(we => exerciseIds.Contains(we.ExerciseId) && we.Workout.UserId == userId && !we.Workout.IsTemplate)
                .Select(we => new { we.Id, we.ExerciseId, we.Workout.Date, we.Workout.StartedAt })
                .ToListAsync(cancellationToken);

            var latestIds = candidates
                .GroupBy(c => c.ExerciseId)
                .Select(g => g.OrderByDescending(c => c.Date).ThenByDescending(c => c.StartedAt).ThenByDescending(c => c.Id).First().Id)
                .ToList();

            return await _db.WorkoutExercises
                .AsNoTracking()
                .Include(we => we.Sets)
                .Include(we => we.Workout)
                .Where(we => latestIds.Contains(we.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<List<ExerciseBestRecord>> GetBestsAsync(long userId, List<long> exerciseIds, DateOnly? beforeDate, long? beforeWorkoutId, CancellationToken cancellationToken = default)
        {
            if (exerciseIds.Count == 0) return new List<ExerciseBestRecord>();

            var query = _db.Sets
                .AsNoTracking()
                .Where(s => exerciseIds.Contains(s.WorkoutExercise.ExerciseId)
                            && s.WorkoutExercise.Workout.UserId == userId
                            && !s.WorkoutExercise.Workout.IsTemplate
                            && s.IsCompleted
                            && s.SetType != SetType.Warmup);

            if (beforeDate.HasValue)
            {
                var d = beforeDate.Value;
                var id = beforeWorkoutId ?? long.MaxValue;
                query = query.Where(s => s.WorkoutExercise.Workout.Date < d
                                         || (s.WorkoutExercise.Workout.Date == d && s.WorkoutExercise.WorkoutId < id));
            }

            var rows = await query
                .Select(s => new { s.WorkoutExercise.ExerciseId, s.WeightKg, s.Reps })
                .ToListAsync(cancellationToken);

            return rows
                .GroupBy(r => r.ExerciseId)
                .Select(g => new ExerciseBestRecord(
                    g.Key,
                    g.Max(r => r.WeightKg),
                    g.Where(r => r.WeightKg > 0 && r.Reps > 0).Select(r => (decimal?)TrainingMath.OneRepMax(r.WeightKg!.Value, r.Reps!.Value)).Max(),
                    g.Max(r => r.Reps),
                    g.Where(r => r.WeightKg.HasValue && r.Reps.HasValue).Select(r => (decimal?)(r.WeightKg!.Value * r.Reps!.Value)).Max()))
                .ToList();
        }
    }
}
