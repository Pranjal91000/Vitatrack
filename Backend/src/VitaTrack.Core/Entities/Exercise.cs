using VitaTrack.Core.Common;
using VitaTrack.Core.Enums;

namespace VitaTrack.Core.Entities;

/// <summary>
/// Exercise library entry. UserId == null means a built-in (seeded) exercise visible to everyone.
/// </summary>
public class Exercise : BaseEntity<long>
{
    public new long? UserId { get; set; }
    public string Name { get; set; } = null!;
    public short Type { get; set; }
    public string[] MuscleGroups { get; set; } = Array.Empty<string>();
    public string? Equipment { get; set; }
    public MeasurementType MeasurementType { get; set; }
    public bool IsDefault { get; set; }

    public Guid? DemoMediaId { get; set; }
    public string? DemoMediaFileName { get; set; }
    public string? DemoMediaContentType { get; set; }

    public new User? User { get; set; }
}
