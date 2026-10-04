using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VitaTrack.Core.Entities;

namespace VitaTrack.Infrastructure.EntityConfiguration
{
    public class WorkoutExerciseEntityConfiguration : IEntityTypeConfiguration<WorkoutExercise>
    {
        public void Configure(EntityTypeBuilder<WorkoutExercise> builder)
        {
            builder.ToTable("workout_exercise");
            builder.HasKey(x => x.Id).HasName("pk_workout_exercise");

            builder.HasOne(x => x.Workout)
                .WithMany(w => w.Exercises)
                .HasForeignKey(x => x.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk-workout_exercise-workout-workout_id");

            builder.HasOne(x => x.Exercise)
                .WithMany()
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk-workout_exercise-exercise-exercise_id");
        }
    }
}
