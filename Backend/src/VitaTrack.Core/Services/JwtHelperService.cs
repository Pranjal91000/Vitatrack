using Microsoft.AspNetCore.Http;
using VitaTrack.Core.Abstraction;

namespace VitaTrack.Core.Services;

public class JwtHelperService(IHttpContextAccessor httpContextAccessor) : IJwtHelperService
{
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public long GetUserId()
    {
        var user = _httpContextAccessor?.HttpContext?.User;
        if (user is null)
            return 0;

        var userIdClaim =  user.FindFirst("sub")?.Value;

        if (long.TryParse(userIdClaim, out long result))
        {
            return result;
        }

        return 0;
    }
}