using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Dashboard.DTOs;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    private readonly IDashboardService _dashboardService = dashboardService;

    [HttpGet("daily")]
    public async Task<ActionResult<DashboardDailyDto>> GetDailyDashboard([FromQuery] string date, CancellationToken cancellationToken)
    {
        return Ok(await _dashboardService.GetDailyDashboardAsync(date, cancellationToken));
    }

    /// <summary>Single payload for the home screen: today's nutrition vs goals, this week's training, weight trend.</summary>
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary([FromQuery] string? date, CancellationToken cancellationToken)
    {
        return Ok(await _dashboardService.GetSummaryAsync(date, cancellationToken));
    }
}
