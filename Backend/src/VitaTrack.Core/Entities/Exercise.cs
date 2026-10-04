using VitaTrack.Core.Common;
using VitaTrack.Core.Enums;


namespace VitaTrack.Core.Entities;

public class Exercise : BaseEntity<long>
{
    public long? UserId { get; set; }
    public string Name { get; set; } = null!;
    public short Type { get; set; }
    public string[] MuscleGroups { get; set; } = Array.Empty<string>();
    public string? Equipment { get; set; }
    public MeasurementType MeasurementType { get; set; }
    public bool IsDefault { get; set; }

    public Guid? DemoMediaId { get; set; }
    public string? DemoMediaFileName { get; set; }
    public string? DemoMediaContentType { get; set; }

    public User? User { get; set; }
}
