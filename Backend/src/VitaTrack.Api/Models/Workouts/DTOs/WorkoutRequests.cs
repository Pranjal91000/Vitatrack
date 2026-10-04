using FluentValidation;
using VitaTrack.Core.Enums;

namespace VitaTrack.Api.Workouts.DTOs;

public record SetRequest(
    int SetNumber,
    int? Reps,
    decimal? WeightKg,
    int? DurationSeconds,
    decimal? Rpe,
    decimal? DistanceKm = null,
    decimal? ElevationGainM = null,
    decimal? PaceMinPerKm = null,
    SetType SetType = SetType.Normal,
    bool IsCompleted = true);

public record WorkoutExerciseRequest(long ExerciseId, List<SetRequest> Sets, string? Notes = null, int? RestSeconds = null);

public record CreateWorkoutRequest(
    DateOnly Date,
    string? Name,
    int? DurationMinutes,
    string? Notes,
    List<WorkoutExerciseRequest> Exercises,
    string? RecurrencePattern = null,
    bool IsTemplate = false,
    DateTime? StartedAt = null,
    DateTime? EndedAt = null);

public record AppendExercisesRequest(List<WorkoutExerciseRequest> Exercises);

/// <summary>A routine is a reusable plan: target sets live in the same set rows as a logged workout.</summary>
public record RoutineRequest(string Name, string? Notes, List<WorkoutExerciseRequest> Exercises);

public class CreateWorkoutValidator : AbstractValidator<CreateWorkoutRequest>
{
    public CreateWorkoutValidator()
    {
        RuleFor(x => x.Name).MaximumLength(120);
        RuleFor(x => x.DurationMinutes).InclusiveBetween(0, 24 * 60).When(x => x.DurationMinutes.HasValue);
        RuleFor(x => x.Exercises).NotEmpty().WithMessage("Add at least one exercise.");
        RuleForEach(x => x.Exercises).SetValidator(new WorkoutExerciseValidator());
        RuleFor(x => x.EndedAt).GreaterThanOrEqualTo(x => x.StartedAt)
            .When(x => x.StartedAt.HasValue && x.EndedAt.HasValue);
    }
}

public class RoutineValidator : AbstractValidator<RoutineRequest>
{
    public RoutineValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Exercises).NotEmpty().WithMessage("Add at least one exercise.");
        RuleForEach(x => x.Exercises).SetValidator(new WorkoutExerciseValidator());
    }
}

public class AppendExercisesValidator : AbstractValidator<AppendExercisesRequest>
{
    public AppendExercisesValidator()
    {
        RuleFor(x => x.Exercises).NotEmpty();
        RuleForEach(x => x.Exercises).SetValidator(new WorkoutExerciseValidator());
    }
}

public class WorkoutExerciseValidator : AbstractValidator<WorkoutExerciseRequest>
{
    public WorkoutExerciseValidator()
    {
        RuleFor(x => x.ExerciseId).GreaterThan(0);
        RuleFor(x => x.RestSeconds).InclusiveBetween(0, 1800).When(x => x.RestSeconds.HasValue);
        RuleFor(x => x.Notes).MaximumLength(1000);
        RuleForEach(x => x.Sets).SetValidator(new SetValidator());
    }
}

public class SetValidator : AbstractValidator<SetRequest>
{
    public SetValidator()
    {
        RuleFor(x => x.SetNumber).GreaterThan(0);
        RuleFor(x => x.Reps).InclusiveBetween(0, 1000).When(x => x.Reps.HasValue);
        RuleFor(x => x.WeightKg).InclusiveBetween(0, 2000).When(x => x.WeightKg.HasValue);
        RuleFor(x => x.Rpe).InclusiveBetween(1, 10).When(x => x.Rpe.HasValue);
        RuleFor(x => x.DurationSeconds).InclusiveBetween(0, 24 * 3600).When(x => x.DurationSeconds.HasValue);
        RuleFor(x => x.DistanceKm).InclusiveBetween(0, 1000).When(x => x.DistanceKm.HasValue);
        RuleFor(x => x.SetType).IsInEnum();
    }
}
