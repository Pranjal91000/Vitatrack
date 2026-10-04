using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Users.DTOs;
using VitaTrack.Core.Abstraction;

namespace VitaTrack.Api.Services
{
    public class UserService(IUserRepository userRepository, IJwtHelperService jwtHelperService) : IUserService
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

        public async Task<UserProfileDto?> GetProfileAsync(CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null) return null;

            return new UserProfileDto(
                user.Id,
                user.Email,
                user.Name,
                user.Age,
                user.WeightKg,
                user.HeightCm,
                user.Bmr
            );
        }

        public async Task<UserProfileDto?> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _jwtHelperService.GetUserId();
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null) return null;

            if (request.Name != null) user.Name = request.Name;
            if (request.Age.HasValue) user.Age = request.Age.Value;
            if (request.WeightKg.HasValue) user.WeightKg = request.WeightKg.Value;
            if (request.HeightCm.HasValue) user.HeightCm = request.HeightCm.Value;

            if (user.WeightKg.HasValue && user.HeightCm.HasValue && user.Age.HasValue)
            {
                user.Bmr = (10m * user.WeightKg.Value) + (6.25m * user.HeightCm.Value) - (5m * user.Age.Value) + 5;
            }

            await _userRepository.UpdateUserAsync(user, cancellationToken);

            return new UserProfileDto(
                user.Id,
                user.Email,
                user.Name,
                user.Age,
                user.WeightKg,
                user.HeightCm,
                user.Bmr
            );
        }
    }
}
