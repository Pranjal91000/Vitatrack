using VitaTrack.Api.Meals.DTOs;

namespace VitaTrack.Api.Abstractions
{
    public interface IMealSlotService
    {
        Task<List<MealSlotDto>> GetSlotsAsync(CancellationToken cancellationToken = default);
        Task<MealSlotDto> CreateSlotAsync(CreateMealSlotRequest request, CancellationToken cancellationToken = default);
    }
}
