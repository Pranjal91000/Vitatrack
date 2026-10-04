using VitaTrack.Core.Common;
using VitaTrack.Core.Enums;

namespace VitaTrack.Core.Entities;

public class Set : BaseEntity<long>
{
    public long WorkoutExerciseId { get; set; }
    public int SetNumber { get; set; }
    public int? Reps { get; set; }
    public decimal? WeightKg { get; set; }
    public int? DurationSeconds { get; set; }
    public decimal? Rpe { get; set; }
    public decimal? DistanceKm { get; set; }
    public decimal? ElevationGainM { get; set; }
    public decimal? PaceMinPerKm { get; set; }

    /// <summary>Normal / Warmup / Drop / Failure. Warm-up sets are excluded from PRs and volume.</summary>
    public SetType SetType { get; set; } = SetType.Normal;

    /// <summary>True once the lifter ticks the set off in the live logger.</summary>
    public bool IsCompleted { get; set; } = true;

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public decimal? Pace => DistanceKm > 0 && DurationSeconds > 0 ? (decimal)DurationSeconds.Value / 60m / DistanceKm : null;

    public WorkoutExercise WorkoutExercise { get; set; } = null!;
}
