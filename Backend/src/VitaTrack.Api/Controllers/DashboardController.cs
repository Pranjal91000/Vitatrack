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
        var result = await _dashboardService.GetDailyDashboardAsync(date, cancellationToken);
        return Ok(result);
    }
}
