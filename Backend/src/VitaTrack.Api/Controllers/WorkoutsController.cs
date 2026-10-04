using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Workouts.DTOs;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutsController(IWorkoutService workoutService) : ControllerBase
{
    private readonly IWorkoutService _workoutService = workoutService;

    [HttpGet]
    public async Task<ActionResult<DailyWorkoutsDto>> GetWorkouts([FromQuery] string date, CancellationToken cancellationToken)
    {
        var result = await _workoutService.GetWorkoutsAsync(date, cancellationToken);
        if (result == null) return BadRequest("Invalid date format (yyyy-MM-dd)");

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<WorkoutDto>> CreateWorkout([FromBody] CreateWorkoutRequest request, CancellationToken cancellationToken)
    {
        var result = await _workoutService.CreateWorkoutAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetWorkouts), new { date = result.Date.ToString("yyyy-MM-dd") }, result);
    }

    [HttpPost("{id}/exercises")]
    public async Task<ActionResult<WorkoutDto>> AppendExercises(long id, [FromBody] AppendExercisesRequest request, CancellationToken cancellationToken)
    {
        var (result, error) = await _workoutService.AppendExercisesAsync(id, request, cancellationToken);
        if (error == "NotFound") return NotFound("Workout not found");

        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorkoutDto>> UpdateWorkout(long id, [FromBody] CreateWorkoutRequest request, CancellationToken cancellationToken)
    {
        var (result, error) = await _workoutService.UpdateWorkoutAsync(id, request, cancellationToken);
        if (error == "NotFound") return NotFound("Workout not found");

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkout(long id, CancellationToken cancellationToken)
    {
        var (success, error) = await _workoutService.DeleteWorkoutAsync(id, cancellationToken);
        if (error == "NotFound") return NotFound("Workout not found");
        if (error == "Forbid") return Forbid();

        return NoContent();
    }

    [HttpGet("heatmap")]
    public async Task<ActionResult<IReadOnlyList<WorkoutHeatmapDayDto>>> GetWorkoutHeatmap(
        [FromQuery] string from,
        [FromQuery] string to,
        CancellationToken cancellationToken)
    {
        var (rows, error) = await _workoutService.GetWorkoutHeatmapAsync(from, to, cancellationToken);
        if (error == "InvalidDateFormat") return BadRequest("Invalid date format (yyyy-MM-dd)");
        if (error == "InvalidDateRange") return BadRequest("'from' must be on or before 'to'");

        return Ok(rows);
    }
}
