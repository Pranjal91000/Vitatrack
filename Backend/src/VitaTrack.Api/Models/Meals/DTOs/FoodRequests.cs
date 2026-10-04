using FluentValidation;

namespace VitaTrack.Api.Meals.DTOs;

public record CreateFoodRequest(string Name, decimal ServingSize, string Unit, int Calories, decimal ProteinG, decimal CarbsG, decimal FatG);

public record UpdateFoodRequest(string Name, decimal ServingSize, string Unit, int Calories, decimal Protein, decimal Carbs, decimal Fat);

public class CreateFoodValidator : AbstractValidator<CreateFoodRequest>
{
    public CreateFoodValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ServingSize).GreaterThan(0);
        RuleFor(x => x.Unit).NotEmpty();
        RuleFor(x => x.Calories).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ProteinG).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CarbsG).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FatG).GreaterThanOrEqualTo(0);
    }
}

public class UpdateFoodValidator : AbstractValidator<UpdateFoodRequest>
{
    public UpdateFoodValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ServingSize).GreaterThan(0);
        RuleFor(x => x.Unit).NotEmpty();
        RuleFor(x => x.Calories).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Protein).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Carbs).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Fat).GreaterThanOrEqualTo(0);
    }
}
