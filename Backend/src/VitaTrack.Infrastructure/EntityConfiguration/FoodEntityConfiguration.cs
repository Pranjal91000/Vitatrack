using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class FoodEntityConfiguration : IEntityTypeConfiguration<Food>
    {
        public void Configure(EntityTypeBuilder<Food> builder)
        {
            builder.ToTable("food");
            builder.HasKey(x => x.Id).HasName("pk_food");

            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);

            builder.Property(x => x.ServingSize).HasPrecision(10, 2);
            builder.Property(x => x.ProteinG).HasPrecision(10, 2);
            builder.Property(x => x.CarbsG).HasPrecision(10, 2);
            builder.Property(x => x.FatG).HasPrecision(10, 2);

            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk-food-user-user_id");
        }
    }
}
