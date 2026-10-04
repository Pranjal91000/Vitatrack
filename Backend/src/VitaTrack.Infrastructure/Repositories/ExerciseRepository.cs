using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class ExerciseRepository(AppDbContext appDbContext) : IExerciseRepository
    {
        private readonly AppDbContext _db = appDbContext;

        public async Task<(List<Exercise> Exercises, int TotalCount)> GetExercisesAsync(string? search, string? muscle, string? equipment, int page, int limit, CancellationToken cancellationToken = default)
        {
            var query = _db.Exercises.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = $"%{search.Trim()}%";
                query = query.Where(e => EF.Functions.ILike(e.Name, term));
            }

            if (!string.IsNullOrWhiteSpace(muscle))
            {
                query = query.Where(e => e.MuscleGroups.Contains(muscle));
            }

            if (!string.IsNullOrWhiteSpace(equipment))
            {
                query = query.Where(e => e.Equipment == equipment);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var exercises = await query
                .OrderBy(e => e.Name)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync(cancellationToken);

            return (exercises, totalCount);
        }

        public async Task<Exercise?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            return await _db.Exercises.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        }

        public async Task<Exercise> CreateExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default)
        {
            await _db.Exercises.AddAsync(exercise, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            return exercise;
        }

        public async Task<bool> UpdateExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default)
        {
            _db.Exercises.Update(exercise);
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default)
        {
            _db.Exercises.Remove(exercise);
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _db.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> IsUsedAsync(long exerciseId, CancellationToken cancellationToken = default)
        {
            return await _db.WorkoutExercises.AnyAsync(we => we.ExerciseId == exerciseId, cancellationToken);
        }
    }
}
