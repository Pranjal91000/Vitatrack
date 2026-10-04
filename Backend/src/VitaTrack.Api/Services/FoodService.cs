using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class FoodService(IFoodRepository foodRepository, IJwtHelperService jwtHelperService) : IFoodService
    {
        private readonly IFoodRepository _foodRepository = foodRepository;
        private readonly IJwtHelperService _jwt = jwtHelperService;

        public async Task<List<FoodDto>> SearchFoodsAsync(string search, int limit, CancellationToken cancellationToken = default)
        {
            var foods = await _foodRepository.SearchFoodsAsync(search, Math.Clamp(limit, 1, 100), cancellationToken);
            return foods.Select(f => NutritionMapper.ToDto(f)).ToList();
        }

        public async Task<List<FoodDto>> GetRecentFoodsAsync(int limit, CancellationToken cancellationToken = default)
        {
            var foods = await _foodRepository.GetRecentFoodsAsync(Math.Clamp(limit, 1, 50), cancellationToken);
            return foods.Select(f => NutritionMapper.ToDto(f)).ToList();
        }

        public async Task<List<FoodDto>> GetMyFoodsAsync(CancellationToken cancellationToken = default)
        {
            var foods = await _foodRepository.GetCustomFoodsAsync(_jwt.GetUserId(), cancellationToken);
            return foods.Select(f => NutritionMapper.ToDto(f)).ToList();
        }

        public async Task<FoodDto> CreateFoodAsync(CreateFoodRequest request, CancellationToken cancellationToken = default)
        {
            var food = new Food
            {
                UserId = _jwt.GetUserId(),
                Name = request.Name.Trim(),
                ServingSize = request.ServingSize,
                Unit = request.Unit.Trim(),
                Calories = request.Calories,
                ProteinG = request.ProteinG,
                CarbsG = request.CarbsG,
                FatG = request.FatG
            };

            var created = await _foodRepository.CreateFoodAsync(food, cancellationToken);
            return NutritionMapper.ToDto(created);
        }

        public async Task<(FoodDto? Food, string? Error)> UpdateFoodAsync(long id, UpdateFoodRequest request, CancellationToken cancellationToken = default)
        {
            var food = await _foodRepository.GetByIdAsync(id, cancellationToken);
            if (food == null) return (null, "NotFound");
            if (food.UserId != _jwt.GetUserId()) return (null, "Forbid");

            food.Name = request.Name.Trim();
            food.ServingSize = request.ServingSize;
            food.Unit = request.Unit.Trim();
            food.Calories = request.Calories;
            food.ProteinG = request.ProteinG;
            food.CarbsG = request.CarbsG;
            food.FatG = request.FatG;

            await _foodRepository.UpdateFoodAsync(food, cancellationToken);
            return (NutritionMapper.ToDto(food), null);
        }

        public async Task<(bool Success, string? Error)> DeleteFoodAsync(long id, CancellationToken cancellationToken = default)
        {
            var food = await _foodRepository.GetByIdAsync(id, cancellationToken);
            if (food == null) return (false, "NotFound");
            if (food.UserId != _jwt.GetUserId()) return (false, "Forbid");

            await _foodRepository.DeleteFoodAsync(food, cancellationToken);
            return (true, null);
        }
    }
}
