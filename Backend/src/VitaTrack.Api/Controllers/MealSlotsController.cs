using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Meals.DTOs;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/meal-slots")]
[Authorize]
public class MealSlotsController(IMealSlotService mealSlotService) : ControllerBase
{
    private readonly IMealSlotService _mealSlotService = mealSlotService;

    [HttpGet]
    public async Task<ActionResult<List<MealSlotDto>>> GetSlots(CancellationToken cancellationToken)
    {
        var slots = await _mealSlotService.GetSlotsAsync(cancellationToken);
        return Ok(slots);
    }

    [HttpPost]
    public async Task<ActionResult<MealSlotDto>> CreateSlot([FromBody] CreateMealSlotRequest request, CancellationToken cancellationToken)
    {
        var dto = await _mealSlotService.CreateSlotAsync(request, cancellationToken);
        return Ok(dto);
    }
}
