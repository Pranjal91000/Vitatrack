using VitaTrack.Core.Common;

namespace VitaTrack.Core.Entities;

/// <summary>Breakfast / Lunch / ... UserId == null means a built-in slot.</summary>
public class MealSlot : BaseEntity<long>
{
    public new long? UserId { get; set; }
    public string Name { get; set; } = null!;
    public int SortOrder { get; set; }
    public ICollection<Meal> Meals { get; set; } = new List<Meal>();

    public new User? User { get; set; }
}
