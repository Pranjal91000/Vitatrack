using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class UserEntityConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("users");
            builder.HasKey(x => x.Id).HasName("pk_user");

            builder.Property(x => x.Email).IsRequired().HasMaxLength(256);
            builder.HasIndex(x => x.Email).IsUnique().HasDatabaseName("ix_user_email");

            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
            builder.Property(x => x.PasswordHash).IsRequired();
            builder.Property(x => x.Role).IsRequired().HasMaxLength(50);

            builder.Property(x => x.Sex).HasMaxLength(10);
            builder.Property(x => x.ActivityFactor).HasPrecision(4, 3);
            builder.Property(x => x.WeightGoalKg).HasPrecision(6, 2);
            builder.Property(x => x.WeightUnit).IsRequired().HasMaxLength(5).HasDefaultValue("kg");
            builder.Property(x => x.DefaultRestSeconds).HasDefaultValue(90);
        }
    }
}
