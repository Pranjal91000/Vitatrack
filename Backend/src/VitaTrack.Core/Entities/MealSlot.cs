using VitaTrack.Core.Common;

namespace VitaTrack.Core.Entities;

public class MealSlot : BaseEntity<long>
{
    public string Name { get; set; } = null!;
    public int SortOrder { get; set; }
    public ICollection<Meal> Meals { get; set; } = new List<Meal>();
}
