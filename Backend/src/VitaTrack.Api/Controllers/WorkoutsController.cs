using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Common.Models;
using VitaTrack.Api.Workouts.DTOs;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutsController(IWorkoutService workoutService) : ControllerBase
{
    private readonly IWorkoutService _workoutService = workoutService;

    /// <summary>Workouts logged on a given day.</summary>
    [HttpGet]
    public async Task<ActionResult<DailyWorkoutsDto>> GetWorkouts([FromQuery] string date, CancellationToken cancellationToken)
    {
        var result = await _workoutService.GetWorkoutsAsync(date, cancellationToken);
        if (result == null) return BadRequest("Invalid date format (yyyy-MM-dd)");
        return Ok(result);
    }

    /// <summary>Paged workout history, newest first.</summary>
    [HttpGet("history")]
    public async Task<ActionResult<ApiResponse<List<WorkoutSummaryDto>>>> GetHistory([FromQuery] int page = 1, [FromQuery] int limit = 20, CancellationToken cancellationToken = default)
    {
        return Ok(await _workoutService.GetHistoryAsync(page, limit, cancellationToken));
    }

    /// <summary>Full workout with sets and the personal records it set.</summary>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<WorkoutDto>> GetWorkout(long id, CancellationToken cancellationToken)
    {
        var result = await _workoutService.GetWorkoutAsync(id, cancellationToken);
        return result == null ? NotFound("Workout not found") : Ok(result);
    }

    /// <summary>Save a finished session. The response lists any personal records hit.</summary>
    [HttpPost]
    public async Task<ActionResult<WorkoutDto>> CreateWorkout([FromBody] CreateWorkoutRequest request, CancellationToken cancellationToken)
    {
        var result = await _workoutService.CreateWorkoutAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetWorkout), new { id = result.Id }, result);
    }

    [HttpPost("{id:long}/exercises")]
    public async Task<ActionResult<WorkoutDto>> AppendExercises(long id, [FromBody] AppendExercisesRequest request, CancellationToken cancellationToken)
    {
        var (result, error) = await _workoutService.AppendExercisesAsync(id, request, cancellationToken);
        if (error == "NotFound") return NotFound("Workout not found");
        return Ok(result);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<WorkoutDto>> UpdateWorkout(long id, [FromBody] CreateWorkoutRequest request, CancellationToken cancellationToken)
    {
        var (result, error) = await _workoutService.UpdateWorkoutAsync(id, request, cancellationToken);
        if (error == "NotFound") return NotFound("Workout not found");
        return Ok(result);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteWorkout(long id, CancellationToken cancellationToken)
    {
        var (_, error) = await _workoutService.DeleteWorkoutAsync(id, cancellationToken);
        if (error == "NotFound") return NotFound("Workout not found");
        if (error == "Forbid") return Forbid();
        return NoContent();
    }

    /// <summary>Turn a logged workout into a reusable routine.</summary>
    [HttpPost("{id:long}/save-as-routine")]
    public async Task<ActionResult<WorkoutDto>> SaveAsRoutine(long id, [FromBody] SaveAsRoutineRequest? request, CancellationToken cancellationToken)
    {
        var result = await _workoutService.SaveWorkoutAsRoutineAsync(id, request?.Name, cancellationToken);
        return result == null ? NotFound("Workout not found") : Ok(result);
    }

    [HttpGet("heatmap")]
    public async Task<ActionResult<IReadOnlyList<WorkoutHeatmapDayDto>>> GetWorkoutHeatmap([FromQuery] string from, [FromQuery] string to, CancellationToken cancellationToken)
    {
        var (rows, error) = await _workoutService.GetWorkoutHeatmapAsync(from, to, cancellationToken);
        if (error == "InvalidDateFormat") return BadRequest("Invalid date format (yyyy-MM-dd)");
        if (error == "InvalidDateRange") return BadRequest("'from' must be on or before 'to'");
        return Ok(rows);
    }
}

public record SaveAsRoutineRequest(string? Name);
