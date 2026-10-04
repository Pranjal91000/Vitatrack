using VitaTrack.Core.Auth;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Abstractions
{
    public interface IAuthService
    {
        public (string Token, DateTime ExpiresAt) CreateToken(User user);
        Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
        Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
        Task<AuthResponse> RefreshTokenAsync(RefreshRequest request, CancellationToken cancellationToken);
    }
}
