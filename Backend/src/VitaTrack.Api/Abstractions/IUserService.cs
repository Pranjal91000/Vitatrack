using VitaTrack.Api.Users.DTOs;

namespace VitaTrack.Api.Abstractions
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(CancellationToken cancellationToken = default);
        Task<UserProfileDto?> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken = default);
    }
}
