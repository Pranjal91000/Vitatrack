using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Meals.DTOs;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FoodsController(IFoodService foodService) : ControllerBase
{
    private readonly IFoodService _foodService = foodService;

    [HttpGet]
    public async Task<ActionResult<List<FoodDto>>> SearchFoods([FromQuery] string search = "", [FromQuery] int limit = 10, CancellationToken cancellationToken = default)
    {
        var foods = await _foodService.SearchFoodsAsync(search, limit, cancellationToken);
        return Ok(foods);
    }

    [HttpPost]
    public async Task<ActionResult<FoodDto>> CreateFood([FromBody] CreateFoodRequest request, CancellationToken cancellationToken)
    {
        var result = await _foodService.CreateFoodAsync(request, cancellationToken);
        return CreatedAtAction(nameof(SearchFoods), new { search = result.Name }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FoodDto>> UpdateFood(long id, [FromBody] UpdateFoodRequest request, CancellationToken cancellationToken)
    {
        var (food, error) = await _foodService.UpdateFoodAsync(id, request, cancellationToken);
        if (error == "NotFound") return NotFound("Food not found");
        if (error == "Forbid") return Forbid();

        return Ok(food);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFood(long id, CancellationToken cancellationToken)
    {
        var (success, error) = await _foodService.DeleteFoodAsync(id, cancellationToken);
        if (error == "NotFound") return NotFound("Food not found");
        if (error == "Forbid") return Forbid();

        return NoContent();
    }
}
