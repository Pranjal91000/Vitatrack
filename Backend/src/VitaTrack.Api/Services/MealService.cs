using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class MealService(IMealRepository mealRepository, IUserRepository userRepository, IJwtHelperService jwtHelperService) : IMealService
    {
        private readonly IMealRepository _meals = mealRepository;
        private readonly IUserRepository _users = userRepository;
        private readonly IJwtHelperService _jwt = jwtHelperService;

        public async Task<DailyMealsDto?> GetDailyMealsAsync(string dateString, CancellationToken cancellationToken = default)
        {
            if (!DateOnly.TryParse(dateString, out var parsedDate))
                return null;

            var userId = _jwt.GetUserId();
            var meals = await _meals.GetDailyMealsAsync(userId, parsedDate, cancellationToken);
            var dtos = meals.Select(m => NutritionMapper.ToDto(m)).ToList();
            var user = await _users.GetByIdAsync(userId, cancellationToken);

            return new DailyMealsDto(
                parsedDate,
                dtos,
                NutrientSummaryDto.Sum(dtos.Select(m => m.GrandTotal)),
                GoalCalculator.Resolve(user));
        }

        public async Task<(MealDto? Meal, string? Error)> CreateMealAsync(CreateMealRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            if (!await _meals.CanUseMealSlotAsync(userId, request.MealSlotId, cancellationToken))
                return (null, "Invalid meal slot.");

            var foodIds = request.Foods.Select(f => f.FoodId).Distinct().ToList();
            var foods = await _meals.GetFoodsByIdsAsync(foodIds, cancellationToken);
            if (foods.Count != foodIds.Count)
                return (null, "One or more foods not found.");

            // Reuse the existing meal for this slot/day so a day never shows two "Breakfast" cards.
            var meal = await _meals.GetBySlotAndDateAsync(userId, request.MealSlotId, request.Date, cancellationToken);
            var isNew = meal == null;
            meal ??= new Meal { UserId = userId, Date = request.Date, MealSlotId = request.MealSlotId, Notes = request.Notes };

            foreach (var item in request.Foods)
            {
                var food = foods.First(f => f.Id == item.FoodId);
                meal.MealFoods.Add(new MealFood { FoodId = food.Id, Quantity = item.Quantity, Food = food });
            }

            if (isNew)
            {
                await _meals.CreateMealAsync(meal, cancellationToken);
            }
            else
            {
                await _meals.SaveChangesAsync(cancellationToken);
            }

            var daily = await _meals.GetDailyMealsAsync(userId, request.Date, cancellationToken);
            var saved = daily.First(m => m.Id == meal.Id);
            return (NutritionMapper.ToDto(saved), null);
        }

        public async Task<(bool Success, string? Error)> DeleteMealAsync(long mealId, CancellationToken cancellationToken = default)
        {
            var meal = await _meals.GetByIdAsync(mealId, cancellationToken);
            if (meal == null) return (false, "NotFound");
            if (meal.UserId != _jwt.GetUserId()) return (false, "Forbid");

            await _meals.DeleteMealAsync(meal, cancellationToken);
            return (true, null);
        }

        public async Task<(NutrientSummaryDto? Summary, string? Error)> UpdateMealFoodAsync(long mealId, long foodId, UpdateMealFoodRequest request, CancellationToken cancellationToken = default)
        {
            var meal = await _meals.GetByIdAsync(mealId, cancellationToken);
            if (meal == null) return (null, "MealNotFound");
            if (meal.UserId != _jwt.GetUserId()) return (null, "Forbid");

            var mealFood = await _meals.GetMealFoodAsync(mealId, foodId, cancellationToken);
            if (mealFood == null) return (null, "FoodNotFound");

            if (request.Quantity <= 0)
            {
                await _meals.DeleteMealFoodAsync(mealFood, cancellationToken);
                return (NutrientSummaryDto.Empty, null);
            }

            mealFood.Quantity = request.Quantity;
            await _meals.SaveChangesAsync(cancellationToken);
            return (NutritionMapper.Totals(mealFood), null);
        }

        public async Task<(MealEntryDto? Entry, string? Error)> AddEntryAsync(AddMealEntryRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwt.GetUserId();
            if (!await _meals.CanUseMealSlotAsync(userId, request.MealSlotId, cancellationToken))
                return (null, "Invalid meal slot.");

            var food = (await _meals.GetFoodsByIdsAsync(new List<long> { request.FoodId }, cancellationToken)).FirstOrDefault();
            if (food == null) return (null, "Food not found.");

            var meal = await _meals.GetBySlotAndDateAsync(userId, request.MealSlotId, request.Date, cancellationToken);
            if (meal == null)
            {
                meal = new Meal { UserId = userId, Date = request.Date, MealSlotId = request.MealSlotId };
                await _meals.CreateMealAsync(meal, cancellationToken);
            }

            var entry = new MealFood { MealId = meal.Id, FoodId = food.Id, Quantity = request.Quantity };
            await _meals.AddMealFoodAsync(entry, cancellationToken);
            entry.Food ??= food;

            return (new MealEntryDto(meal.Id, meal.MealSlotId, meal.Date, NutritionMapper.ToDto(entry)), null);
        }

        public async Task<(MealEntryDto? Entry, string? Error)> UpdateEntryAsync(long mealFoodId, UpdateMealFoodRequest request, CancellationToken cancellationToken = default)
        {
            var entry = await _meals.GetMealFoodByIdAsync(mealFoodId, cancellationToken);
            if (entry == null || entry.Meal.UserId != _jwt.GetUserId()) return (null, "NotFound");

            if (request.Quantity <= 0)
            {
                await _meals.DeleteMealFoodAsync(entry, cancellationToken);
                return (null, null);
            }

            entry.Quantity = request.Quantity;
            await _meals.SaveChangesAsync(cancellationToken);
            return (new MealEntryDto(entry.MealId, entry.Meal.MealSlotId, entry.Meal.Date, NutritionMapper.ToDto(entry)), null);
        }

        public async Task<bool> DeleteEntryAsync(long mealFoodId, CancellationToken cancellationToken = default)
        {
            var entry = await _meals.GetMealFoodByIdAsync(mealFoodId, cancellationToken);
            if (entry == null || entry.Meal.UserId != _jwt.GetUserId()) return false;

            await _meals.DeleteMealFoodAsync(entry, cancellationToken);
            return true;
        }

        public async Task<(int Copied, string? Error)> CopyMealsAsync(CopyMealsRequest request, CancellationToken cancellationToken = default)
        {
            if (request.FromDate == request.ToDate) return (0, "Pick a different day to copy from.");

            var userId = _jwt.GetUserId();
            var source = await _meals.GetDailyMealsAsync(userId, request.FromDate, cancellationToken);
            if (request.MealSlotId.HasValue)
                source = source.Where(m => m.MealSlotId == request.MealSlotId.Value).ToList();

            var copied = 0;
            foreach (var srcMeal in source)
            {
                var items = srcMeal.MealFoods.Where(mf => !mf.IsDeleted).ToList();
                if (items.Count == 0) continue;

                var target = await _meals.GetBySlotAndDateAsync(userId, srcMeal.MealSlotId, request.ToDate, cancellationToken);
                if (target == null)
                {
                    target = new Meal { UserId = userId, Date = request.ToDate, MealSlotId = srcMeal.MealSlotId };
                    foreach (var mf in items)
                        target.MealFoods.Add(new MealFood { FoodId = mf.FoodId, Quantity = mf.Quantity });
                    await _meals.CreateMealAsync(target, cancellationToken);
                }
                else
                {
                    foreach (var mf in items)
                        target.MealFoods.Add(new MealFood { FoodId = mf.FoodId, Quantity = mf.Quantity });
                    await _meals.SaveChangesAsync(cancellationToken);
                }
                copied += items.Count;
            }

            return (copied, null);
        }
    }
}
