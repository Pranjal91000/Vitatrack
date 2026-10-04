using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Core.Auth;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken token)
    {
        try
        {
            return Ok(await _authService.RegisterAsync(request, token));
        }
        catch (Exception ex) when (ex.Message.Contains("already exists"))
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken token)
    {
        try
        {
            return Ok(await _authService.LoginAsync(request, token));
        }
        catch (Exception ex) when (ex.Message.Contains("Invalid"))
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request, CancellationToken token)
    {
        try
        {
            return Ok(await _authService.RefreshTokenAsync(request, token));
        }
        catch (Exception ex) when (ex.Message.Contains("Invalid") || ex.Message.Contains("refresh"))
        {
            return Unauthorized(new { error = ex.Message });
        }
    }
}
