using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Interfaces;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly AppDbContext _context;

    public AnalyticsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> GetWellnessStreakAsync(long userId, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var mealDays = await _context.Meals
            .Where(m => m.UserId == userId && m.Date <= today)
            .Select(m => m.Date)
            .Distinct()
            .ToListAsync(cancellationToken);

        var workoutDays = await _context.Workouts
            .Where(w => w.UserId == userId && !w.IsTemplate && w.Date <= today)
            .Select(w => w.Date)
            .Distinct()
            .ToListAsync(cancellationToken);

        var active = mealDays.Union(workoutDays).ToHashSet();
        if (active.Count == 0) return 0;

        if (!active.Contains(today) && !active.Contains(today.AddDays(-1)))
            return 0;

        var current = active.Contains(today) ? today : today.AddDays(-1);
        var streak = 0;
        while (active.Contains(current))
        {
            streak++;
            current = current.AddDays(-1);
        }

        return streak;
    }
}
