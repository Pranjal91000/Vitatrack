using FluentValidation;
using VitaTrack.Core.Enums;

namespace VitaTrack.Api.Workouts.DTOs;

public record CreateExerciseRequest(string Name, short Type, string[] MuscleGroups, MeasurementType MeasurementType, string? Equipment = null);
public record UpdateExerciseRequest(string Name, short Type, string[] MuscleGroups, MeasurementType MeasurementType, string? Equipment = null);

public class CreateExerciseValidator : AbstractValidator<CreateExerciseRequest>
{
    public CreateExerciseValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MeasurementType).IsInEnum();
        RuleFor(x => x.MuscleGroups).NotNull();
        RuleFor(x => x.Equipment).MaximumLength(50);
    }
}

public class UpdateExerciseValidator : AbstractValidator<UpdateExerciseRequest>
{
    public UpdateExerciseValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MeasurementType).IsInEnum();
        RuleFor(x => x.MuscleGroups).NotNull();
        RuleFor(x => x.Equipment).MaximumLength(50);
    }
}
