using VitaTrack.Core.Common;

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

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public decimal? Pace => DistanceKm > 0 && DurationSeconds > 0 ? (decimal)DurationSeconds.Value / 60m / DistanceKm : null;

    public WorkoutExercise WorkoutExercise { get; set; } = null!;
}
