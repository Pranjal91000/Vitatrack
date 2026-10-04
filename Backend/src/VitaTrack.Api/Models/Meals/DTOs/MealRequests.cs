using FluentValidation;

namespace VitaTrack.Api.Meals.DTOs;

public record AddFoodRequest(long FoodId, decimal Quantity);

public record CreateMealRequest(DateOnly Date, long MealSlotId, string? Notes, List<AddFoodRequest> Foods);

public record CreateMealSlotRequest(string Name);

public record UpdateMealFoodRequest(decimal Quantity);

/// <summary>Adds one food to the meal for (date, slot), creating the meal if it doesn't exist yet.</summary>
public record AddMealEntryRequest(DateOnly Date, long MealSlotId, long FoodId, decimal Quantity);

/// <summary>Copies every food of a slot (or of the whole day when MealSlotId is null) from one date to another.</summary>
public record CopyMealsRequest(DateOnly FromDate, DateOnly ToDate, long? MealSlotId);

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
        RuleFor(x => x.FoodId).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public class AddMealEntryValidator : AbstractValidator<AddMealEntryRequest>
{
    public AddMealEntryValidator()
    {
        RuleFor(x => x.MealSlotId).GreaterThan(0);
        RuleFor(x => x.FoodId).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public class UpdateMealFoodValidator : AbstractValidator<UpdateMealFoodRequest>
{
    public UpdateMealFoodValidator()
    {
        RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0).LessThanOrEqualTo(100);
    }
}

public class CreateMealSlotValidator : AbstractValidator<CreateMealSlotRequest>
{
    public CreateMealSlotValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
    }
}
