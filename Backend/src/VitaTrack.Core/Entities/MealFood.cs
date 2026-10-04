using VitaTrack.Core.Common;

namespace VitaTrack.Core.Entities;

public class MealFood : BaseEntity<long>
{
    public long MealId { get; set; }
    public long FoodId { get; set; }
    public decimal Quantity { get; set; } // e.g. 2.5 servings

    public Meal Meal { get; set; } = null!;
    public Food Food { get; set; } = null!;
}
