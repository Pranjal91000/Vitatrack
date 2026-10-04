using FluentValidation;

namespace VitaTrack.Api.Meals.DTOs;

public record AddFoodRequest(long FoodId, decimal Quantity);

public record CreateMealRequest(DateOnly Date, long MealSlotId, string? Notes, List<AddFoodRequest> Foods);

public record CreateMealSlotRequest(string Name);

public record UpdateMealFoodRequest(decimal Quantity);

public class CreateMealValidator : AbstractValidator<CreateMealRequest>
{
    public CreateMealValidator()
    {
        RuleFor(x => x.MealSlotId).GreaterThan(0);
        RuleFor(x => x.Foods).NotEmpty();
        RuleForEach(x => x.Foods).SetValidator(new AddFoodValidator());
    }
}

public class AddFoodValidator : AbstractValidator<AddFoodRequest>
{
    public AddFoodValidator()
    {
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}

public class CreateMealSlotValidator : AbstractValidator<CreateMealSlotRequest>
{
    public CreateMealSlotValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
    }
}
