using FluentValidation;

namespace VitaTrack.Api.Workouts.DTOs;

public record SetRequest(int SetNumber, int? Reps, decimal? WeightKg, int? DurationSeconds, decimal? Rpe, decimal? DistanceKm = null, decimal? ElevationGainM = null, decimal? PaceMinPerKm = null);
public record WorkoutExerciseRequest(long ExerciseId, List<SetRequest> Sets);
public record CreateWorkoutRequest(DateOnly Date, string? Name, int? DurationMinutes, string? Notes, List<WorkoutExerciseRequest> Exercises, string? RecurrencePattern = null, bool IsTemplate = false);
public record AppendExercisesRequest(List<WorkoutExerciseRequest> Exercises);

public class CreateWorkoutValidator : AbstractValidator<CreateWorkoutRequest>
{
    public CreateWorkoutValidator()
    {
        RuleFor(x => x.Exercises).NotEmpty();
        RuleForEach(x => x.Exercises).SetValidator(new WorkoutExerciseValidator());
    }
}

public class WorkoutExerciseValidator : AbstractValidator<WorkoutExerciseRequest>
{
    public WorkoutExerciseValidator()
    {
        RuleFor(x => x.ExerciseId).NotEmpty();
        RuleForEach(x => x.Sets).SetValidator(new SetValidator());
    }
}

public class SetValidator : AbstractValidator<SetRequest>
{
    public SetValidator()
    {
        RuleFor(x => x.SetNumber).GreaterThan(0);
    }
}
