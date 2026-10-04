using FluentValidation;
using VitaTrack.Core.Enums;

namespace VitaTrack.Api.Workouts.DTOs;

public record CreateExerciseRequest(string Name, short Type, string[] MuscleGroups, MeasurementType MeasurementType);
public record UpdateExerciseRequest(string Name, short Type, string[] MuscleGroups, MeasurementType MeasurementType);

public class CreateExerciseValidator : AbstractValidator<CreateExerciseRequest>
{
    public CreateExerciseValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MeasurementType).IsInEnum();
    }
}

public class UpdateExerciseValidator : AbstractValidator<UpdateExerciseRequest>
{
    public UpdateExerciseValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MeasurementType).IsInEnum();
    }
}
