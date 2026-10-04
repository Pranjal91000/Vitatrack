using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Reports.DTOs;
using VitaTrack.Api.Workouts.DTOs;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(IReportService reportService) : ControllerBase
{
    private readonly IReportService _reportService = reportService;

    [HttpGet("nutrition")]
    public async Task<ActionResult<NutritionReportDto>> GetNutritionReport([FromQuery] string from, [FromQuery] string to, CancellationToken cancellationToken)
    {
        var (report, error) = await _reportService.GetNutritionReportAsync(from, to, cancellationToken);
        if (error == "InvalidDateFormat") return BadRequest("Invalid date format (yyyy-MM-dd)");
        if (error == "InvalidDateRange") return BadRequest("To date cannot be before From date");

        return Ok(report);
    }

    [HttpGet("workouts")]
    public async Task<ActionResult<WorkoutReportDto>> GetWorkoutReport([FromQuery] string from, [FromQuery] string to, CancellationToken cancellationToken)
    {
        var (report, error) = await _reportService.GetWorkoutReportAsync(from, to, cancellationToken);
        if (error == "InvalidDateFormat") return BadRequest("Invalid date format (yyyy-MM-dd)");
        if (error == "InvalidDateRange") return BadRequest("To date cannot be before From date");

        return Ok(report);
    }

    [HttpGet("exercises/{exerciseId}/monthly")]
    public async Task<ActionResult<ExerciseMonthlyReportDto>> GetExerciseMonthlyReport(long exerciseId, [FromQuery] string month, CancellationToken cancellationToken)
    {
        var (report, error) = await _reportService.GetExerciseMonthlyReportAsync(exerciseId, month, cancellationToken);
        if (error == "InvalidMonthFormat") return BadRequest("Invalid month format (yyyy-MM)");
        if (error == "NotFound") return NotFound("Exercise not found");

        return Ok(report);
    }
}
