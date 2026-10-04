using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Options;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Auth;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class AuthService(IOptions<JwtOption> jwt, IUserRepository userRepository) : IAuthService
    {
        private readonly JwtOption _settings = jwt.Value;
        private readonly IUserRepository _userRepository = userRepository;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public (string Token, DateTime ExpiresAt) CreateToken(User user)
        {
            var expiresAt = DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expiresAt,
                Issuer = _settings.Issuer,
                Audience = _settings.Audience,
                SigningCredentials = credentials
            };

            var handler = new JsonWebTokenHandler();
            var token = handler.CreateToken(descriptor);

            return (token, expiresAt);
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (existingUser != null)
            {
                throw new Exception("User with this email already exists.");
            }

            var user = new User
            {
                Email = request.Email,
                Name = request.Name,
                Role = "User"
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            var refreshToken = GenerateRefreshToken();

            user.RefreshTokens.Add(new RefreshToken
            {
                Token = refreshToken,
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow
            });
            await _userRepository.CreateUserAsync(user, cancellationToken);

            var (token, _) = CreateToken(user);


            return new AuthResponse(token, refreshToken, user.Id, user.Email, user.Name);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                throw new Exception("Invalid email or password.");
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                throw new Exception("Invalid email or password.");
            }

            var (token, _) = CreateToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshTokens.Add(new RefreshToken
            {
                Token = refreshToken,
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow
            });

            await _userRepository.UpdateUserAsync(user, cancellationToken);

            return new AuthResponse(token, refreshToken, user.Id, user.Email, user.Name);
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshRequest request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken, cancellationToken);
            if (user == null)
            {
                throw new Exception("Invalid refresh token.");
            }

            var existingRefreshToken = user.RefreshTokens.FirstOrDefault(t => t.Token == request.RefreshToken);
            if (existingRefreshToken == null || !existingRefreshToken.IsActive)
            {
                throw new Exception("Refresh token is inactive or expired.");
            }

            existingRefreshToken.Revoked = DateTime.UtcNow;
            var newRefreshToken = GenerateRefreshToken();
            existingRefreshToken.ReplacedByToken = newRefreshToken;

            user.RefreshTokens.Add(new RefreshToken
            {
                Token = newRefreshToken,
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow
            });

            var (token, _) = CreateToken(user);
            await _userRepository.UpdateUserAsync(user, cancellationToken);

            return new AuthResponse(token, newRefreshToken, user.Id, user.Email, user.Name);
        }

        private static string GenerateRefreshToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(randomBytes);
        }
    }
}
