using FluentValidation;

namespace VitaTrack.Api.Users.DTOs;

public record UpdateProfileRequest(string? Name, int? Age, decimal? WeightKg, decimal? HeightCm);

public class UpdateProfileValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.Name).NotEmpty().When(x => x.Name != null); // Only validate if provided
        RuleFor(x => x.Age).GreaterThan(0).When(x => x.Age.HasValue);
        RuleFor(x => x.WeightKg).GreaterThan(0).When(x => x.WeightKg.HasValue);
        RuleFor(x => x.HeightCm).GreaterThan(0).When(x => x.HeightCm.HasValue);
    }
}
