using VitaTrack.Core.Enums;

namespace VitaTrack.Api.Workouts.DTOs;

public record ExerciseDto(
    long Id,
    string Name,
    short Type,
    string[] MuscleGroups,
    string? Equipment,
    MeasurementType MeasurementType,
    bool IsDefault,
    bool IsCustom,
    string? DemoMediaUrl);

public record SetDto(
    long Id,
    int SetNumber,
    int? Reps,
    decimal? WeightKg,
    int? DurationSeconds,
    decimal? Rpe,
    decimal? OneRepMax,
    decimal? DistanceKm,
    decimal? ElevationGainM,
    decimal? PaceMinPerKm,
    decimal? Pace,
    SetType SetType,
    bool IsCompleted);

public record WorkoutExerciseDto(
    long Id,
    long ExerciseId,
    string ExerciseName,
    string[] MuscleGroups,
    string? Equipment,
    MeasurementType MeasurementType,
    int Order,
    string? Notes,
    int? RestSeconds,
    List<SetDto> Sets);

/// <param name="Kind">"weight" (heaviest set), "oneRepMax" (best estimated 1RM), "volume" (best single-set volume) or "reps".</param>
public record PersonalRecordDto(long ExerciseId, string ExerciseName, string Kind, decimal Value, decimal? Previous);

public record WorkoutDto(
    long Id,
    string? Name,
    DateOnly Date,
    int? DurationMinutes,
    string? Notes,
    DateTime? StartedAt,
    DateTime? EndedAt,
    List<WorkoutExerciseDto> Exercises,
    decimal Volume,
    int TotalSets,
    int TotalReps,
    bool IsTemplate,
    List<PersonalRecordDto> Records);

public record DailyWorkoutsDto(List<WorkoutDto> Workouts);

public record WorkoutSummaryExerciseDto(long ExerciseId, string ExerciseName, int SetCount, decimal? BestWeightKg, int? BestReps, MeasurementType MeasurementType);

public record WorkoutSummaryDto(
    long Id,
    string? Name,
    DateOnly Date,
    DateTime? StartedAt,
    int? DurationMinutes,
    decimal Volume,
    int TotalSets,
    List<WorkoutSummaryExerciseDto> Exercises);

/// <summary>One calendar day in the workout activity heatmap (non-template sessions only).</summary>
public record WorkoutHeatmapDayDto(string Date, int Count);

// Exercise performance
public record ExerciseSessionDto(long WorkoutId, string? WorkoutName, DateOnly Date, List<SetDto> Sets, decimal Volume, decimal? BestOneRepMax, decimal? MaxWeightKg);

public record ExerciseDetailDto(
    ExerciseDto Exercise,
    int SessionCount,
    decimal? BestOneRepMax,
    decimal? MaxWeightKg,
    decimal? BestSetVolume,
    int? MaxReps,
    List<ExerciseSessionDto> Sessions);

public record LastPerformanceDto(long ExerciseId, DateOnly Date, List<SetDto> Sets);

public record ExerciseDailySummaryDto(DateOnly Date, decimal TotalVolume, decimal MaxWeight, decimal TotalDistanceKm, decimal AveragePaceMinPerKm, int TotalDurationSeconds, int TotalReps);

public record ExerciseMonthlyReportDto(long ExerciseId, string ExerciseName, List<ExerciseDailySummaryDto> DailySummaries);
