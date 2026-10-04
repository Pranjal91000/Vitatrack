using System.Reflection;
using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Common;
using VitaTrack.Core.Entities;
using VitaTrack.Core.Entities.GlobalData;

namespace VitaTrack.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options, IJwtHelperService jwtHelperService) : DbContext(options)
{
    private readonly IJwtHelperService _jwtHelperService = jwtHelperService;

    public DbSet<User> Users => Set<User>();
    public DbSet<Food> Foods => Set<Food>();
    public DbSet<MealSlot> MealSlots => Set<MealSlot>();
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<MealFood> MealFoods => Set<MealFood>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<Set> Sets => Set<Set>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<WeightTracker> WeightTrackers => Set<WeightTracker>();

    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<ExerciseType> ExeciseTypes => Set<ExerciseType>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity<long>>())
        {
            switch (entry.State)
            {
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.UserId = _jwtHelperService.GetUserId();
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Global Query Filters (Soft Delete & User Multitenancy)
        builder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<RefreshToken>().HasQueryFilter(e => !e.IsDeleted && e.UserId == _jwtHelperService.GetUserId());

        // System defaults (UserId == null) + User-specific items
        builder.Entity<Food>().HasQueryFilter(e => !e.IsDeleted && (e.UserId == null || e.UserId == _jwtHelperService.GetUserId()));
        builder.Entity<Exercise>().HasQueryFilter(e => !e.IsDeleted && (e.UserId == null || e.UserId == _jwtHelperService.GetUserId()));
        builder.Entity<MealSlot>().HasQueryFilter(e => !e.IsDeleted && (e.UserId == null || e.UserId == _jwtHelperService.GetUserId()));

        // User-owned domain entities
        builder.Entity<Meal>().HasQueryFilter(e => !e.IsDeleted && e.UserId == _jwtHelperService.GetUserId());
        builder.Entity<Workout>().HasQueryFilter(e => !e.IsDeleted && e.UserId == _jwtHelperService.GetUserId());
        builder.Entity<WeightTracker>().HasQueryFilter(e => !e.IsDeleted && e.UserId == _jwtHelperService.GetUserId());
        builder.Entity<MealFood>().HasQueryFilter(e => !e.IsDeleted && e.UserId == _jwtHelperService.GetUserId());
        builder.Entity<WorkoutExercise>().HasQueryFilter(e => !e.IsDeleted && e.UserId == _jwtHelperService.GetUserId());
        builder.Entity<Set>().HasQueryFilter(e => !e.IsDeleted && e.UserId == _jwtHelperService.GetUserId());
    }
}
