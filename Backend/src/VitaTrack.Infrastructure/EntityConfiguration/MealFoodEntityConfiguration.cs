using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class MealFoodEntityConfiguration : IEntityTypeConfiguration<MealFood>
    {
        public void Configure(EntityTypeBuilder<MealFood> builder)
        {
            builder.ToTable("meal_food");
            builder.HasKey(x => x.Id).HasName("pk_meal_food");

            builder.Property(x => x.Quantity).HasPrecision(10, 2);

            builder.HasOne(x => x.Meal)
                .WithMany(m => m.MealFoods)
                .HasForeignKey(x => x.MealId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk-meal_food-meal-meal_id");

            builder.HasOne(x => x.Food)
                .WithMany()
                .HasForeignKey(x => x.FoodId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk-meal_food-food-food_id");
        }
    }
}
