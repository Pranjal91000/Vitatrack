using VitaTrack.Core.Common;

namespace VitaTrack.Core.Entities;

public class Meal : BaseEntity<long>, IAggregateRoot
{
    public long MealSlotId { get; set; }
    public DateOnly Date { get; set; }
    public string? Notes { get; set; }

    public MealSlot MealSlot { get; set; } = null!;
    public ICollection<MealFood> MealFoods { get; set; } = new List<MealFood>();
}
