using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class MealService(IMealRepository mealRepository, IJwtHelperService jwtHelperService) : IMealService
    {
        private readonly IMealRepository _mealRepository = mealRepository;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        public async Task<DailyMealsDto?> GetDailyMealsAsync(string dateString, CancellationToken cancellationToken = default)
        {
            if (!DateOnly.TryParse(dateString, out var parsedDate))
                return null;

            var userId = _jwtHelperService.GetUserId();
            var meals = await _mealRepository.GetDailyMealsAsync(userId, parsedDate, cancellationToken);
            var mealDtos = meals.Select(MapMealToDto).ToList();
            return new DailyMealsDto(mealDtos);
        }

        public async Task<(MealDto? Meal, string? Error)> CreateMealAsync(CreateMealRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            if (!await _mealRepository.CanUseMealSlotAsync(userId, request.MealSlotId, cancellationToken))
                return (null, "Invalid meal slot.");

            var meal = new Meal
            {
                UserId = userId,
                Date = request.Date,
                MealSlotId = request.MealSlotId,
                Notes = request.Notes
            };

            var foodIds = request.Foods.Select(f => f.FoodId).ToList();
            var foods = await _mealRepository.GetFoodsByIdsAsync(foodIds, cancellationToken);

            if (foods.Count != foodIds.Distinct().Count())
                return (null, "One or more foods not found.");

            foreach (var item in request.Foods)
            {
                var food = foods.First(f => f.Id == item.FoodId);
                meal.MealFoods.Add(new MealFood
                {
                    FoodId = food.Id,
                    Quantity = item.Quantity,
                    Food = food
                });
            }

            var createdMeal = await _mealRepository.CreateMealAsync(meal, cancellationToken);
            return (MapMealToDto(createdMeal), null);
        }

        public async Task<(bool Success, string? Error)> DeleteMealAsync(long mealId, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var meal = await _mealRepository.GetByIdAsync(mealId, cancellationToken);
            if (meal == null) return (false, "NotFound");
            if (meal.UserId != userId) return (false, "Forbid");

            await _mealRepository.DeleteMealAsync(meal, cancellationToken);
            return (true, null);
        }

        public async Task<(NutrientSummaryDto? Summary, string? Error)> UpdateMealFoodAsync(long mealId, long foodId, UpdateMealFoodRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var meal = await _mealRepository.GetByIdAsync(mealId, cancellationToken);
            if (meal == null) return (null, "MealNotFound");
            if (meal.UserId != userId) return (null, "Forbid");

            var mealFood = await _mealRepository.GetMealFoodAsync(mealId, foodId, cancellationToken);
            if (mealFood == null) return (null, "FoodNotFound");

            if (request.Quantity <= 0)
            {
                await _mealRepository.DeleteMealFoodAsync(mealFood, cancellationToken);
                return (new NutrientSummaryDto(0, 0, 0, 0), null);
            }

            mealFood.Quantity = request.Quantity;
            await _mealRepository.SaveChangesAsync(cancellationToken);

            var totals = new NutrientSummaryDto(
                (int)((decimal)mealFood.Quantity * (decimal)mealFood.Food.Calories),
                (decimal)mealFood.Quantity * mealFood.Food.ProteinG,
                (decimal)mealFood.Quantity * mealFood.Food.CarbsG,
                (decimal)mealFood.Quantity * mealFood.Food.FatG
            );

            return (totals, null);
        }

        private static MealDto MapMealToDto(Meal m)
        {
            var foodDtos = m.MealFoods.Select(mf =>
            {
                var foodDto = new FoodDto(
                    mf.Food.Id,
                    mf.Food.Name,
                    mf.Food.ServingSize,
                    mf.Food.Unit,
                    mf.Food.Calories,
                    mf.Food.ProteinG,
                    mf.Food.CarbsG,
                    mf.Food.FatG
                );

                var totals = new NutrientSummaryDto(
                    (int)((decimal)mf.Quantity * (decimal)mf.Food.Calories),
                    (decimal)mf.Quantity * mf.Food.ProteinG,
                    (decimal)mf.Quantity * mf.Food.CarbsG,
                    (decimal)mf.Quantity * mf.Food.FatG
                );

                return new MealFoodDto(mf.Id, foodDto, mf.Quantity, totals);
            }).ToList();

            var grandTotal = new NutrientSummaryDto(
                 foodDtos.Sum(x => x.Totals.Calories),
                 foodDtos.Sum(x => x.Totals.ProteinG),
                 foodDtos.Sum(x => x.Totals.CarbsG),
                 foodDtos.Sum(x => x.Totals.FatG)
            );

            return new MealDto(m.Id, m.MealSlotId, m.MealSlot.Name, m.Date, m.Notes, foodDtos, grandTotal);
        }
    }
}
