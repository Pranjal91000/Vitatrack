using VitaTrack.Core.Enums;

namespace VitaTrack.Api.Workouts.DTOs;

public record ExerciseDto(long Id, string Name, short Type, string[] MuscleGroups, MeasurementType MeasurementType, bool IsDefault, string? DemoMediaUrl);

public record SetDto(
    int SetNumber,
    int? Reps,
    decimal? WeightKg,
    int? DurationSeconds,
    decimal? Rpe,
    decimal? OneRepMax,
    decimal? DistanceKm = null,
    decimal? ElevationGainM = null,
    decimal? PaceMinPerKm = null,
    decimal? Pace = null);


public record WorkoutExerciseDto(long ExerciseId, string ExerciseName, int Order, List<SetDto> Sets);

public record WorkoutDto(long Id, string? Name, DateOnly Date, int? DurationMinutes, List<WorkoutExerciseDto> Exercises, decimal Volume, string? RecurrencePattern = null, bool IsTemplate = false);

public record DailyWorkoutsDto(List<WorkoutDto> Workouts);

/// <summary>One calendar day in the workout activity heatmap (non-template sessions only).</summary>
public record WorkoutHeatmapDayDto(string Date, int Count);

public record ExerciseDailySummaryDto(DateOnly Date, decimal TotalVolume, decimal MaxWeight, decimal TotalDistanceKm, decimal AveragePaceMinPerKm, int TotalDurationSeconds, int TotalReps);

public record ExerciseMonthlyReportDto(long ExerciseId, string ExerciseName, List<ExerciseDailySummaryDto> DailySummaries);
