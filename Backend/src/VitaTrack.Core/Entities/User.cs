namespace VitaTrack.Core.Entities;

public class User
{
    public long Id { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int? Age { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? Bmr { get; set; }
    public string Role { get; set; } = "User";

    // Body & goals
    /// <summary>"male" | "female" — used for the Mifflin-St Jeor BMR equation.</summary>
    public string? Sex { get; set; }
    public decimal? ActivityFactor { get; set; }
    public int? CalorieGoal { get; set; }
    public int? ProteinGoalG { get; set; }
    public int? CarbsGoalG { get; set; }
    public int? FatGoalG { get; set; }
    public decimal? WeightGoalKg { get; set; }

    // Preferences
    /// <summary>"kg" | "lb" — display unit only; all weights are stored in kg.</summary>
    public string WeightUnit { get; set; } = "kg";
    public int DefaultRestSeconds { get; set; } = 90;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Meal> Meals { get; set; } = new List<Meal>();
    public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
    public ICollection<MealSlot> MealSlots { get; set; } = new List<MealSlot>();
}
