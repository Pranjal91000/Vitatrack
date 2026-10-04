using VitaTrack.Core.Entities;
using VitaTrack.Core.Enums;

namespace VitaTrack.Core.Common;

public static class TrainingMath
{
    /// <summary>Epley estimate of a one-rep max. A single rep is its own 1RM.</summary>
    public static decimal OneRepMax(decimal weightKg, int reps) =>
        reps <= 1 ? weightKg : Math.Round(weightKg * (1 + reps / 30m), 1);

    public static decimal? OneRepMax(Set s) =>
        s.WeightKg is > 0 && s.Reps is > 0 ? OneRepMax(s.WeightKg.Value, s.Reps.Value) : null;

    /// <summary>Warm-ups and un-ticked sets don't count toward volume, PRs or set totals.</summary>
    public static bool IsWorkingSet(Set s) => s.IsCompleted && s.SetType != SetType.Warmup;

    public static decimal Volume(IEnumerable<Set> sets) =>
        sets.Where(IsWorkingSet).Sum(s => (s.WeightKg ?? 0) * (s.Reps ?? 0));

    /// <summary>Mifflin-St Jeor. Sex defaults to the male constant when unknown.</summary>
    public static decimal? Bmr(decimal? weightKg, decimal? heightCm, int? age, string? sex)
    {
        if (!weightKg.HasValue || !heightCm.HasValue || !age.HasValue) return null;
        var s = sex == "female" ? -161m : 5m;
        return Math.Round(10m * weightKg.Value + 6.25m * heightCm.Value - 5m * age.Value + s, 0);
    }
}
