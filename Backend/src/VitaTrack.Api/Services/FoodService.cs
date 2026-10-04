using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class FoodService(IFoodRepository foodRepository, IJwtHelperService jwtHelperService) : IFoodService
    {
        private readonly IFoodRepository _foodRepository = foodRepository;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        public async Task<List<FoodDto>> SearchFoodsAsync(string search, int limit, CancellationToken cancellationToken = default)
        {
            var foods = await _foodRepository.SearchFoodsAsync(search, limit, cancellationToken);
            return foods.Select(f => new FoodDto(
                f.Id,
                f.Name,
                f.ServingSize,
                f.Unit,
                f.Calories,
                f.ProteinG,
                f.CarbsG,
                f.FatG
            )).ToList();
        }

        public async Task<FoodDto> CreateFoodAsync(CreateFoodRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var food = new Food
            {
                UserId = userId,
                Name = request.Name,
                ServingSize = request.ServingSize,
                Unit = request.Unit,
                Calories = request.Calories,
                ProteinG = request.ProteinG,
                CarbsG = request.CarbsG,
                FatG = request.FatG
            };

            var created = await _foodRepository.CreateFoodAsync(food, cancellationToken);
            return new FoodDto(
                created.Id,
                created.Name,
                created.ServingSize,
                created.Unit,
                created.Calories,
                created.ProteinG,
                created.CarbsG,
                created.FatG
            );
        }

        public async Task<(FoodDto? Food, string? Error)> UpdateFoodAsync(long id, UpdateFoodRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var food = await _foodRepository.GetByIdAsync(id, cancellationToken);
            if (food == null) return (null, "NotFound");
            if (food.UserId != userId) return (null, "Forbid");

            food.Name = request.Name;
            food.ServingSize = request.ServingSize;
            food.Unit = request.Unit;
            food.Calories = request.Calories;
            food.ProteinG = request.Protein;
            food.CarbsG = request.Carbs;
            food.FatG = request.Fat;

            await _foodRepository.UpdateFoodAsync(food, cancellationToken);

            var result = new FoodDto(
                food.Id,
                food.Name,
                food.ServingSize,
                food.Unit,
                food.Calories,
                food.ProteinG,
                food.CarbsG,
                food.FatG
            );

            return (result, null);
        }

        public async Task<(bool Success, string? Error)> DeleteFoodAsync(long id, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var food = await _foodRepository.GetByIdAsync(id, cancellationToken);
            if (food == null) return (false, "NotFound");
            if (food.UserId != userId) return (false, "Forbid");

            await _foodRepository.DeleteFoodAsync(food, cancellationToken);
            return (true, null);
        }
    }
}
