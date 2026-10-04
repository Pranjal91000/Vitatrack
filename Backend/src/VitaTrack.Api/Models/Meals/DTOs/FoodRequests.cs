using FluentValidation;

namespace VitaTrack.Api.Meals.DTOs;

public record CreateFoodRequest(string Name, decimal ServingSize, string Unit, int Calories, decimal ProteinG, decimal CarbsG, decimal FatG);

public record UpdateFoodRequest(string Name, decimal ServingSize, string Unit, int Calories, decimal ProteinG, decimal CarbsG, decimal FatG);

public class CreateFoodValidator : AbstractValidator<CreateFoodRequest>
{
    public CreateFoodValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ServingSize).GreaterThan(0);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Calories).InclusiveBetween(0, 10000);
        RuleFor(x => x.ProteinG).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CarbsG).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FatG).GreaterThanOrEqualTo(0);
    }
}

public class UpdateFoodValidator : AbstractValidator<UpdateFoodRequest>
{
    public UpdateFoodValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ServingSize).GreaterThan(0);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Calories).InclusiveBetween(0, 10000);
        RuleFor(x => x.ProteinG).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CarbsG).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FatG).GreaterThanOrEqualTo(0);
    }
}
