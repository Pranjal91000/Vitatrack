using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class MealEntityConfiguration : IEntityTypeConfiguration<Meal>
    {
        public void Configure(EntityTypeBuilder<Meal> builder)
        {
            builder.ToTable("meal");
            builder.HasKey(x => x.Id).HasName("pk_meal");

            builder.HasIndex(x => new { x.UserId, x.Date }).HasDatabaseName("ix_meal_user_id_date");

            builder.HasOne(x => x.User)
                .WithMany(u => u.Meals)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk-meal-user-user_id");

            builder.HasOne(x => x.MealSlot)
                .WithMany(s => s.Meals)
                .HasForeignKey(x => x.MealSlotId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk-meal-meal_slot-meal_slot_id");
        }
    }
}
