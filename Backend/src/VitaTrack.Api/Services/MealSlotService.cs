using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Meals.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class MealSlotService(IMealSlotRepository mealSlotRepository, IJwtHelperService jwtHelperService) : IMealSlotService
    {
        private readonly IMealSlotRepository _mealSlotRepository = mealSlotRepository;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        public async Task<List<MealSlotDto>> GetSlotsAsync(CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var slots = await _mealSlotRepository.GetSlotsByUserIdAsync(userId, cancellationToken);
            return slots.Select(s => new MealSlotDto(s.Id, s.UserId, s.Name, s.SortOrder)).ToList();
        }

        public async Task<MealSlotDto> CreateSlotAsync(CreateMealSlotRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var maxOrder = await _mealSlotRepository.GetMaxSortOrderAsync(userId, cancellationToken);
            var slot = new MealSlot
            {
                UserId = userId,
                Name = request.Name.Trim(),
                SortOrder = maxOrder + 1
            };

            var created = await _mealSlotRepository.CreateSlotAsync(slot, cancellationToken);
            return new MealSlotDto(created.Id, created.UserId, created.Name, created.SortOrder);
        }
    }
}
