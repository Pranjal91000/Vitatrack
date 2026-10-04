using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class WeightTrackerEntityConfiguration : IEntityTypeConfiguration<WeightTracker>
    {
        public void Configure(EntityTypeBuilder<WeightTracker> builder)
        {
            builder.ToTable("weight_tracker");
            builder.HasKey(x => x.Id).HasName("pk_weight_tracker");
            builder.Property(x => x.DateRecordedOn).IsRequired();
            builder.Property(x => x.Weight).IsRequired().HasPrecision(5, 2);


            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk-weight_tracker-user-user_id");
        }
    }
}
