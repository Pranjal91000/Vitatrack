using System.Text.Json.Serialization;
using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Common;

public abstract class BaseEntity<TId>
{
    public TId Id { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public long UserId { get; set; }
    public bool IsDeleted { get; set; }

    [JsonIgnore]
    public User User { get; set; } = null!; 
}

public interface IAggregateRoot { }
