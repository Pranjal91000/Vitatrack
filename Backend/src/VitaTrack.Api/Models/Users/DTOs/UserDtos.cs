namespace VitaTrack.Api.Users.DTOs;

/// <summary>Daily targets actually in effect (explicit goals, or values derived from BMR / body weight).</summary>
public record NutritionGoalsDto(int Calories, int ProteinG, int CarbsG, int FatG, bool IsCustom);

public record UserProfileDto(
    long Id,
    string Email,
    string Name,
    int? Age,
    decimal? WeightKg,
    decimal? HeightCm,
    decimal? Bmr,
    string? Sex,
    decimal? ActivityFactor,
    int? CalorieGoal,
    int? ProteinGoalG,
    int? CarbsGoalG,
    int? FatGoalG,
    decimal? WeightGoalKg,
    string WeightUnit,
    int DefaultRestSeconds,
    int? Tdee,
    NutritionGoalsDto EffectiveGoals);
