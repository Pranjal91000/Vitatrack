using FluentValidation;

namespace VitaTrack.Api.Users.DTOs;

/// <summary>
/// Full profile update. Every field except Name is replaced as sent (null clears a goal so it is derived again).
/// </summary>
public record UpdateProfileRequest(
    string? Name,
    int? Age,
    decimal? WeightKg,
    decimal? HeightCm,
    string? Sex = null,
    decimal? ActivityFactor = null,
    int? CalorieGoal = null,
    int? ProteinGoalG = null,
    int? CarbsGoalG = null,
    int? FatGoalG = null,
    decimal? WeightGoalKg = null,
    string? WeightUnit = null,
    int? DefaultRestSeconds = null);

public class UpdateProfileValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100).When(x => x.Name != null);
        RuleFor(x => x.Age).InclusiveBetween(10, 120).When(x => x.Age.HasValue);
        RuleFor(x => x.WeightKg).InclusiveBetween(20, 400).When(x => x.WeightKg.HasValue);
        RuleFor(x => x.HeightCm).InclusiveBetween(80, 260).When(x => x.HeightCm.HasValue);
        RuleFor(x => x.Sex).Must(s => s is "male" or "female").When(x => x.Sex != null)
            .WithMessage("Sex must be 'male' or 'female'.");
        RuleFor(x => x.ActivityFactor).InclusiveBetween(1.0m, 2.5m).When(x => x.ActivityFactor.HasValue);
        RuleFor(x => x.CalorieGoal).InclusiveBetween(800, 10000).When(x => x.CalorieGoal.HasValue);
        RuleFor(x => x.ProteinGoalG).InclusiveBetween(0, 1000).When(x => x.ProteinGoalG.HasValue);
        RuleFor(x => x.CarbsGoalG).InclusiveBetween(0, 2000).When(x => x.CarbsGoalG.HasValue);
        RuleFor(x => x.FatGoalG).InclusiveBetween(0, 1000).When(x => x.FatGoalG.HasValue);
        RuleFor(x => x.WeightGoalKg).InclusiveBetween(20, 400).When(x => x.WeightGoalKg.HasValue);
        RuleFor(x => x.WeightUnit).Must(u => u is "kg" or "lb").When(x => x.WeightUnit != null)
            .WithMessage("Weight unit must be 'kg' or 'lb'.");
        RuleFor(x => x.DefaultRestSeconds).InclusiveBetween(0, 1800).When(x => x.DefaultRestSeconds.HasValue);
    }
}
