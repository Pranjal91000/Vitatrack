using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class MealSlotEntityConfiguration : IEntityTypeConfiguration<MealSlot>
    {
        public void Configure(EntityTypeBuilder<MealSlot> builder)
        {
            builder.ToTable("meal_slot");
            builder.HasKey(x => x.Id).HasName("pk_meal_slot");

            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

            builder.HasOne(x => x.User)
                .WithMany(u => u.MealSlots)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk-meal_slot-user-user_id");
        }
    }
}
