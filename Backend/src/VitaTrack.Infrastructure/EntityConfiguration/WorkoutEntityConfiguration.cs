using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class WorkoutEntityConfiguration : IEntityTypeConfiguration<Workout>
    {
        public void Configure(EntityTypeBuilder<Workout> builder)
        {
            builder.ToTable("workout");
            builder.HasKey(x => x.Id).HasName("pk_workout");

            builder.HasIndex(x => new { x.UserId, x.Date }).HasDatabaseName("ix_workout_user_id_date");

            builder.HasOne(x => x.User)
                .WithMany(u => u.Workouts)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk-workout-user-user_id");
        }
    }
}
