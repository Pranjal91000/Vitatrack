using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Meals.DTOs;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MealsController(IMealService mealService) : ControllerBase
{
    private readonly IMealService _mealService = mealService;

    [HttpGet]
    public async Task<ActionResult<DailyMealsDto>> GetDailyMeals([FromQuery] string date, CancellationToken cancellationToken)
    {
        var result = await _mealService.GetDailyMealsAsync(date, cancellationToken);
        if (result == null) return BadRequest("Invalid date format (yyyy-MM-dd)");

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<MealDto>> CreateMeal([FromBody] CreateMealRequest request, CancellationToken cancellationToken)
    {
        var (meal, error) = await _mealService.CreateMealAsync(request, cancellationToken);
        if (error != null) return BadRequest(error);

        return CreatedAtAction(nameof(GetDailyMeals), new { date = meal!.Date.ToString("yyyy-MM-dd") }, meal);
    }

    [HttpDelete("{mealId:long}")]
    public async Task<IActionResult> DeleteMeal(long mealId, CancellationToken cancellationToken)
    {
        var (success, error) = await _mealService.DeleteMealAsync(mealId, cancellationToken);
        if (error == "NotFound") return NotFound();
        if (error == "Forbid") return Forbid();

        return NoContent();
    }

    [HttpPut("{mealId:long}/foods/{foodId:long}")]
    public async Task<ActionResult<NutrientSummaryDto>> UpdateMealFood(long mealId, long foodId, [FromBody] UpdateMealFoodRequest request, CancellationToken cancellationToken)
    {
        var (summary, error) = await _mealService.UpdateMealFoodAsync(mealId, foodId, request, cancellationToken);
        if (error == "MealNotFound") return NotFound("Meal not found");
        if (error == "FoodNotFound") return NotFound("Food item not found inside meal");
        if (error == "Forbid") return Forbid();

        return Ok(summary);
    }

    /// <summary>Add one food to a meal slot on a date (the meal is created if needed).</summary>
    [HttpPost("entries")]
    public async Task<ActionResult<MealEntryDto>> AddEntry([FromBody] AddMealEntryRequest request, CancellationToken cancellationToken)
    {
        var (entry, error) = await _mealService.AddEntryAsync(request, cancellationToken);
        if (error != null) return BadRequest(error);
        return Ok(entry);
    }

    /// <summary>Change the number of servings of an entry. Quantity 0 removes it.</summary>
    [HttpPut("entries/{id:long}")]
    public async Task<ActionResult<MealEntryDto>> UpdateEntry(long id, [FromBody] UpdateMealFoodRequest request, CancellationToken cancellationToken)
    {
        var (entry, error) = await _mealService.UpdateEntryAsync(id, request, cancellationToken);
        if (error == "NotFound") return NotFound();
        return entry == null ? NoContent() : Ok(entry);
    }

    [HttpDelete("entries/{id:long}")]
    public async Task<IActionResult> DeleteEntry(long id, CancellationToken cancellationToken)
    {
        return await _mealService.DeleteEntryAsync(id, cancellationToken) ? NoContent() : NotFound();
    }

    /// <summary>Copy a meal slot (or a whole day) from one date to another.</summary>
    [HttpPost("copy")]
    public async Task<ActionResult<object>> Copy([FromBody] CopyMealsRequest request, CancellationToken cancellationToken)
    {
        var (copied, error) = await _mealService.CopyMealsAsync(request, cancellationToken);
        if (error != null) return BadRequest(error);
        return Ok(new { copied });
    }
}
