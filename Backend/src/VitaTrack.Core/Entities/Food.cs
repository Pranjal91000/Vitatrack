using System.Text.Json;
using VitaTrack.Core.Common;

namespace VitaTrack.Core.Entities;

public class Food : BaseEntity<long>
{
    public string Name { get; set; } = null!;
    public decimal ServingSize { get; set; }
    public string Unit { get; set; } = "g";
    public int Calories { get; set; }
    public decimal ProteinG { get; set; }
    public decimal CarbsG { get; set; }
    public decimal FatG { get; set; }
    public decimal FiberG { get; set; }
    public decimal SugarG { get; set; }
    public decimal SodiumMg { get; set; }
    public JsonDocument? AdditionalNutrients { get; set; }
}
