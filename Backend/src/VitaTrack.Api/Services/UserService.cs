using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Users.DTOs;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Common;
using VitaTrack.Core.Entities;

namespace VitaTrack.Api.Services
{
    public class UserService(IUserRepository userRepository, IJwtHelperService jwtHelperService) : IUserService
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IJwtHelperService _jwt = jwtHelperService;

        public async Task<UserProfileDto?> GetProfileAsync(CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByIdAsync(_jwt.GetUserId(), cancellationToken);
            return user == null ? null : ToDto(user);
        }

        public async Task<UserProfileDto?> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByIdAsync(_jwt.GetUserId(), cancellationToken);
            if (user == null) return null;

            if (!string.IsNullOrWhiteSpace(request.Name)) user.Name = request.Name.Trim();
            user.Age = request.Age;
            user.WeightKg = request.WeightKg;
            user.HeightCm = request.HeightCm;
            user.Sex = request.Sex;
            user.ActivityFactor = request.ActivityFactor;
            user.CalorieGoal = request.CalorieGoal;
            user.ProteinGoalG = request.ProteinGoalG;
            user.CarbsGoalG = request.CarbsGoalG;
            user.FatGoalG = request.FatGoalG;
            user.WeightGoalKg = request.WeightGoalKg;
            if (request.WeightUnit != null) user.WeightUnit = request.WeightUnit;
            if (request.DefaultRestSeconds.HasValue) user.DefaultRestSeconds = request.DefaultRestSeconds.Value;

            user.Bmr = TrainingMath.Bmr(user.WeightKg, user.HeightCm, user.Age, user.Sex);

            await _userRepository.UpdateUserAsync(user, cancellationToken);
            return ToDto(user);
        }

        public static UserProfileDto ToDto(User user) => new(
            user.Id,
            user.Email,
            user.Name,
            user.Age,
            user.WeightKg,
            user.HeightCm,
            user.Bmr,
            user.Sex,
            user.ActivityFactor,
            user.CalorieGoal,
            user.ProteinGoalG,
            user.CarbsGoalG,
            user.FatGoalG,
            user.WeightGoalKg,
            user.WeightUnit,
            user.DefaultRestSeconds,
            GoalCalculator.Tdee(user),
            GoalCalculator.Resolve(user));
    }
}
