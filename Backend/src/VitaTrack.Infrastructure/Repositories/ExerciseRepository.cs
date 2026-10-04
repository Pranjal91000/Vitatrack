using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class ExerciseRepository(AppDbContext appDbContext) : IExerciseRepository
    {
        private readonly AppDbContext _appDbContext = appDbContext;

        public async Task<(List<Exercise> Exercises, int TotalCount)> GetExercisesAsync(string search, int page, int limit, CancellationToken cancellationToken = default)
        {
            var term = search?.ToLower() ?? "";
            var query = _appDbContext.Exercises.AsQueryable();

            if (!string.IsNullOrEmpty(term))
            {
                query = query.Where(e => e.Name.ToLower().Contains(term));
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var exercises = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync(cancellationToken);

            return (exercises, totalCount);
        }

        public async Task<Exercise?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Exercises.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        }

        public async Task<Exercise> CreateExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default)
        {
            await _appDbContext.Exercises.AddAsync(exercise, cancellationToken);
            await _appDbContext.SaveChangesAsync(cancellationToken);
            return exercise;
        }

        public async Task<bool> UpdateExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default)
        {
            _appDbContext.Exercises.Update(exercise);
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteExerciseAsync(Exercise exercise, CancellationToken cancellationToken = default)
        {
            _appDbContext.Exercises.Remove(exercise);
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }
    }
}
