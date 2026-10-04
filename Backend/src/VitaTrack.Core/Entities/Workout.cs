using VitaTrack.Core.Common;

namespace VitaTrack.Core.Entities;

/// <summary>
/// A logged session (IsTemplate = false) or a reusable routine (IsTemplate = true).
/// </summary>
public class Workout : BaseEntity<long>, IAggregateRoot
{
    public new long UserId { get; set; }
    public DateOnly Date { get; set; }
    public string? Name { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Notes { get; set; }
    public string? RecurrencePattern { get; set; }
    public bool IsTemplate { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    public new User User { get; set; } = null!;
    public ICollection<WorkoutExercise> Exercises { get; set; } = new List<WorkoutExercise>();
}
