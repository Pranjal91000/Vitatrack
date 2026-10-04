using VitaTrack.Core.Common;

namespace VitaTrack.Core.Entities;

public class Workout : BaseEntity<long>, IAggregateRoot
{
    public long UserId { get; set; }
    public DateOnly Date { get; set; }
    public string? Name { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Notes { get; set; }
    public string? RecurrencePattern { get; set; }
    public bool IsTemplate { get; set; }

    public User User { get; set; } = null!;
    public ICollection<WorkoutExercise> Exercises { get; set; } = new List<WorkoutExercise>();
}
