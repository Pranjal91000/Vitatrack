using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;
using VitaTrack.Core.Enums;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class SetEntityConfiguration : IEntityTypeConfiguration<Set>
    {
        public void Configure(EntityTypeBuilder<Set> builder)
        {
            builder.ToTable("set");
            builder.HasKey(x => x.Id).HasName("pk_set");

            builder.Property(x => x.WeightKg).HasPrecision(10, 2);
            builder.Property(x => x.Rpe).HasPrecision(4, 2);
            builder.Property(x => x.DistanceKm).HasPrecision(10, 2);
            builder.Property(x => x.ElevationGainM).HasPrecision(10, 2);
            builder.Property(x => x.PaceMinPerKm).HasPrecision(10, 2);

            builder.Property(x => x.SetType)
                .HasConversion<short>()
                .HasDefaultValue(SetType.Normal);
            builder.Property(x => x.IsCompleted).HasDefaultValue(true);

            builder.HasOne(x => x.WorkoutExercise)
                .WithMany(we => we.Sets)
                .HasForeignKey(x => x.WorkoutExerciseId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk-set-workout_exercise-workout_exercise_id");
        }
    }
}
