namespace VitaTrack.Api.Users.DTOs;

public record UserProfileDto(long Id, string Email, string Name, int? Age, decimal? WeightKg, decimal? HeightCm, decimal? Bmr);
