using VitaTrack.Core.Common;

namespace VitaTrack.Core.Entities;

public class WorkoutExercise : BaseEntity<long>
{
    public long WorkoutId { get; set; }
    public long ExerciseId { get; set; }
    public int Order { get; set; }

    public Workout Workout { get; set; } = null!;
    public Exercise Exercise { get; set; } = null!;
    public ICollection<Set> Sets { get; set; } = new List<Set>();
}
