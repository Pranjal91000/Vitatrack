namespace VitaTrack.Core.Interfaces;

public interface IAnalyticsService
{
    Task<int> GetWellnessStreakAsync(long userId, CancellationToken cancellationToken);
}
