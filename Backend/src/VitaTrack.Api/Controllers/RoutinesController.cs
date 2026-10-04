using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Workouts.DTOs;

namespace VitaTrack.Api.Controllers;

/// <summary>Reusable workout plans ("Push day", "Legs"…). Stored as template workouts.</summary>
[ApiController]
[Route("api/routines")]
[Authorize]
public class RoutinesController(IWorkoutService workoutService) : ControllerBase
{
    private readonly IWorkoutService _workoutService = workoutService;

    [HttpGet]
    public async Task<ActionResult<List<WorkoutDto>>> GetRoutines(CancellationToken cancellationToken)
    {
        return Ok(await _workoutService.GetRoutinesAsync(cancellationToken));
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<WorkoutDto>> GetRoutine(long id, CancellationToken cancellationToken)
    {
        var routine = await _workoutService.GetRoutineAsync(id, cancellationToken);
        return routine == null ? NotFound("Routine not found") : Ok(routine);
    }

    [HttpPost]
    public async Task<ActionResult<WorkoutDto>> CreateRoutine([FromBody] RoutineRequest request, CancellationToken cancellationToken)
    {
        var routine = await _workoutService.CreateRoutineAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetRoutine), new { id = routine.Id }, routine);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<WorkoutDto>> UpdateRoutine(long id, [FromBody] RoutineRequest request, CancellationToken cancellationToken)
    {
        var routine = await _workoutService.UpdateRoutineAsync(id, request, cancellationToken);
        return routine == null ? NotFound("Routine not found") : Ok(routine);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteRoutine(long id, CancellationToken cancellationToken)
    {
        return await _workoutService.DeleteRoutineAsync(id, cancellationToken) ? NoContent() : NotFound("Routine not found");
    }
}
