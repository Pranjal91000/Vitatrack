using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VitaTrack.Core.Entities;
using VitaTrack.Core.Enums;

namespace VitaTrack.Infrastructure.Data;

/// <summary>
/// Seeds the built-in (UserId == null) meal slots, exercise library and food database.
/// Each block is idempotent: it only inserts names that don't exist yet, so adding new
/// entries to the lists below and restarting the API is enough to roll them out.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, ILogger logger, CancellationToken ct = default)
    {
        await SeedMealSlotsAsync(db, ct);
        await SeedExercisesAsync(db, ct);
        await SeedFoodsAsync(db, ct);
        await SeedDemoUserAsync(db, logger, ct);
        logger.LogInformation("Seed data verified");
    }

    private static async Task SeedMealSlotsAsync(AppDbContext db, CancellationToken ct)
    {
        var existing = await db.MealSlots.IgnoreQueryFilters()
            .Where(s => s.UserId == null && !s.IsDeleted)
            .Select(s => s.Name)
            .ToListAsync(ct);

        var slots = new[] { "Breakfast", "Lunch", "Snacks", "Dinner" };
        var order = 1;
        foreach (var name in slots)
        {
            if (!existing.Contains(name, StringComparer.OrdinalIgnoreCase))
                db.MealSlots.Add(new MealSlot { Name = name, SortOrder = order, UserId = null });
            order++;
        }
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedExercisesAsync(AppDbContext db, CancellationToken ct)
    {
        var existing = await db.Exercises.IgnoreQueryFilters()
            .Where(e => e.UserId == null && !e.IsDeleted)
            .Select(e => e.Name)
            .ToListAsync(ct);
        var set = new HashSet<string>(existing, StringComparer.OrdinalIgnoreCase);

        foreach (var (name, muscles, equipment, type, measurement) in Exercises)
        {
            if (set.Contains(name)) continue;
            db.Exercises.Add(new Exercise
            {
                UserId = null,
                Name = name,
                MuscleGroups = muscles,
                Equipment = equipment,
                Type = (short)type,
                MeasurementType = measurement,
                IsDefault = true
            });
        }
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedFoodsAsync(AppDbContext db, CancellationToken ct)
    {
        var existing = await db.Foods.IgnoreQueryFilters()
            .Where(f => f.UserId == null && !f.IsDeleted)
            .Select(f => f.Name)
            .ToListAsync(ct);
        var set = new HashSet<string>(existing, StringComparer.OrdinalIgnoreCase);

        foreach (var (name, serving, unit, kcal, p, c, f) in Foods)
        {
            if (set.Contains(name)) continue;
            db.Foods.Add(new Food
            {
                UserId = null,
                Name = name,
                ServingSize = serving,
                Unit = unit,
                Calories = kcal,
                ProteinG = p,
                CarbsG = c,
                FatG = f
            });
        }
        await db.SaveChangesAsync(ct);
    }

    private const ExerciseType S = ExerciseType.Strength;
    private const ExerciseType C = ExerciseType.Cardio;
    private const ExerciseType M = ExerciseType.Mobility;
    private const MeasurementType WR = MeasurementType.WeightReps;
    private const MeasurementType BW = MeasurementType.BodyweightReps;
    private const MeasurementType TD = MeasurementType.TimeDistance;
    private const MeasurementType TH = MeasurementType.TimedHold;

    private static readonly (string Name, string[] Muscles, string Equipment, ExerciseType Type, MeasurementType Measure)[] Exercises =
    {
        // Chest
        ("Bench Press (Barbell)", new[] { "Chest", "Triceps", "Shoulders" }, "Barbell", S, WR),
        ("Incline Bench Press (Barbell)", new[] { "Chest", "Shoulders", "Triceps" }, "Barbell", S, WR),
        ("Decline Bench Press (Barbell)", new[] { "Chest", "Triceps" }, "Barbell", S, WR),
        ("Bench Press (Dumbbell)", new[] { "Chest", "Triceps", "Shoulders" }, "Dumbbell", S, WR),
        ("Incline Bench Press (Dumbbell)", new[] { "Chest", "Shoulders" }, "Dumbbell", S, WR),
        ("Chest Fly (Dumbbell)", new[] { "Chest" }, "Dumbbell", S, WR),
        ("Cable Crossover", new[] { "Chest" }, "Cable", S, WR),
        ("Chest Press (Machine)", new[] { "Chest", "Triceps" }, "Machine", S, WR),
        ("Pec Deck (Machine)", new[] { "Chest" }, "Machine", S, WR),
        ("Push Up", new[] { "Chest", "Triceps", "Core" }, "Bodyweight", S, BW),
        ("Chest Dip", new[] { "Chest", "Triceps" }, "Bodyweight", S, BW),

        // Back
        ("Deadlift (Barbell)", new[] { "Back", "Hamstrings", "Glutes" }, "Barbell", S, WR),
        ("Bent Over Row (Barbell)", new[] { "Back", "Biceps" }, "Barbell", S, WR),
        ("T-Bar Row", new[] { "Back", "Biceps" }, "Barbell", S, WR),
        ("Single Arm Row (Dumbbell)", new[] { "Back", "Biceps" }, "Dumbbell", S, WR),
        ("Lat Pulldown (Cable)", new[] { "Back", "Biceps" }, "Cable", S, WR),
        ("Seated Cable Row", new[] { "Back", "Biceps" }, "Cable", S, WR),
        ("Straight Arm Pulldown", new[] { "Back" }, "Cable", S, WR),
        ("Pull Up", new[] { "Back", "Biceps" }, "Bodyweight", S, BW),
        ("Chin Up", new[] { "Back", "Biceps" }, "Bodyweight", S, BW),
        ("Assisted Pull Up (Machine)", new[] { "Back", "Biceps" }, "Machine", S, WR),
        ("Back Extension", new[] { "Back", "Glutes" }, "Bodyweight", S, BW),
        ("Shrug (Dumbbell)", new[] { "Back" }, "Dumbbell", S, WR),

        // Shoulders
        ("Overhead Press (Barbell)", new[] { "Shoulders", "Triceps" }, "Barbell", S, WR),
        ("Shoulder Press (Dumbbell)", new[] { "Shoulders", "Triceps" }, "Dumbbell", S, WR),
        ("Arnold Press (Dumbbell)", new[] { "Shoulders" }, "Dumbbell", S, WR),
        ("Lateral Raise (Dumbbell)", new[] { "Shoulders" }, "Dumbbell", S, WR),
        ("Lateral Raise (Cable)", new[] { "Shoulders" }, "Cable", S, WR),
        ("Front Raise (Dumbbell)", new[] { "Shoulders" }, "Dumbbell", S, WR),
        ("Rear Delt Fly (Dumbbell)", new[] { "Shoulders", "Back" }, "Dumbbell", S, WR),
        ("Face Pull (Cable)", new[] { "Shoulders", "Back" }, "Cable", S, WR),
        ("Shoulder Press (Machine)", new[] { "Shoulders", "Triceps" }, "Machine", S, WR),
        ("Upright Row (Barbell)", new[] { "Shoulders", "Back" }, "Barbell", S, WR),

        // Arms
        ("Bicep Curl (Barbell)", new[] { "Biceps" }, "Barbell", S, WR),
        ("Bicep Curl (Dumbbell)", new[] { "Biceps" }, "Dumbbell", S, WR),
        ("Hammer Curl (Dumbbell)", new[] { "Biceps", "Forearms" }, "Dumbbell", S, WR),
        ("Preacher Curl (EZ Bar)", new[] { "Biceps" }, "EZ bar", S, WR),
        ("Bicep Curl (Cable)", new[] { "Biceps" }, "Cable", S, WR),
        ("Incline Curl (Dumbbell)", new[] { "Biceps" }, "Dumbbell", S, WR),
        ("Triceps Pushdown (Cable)", new[] { "Triceps" }, "Cable", S, WR),
        ("Overhead Triceps Extension (Cable)", new[] { "Triceps" }, "Cable", S, WR),
        ("Skull Crusher (EZ Bar)", new[] { "Triceps" }, "EZ bar", S, WR),
        ("Close Grip Bench Press", new[] { "Triceps", "Chest" }, "Barbell", S, WR),
        ("Triceps Dip", new[] { "Triceps", "Chest" }, "Bodyweight", S, BW),
        ("Wrist Curl (Dumbbell)", new[] { "Forearms" }, "Dumbbell", S, WR),

        // Legs
        ("Squat (Barbell)", new[] { "Quads", "Glutes", "Hamstrings" }, "Barbell", S, WR),
        ("Front Squat (Barbell)", new[] { "Quads", "Glutes", "Core" }, "Barbell", S, WR),
        ("Goblet Squat (Dumbbell)", new[] { "Quads", "Glutes" }, "Dumbbell", S, WR),
        ("Hack Squat (Machine)", new[] { "Quads", "Glutes" }, "Machine", S, WR),
        ("Leg Press (Machine)", new[] { "Quads", "Glutes" }, "Machine", S, WR),
        ("Leg Extension (Machine)", new[] { "Quads" }, "Machine", S, WR),
        ("Romanian Deadlift (Barbell)", new[] { "Hamstrings", "Glutes", "Back" }, "Barbell", S, WR),
        ("Romanian Deadlift (Dumbbell)", new[] { "Hamstrings", "Glutes" }, "Dumbbell", S, WR),
        ("Lying Leg Curl (Machine)", new[] { "Hamstrings" }, "Machine", S, WR),
        ("Seated Leg Curl (Machine)", new[] { "Hamstrings" }, "Machine", S, WR),
        ("Bulgarian Split Squat (Dumbbell)", new[] { "Quads", "Glutes" }, "Dumbbell", S, WR),
        ("Walking Lunge (Dumbbell)", new[] { "Quads", "Glutes" }, "Dumbbell", S, WR),
        ("Hip Thrust (Barbell)", new[] { "Glutes", "Hamstrings" }, "Barbell", S, WR),
        ("Hip Abduction (Machine)", new[] { "Glutes" }, "Machine", S, WR),
        ("Standing Calf Raise (Machine)", new[] { "Calves" }, "Machine", S, WR),
        ("Seated Calf Raise (Machine)", new[] { "Calves" }, "Machine", S, WR),
        ("Kettlebell Swing", new[] { "Glutes", "Hamstrings", "Full body" }, "Kettlebell", S, WR),

        // Core
        ("Plank", new[] { "Core" }, "Bodyweight", S, TH),
        ("Side Plank", new[] { "Core" }, "Bodyweight", S, TH),
        ("Crunch", new[] { "Core" }, "Bodyweight", S, BW),
        ("Hanging Leg Raise", new[] { "Core" }, "Bodyweight", S, BW),
        ("Cable Crunch", new[] { "Core" }, "Cable", S, WR),
        ("Russian Twist", new[] { "Core" }, "Bodyweight", S, BW),
        ("Ab Wheel Rollout", new[] { "Core" }, "Bodyweight", S, BW),

        // Cardio & conditioning
        ("Treadmill Run", new[] { "Cardio" }, "Cardio machine", C, TD),
        ("Treadmill Walk (Incline)", new[] { "Cardio" }, "Cardio machine", C, TD),
        ("Stationary Bike", new[] { "Cardio" }, "Cardio machine", C, TD),
        ("Rowing Machine", new[] { "Cardio", "Back" }, "Cardio machine", C, TD),
        ("Elliptical", new[] { "Cardio" }, "Cardio machine", C, TD),
        ("Stair Climber", new[] { "Cardio", "Glutes" }, "Cardio machine", C, TD),
        ("Outdoor Run", new[] { "Cardio" }, "None", C, TD),
        ("Jump Rope", new[] { "Cardio", "Calves" }, "None", C, TH),
        ("Burpee", new[] { "Full body", "Cardio" }, "Bodyweight", C, BW),

        // Mobility
        ("Dead Hang", new[] { "Forearms", "Back" }, "Bodyweight", M, TH),
        ("Hip Flexor Stretch", new[] { "Glutes" }, "None", M, TH),
    };

    // name, serving size, unit, kcal, protein g, carbs g, fat g — values per serving (USDA / label averages)
    private static readonly (string Name, decimal Serving, string Unit, int Kcal, decimal P, decimal C, decimal F)[] Foods =
    {
        // Protein
        ("Egg, whole (large)", 50m, "g", 72, 6.3m, 0.4m, 4.8m),
        ("Egg white (large)", 33m, "g", 17, 3.6m, 0.2m, 0.1m),
        ("Chicken breast, cooked", 100m, "g", 165, 31m, 0m, 3.6m),
        ("Chicken thigh, cooked, skinless", 100m, "g", 209, 26m, 0m, 10.9m),
        ("Salmon, cooked", 100m, "g", 206, 22m, 0m, 12.4m),
        ("Tuna, canned in water", 100m, "g", 116, 25.5m, 0m, 0.8m),
        ("Shrimp, cooked", 100m, "g", 99, 24m, 0.2m, 0.3m),
        ("Ground beef 90% lean, cooked", 100m, "g", 217, 26.1m, 0m, 11.7m),
        ("Paneer", 100m, "g", 265, 18.3m, 1.2m, 20.8m),
        ("Tofu, firm", 100m, "g", 144, 17.3m, 2.8m, 8.7m),
        ("Soya chunks, dry", 50m, "g", 173, 26m, 16.5m, 0.3m),
        ("Whey protein (1 scoop)", 30m, "g", 120, 24m, 3m, 1.5m),
        ("Greek yogurt, plain, non-fat", 170m, "g", 100, 17.3m, 6.1m, 0.7m),
        ("Cottage cheese, 2%", 113m, "g", 92, 11.9m, 5.4m, 2.6m),

        // Dairy
        ("Milk, whole", 250m, "ml", 153, 8m, 12m, 8.3m),
        ("Milk, toned", 250m, "ml", 145, 7.8m, 11.8m, 7.5m),
        ("Curd / plain yogurt", 100m, "g", 61, 3.5m, 4.7m, 3.3m),
        ("Cheddar cheese", 28m, "g", 115, 6.5m, 0.4m, 9.5m),
        ("Butter", 10m, "g", 72, 0.1m, 0m, 8.1m),
        ("Ghee (1 tbsp)", 14m, "g", 126, 0m, 0m, 14m),

        // Grains & staples
        ("White rice, cooked", 100m, "g", 130, 2.7m, 28m, 0.3m),
        ("Brown rice, cooked", 100m, "g", 123, 2.7m, 25.6m, 1m),
        ("Rolled oats, dry", 40m, "g", 152, 5.3m, 27.1m, 2.6m),
        ("Roti / chapati (medium)", 40m, "g", 120, 3.6m, 18.5m, 3.3m),
        ("Whole wheat bread (slice)", 32m, "g", 80, 4m, 13.8m, 1.1m),
        ("White bread (slice)", 25m, "g", 67, 1.9m, 12.7m, 0.8m),
        ("Pasta, cooked", 100m, "g", 158, 5.8m, 30.9m, 0.9m),
        ("Quinoa, cooked", 100m, "g", 120, 4.4m, 21.3m, 1.9m),
        ("Flour tortilla (medium)", 45m, "g", 138, 3.7m, 22.6m, 3.6m),
        ("Corn flakes", 30m, "g", 113, 2.1m, 25.5m, 0.2m),
        ("Potato, boiled", 100m, "g", 87, 1.9m, 20.1m, 0.1m),
        ("Sweet potato, baked", 100m, "g", 90, 2m, 20.7m, 0.2m),

        // Legumes
        ("Dal / lentils, cooked (bowl)", 150m, "g", 174, 13.5m, 30.2m, 0.6m),
        ("Chickpeas (chana), cooked", 100m, "g", 164, 8.9m, 27.4m, 2.6m),
        ("Kidney beans (rajma), cooked", 100m, "g", 127, 8.7m, 22.8m, 0.5m),
        ("Hummus (2 tbsp)", 30m, "g", 50, 2.4m, 4.3m, 2.9m),

        // Fruit
        ("Banana (medium)", 118m, "g", 105, 1.3m, 27m, 0.4m),
        ("Apple (medium)", 182m, "g", 95, 0.5m, 25m, 0.3m),
        ("Orange (medium)", 131m, "g", 62, 1.2m, 15.4m, 0.2m),
        ("Mango", 100m, "g", 60, 0.8m, 15m, 0.4m),
        ("Blueberries", 100m, "g", 57, 0.7m, 14.5m, 0.3m),
        ("Strawberries", 100m, "g", 32, 0.7m, 7.7m, 0.3m),
        ("Dates (medjool)", 24m, "g", 66, 0.4m, 18m, 0m),
        ("Avocado (half)", 100m, "g", 160, 2m, 8.5m, 14.7m),

        // Vegetables
        ("Broccoli", 100m, "g", 34, 2.8m, 6.6m, 0.4m),
        ("Spinach", 100m, "g", 23, 2.9m, 3.6m, 0.4m),
        ("Carrot", 100m, "g", 41, 0.9m, 9.6m, 0.2m),
        ("Cucumber", 100m, "g", 15, 0.7m, 3.6m, 0.1m),
        ("Tomato", 100m, "g", 18, 0.9m, 3.9m, 0.2m),
        ("Onion", 100m, "g", 40, 1.1m, 9.3m, 0.1m),

        // Nuts, fats & extras
        ("Almonds", 28m, "g", 164, 6m, 6.1m, 14.2m),
        ("Peanuts, dry roasted", 28m, "g", 166, 6.7m, 6.1m, 14.1m),
        ("Cashews", 28m, "g", 157, 5.2m, 8.6m, 12.4m),
        ("Peanut butter (2 tbsp)", 32m, "g", 190, 7.1m, 7.1m, 16.4m),
        ("Olive oil (1 tbsp)", 13.5m, "g", 119, 0m, 0m, 13.5m),
        ("Dark chocolate 70%", 20m, "g", 120, 1.6m, 9.2m, 8.5m),
        ("Honey (1 tbsp)", 21m, "g", 64, 0.1m, 17.3m, 0m),
        ("Sugar (1 tsp)", 4m, "g", 16, 0m, 4m, 0m),

        // Drinks
        ("Black coffee", 240m, "ml", 2, 0.3m, 0m, 0m),
        ("Orange juice", 240m, "ml", 112, 1.7m, 25.8m, 0.5m),
        ("Cola", 330m, "ml", 139, 0m, 35m, 0m),
    };

    private static async Task SeedDemoUserAsync(AppDbContext db, ILogger logger, CancellationToken ct)
    {
        var demoUser = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "demo@vitatrack.com", ct);
        if (demoUser == null)
        {
            var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            demoUser = new User
            {
                Email = "demo@vitatrack.com",
                Name = "Alex Morgan",
                Role = "User",
                Age = 28,
                Sex = "male",
                HeightCm = 180,
                WeightKg = 78.5m,
                WeightGoalKg = 75.0m,
                ActivityFactor = 1.55m,
                Bmr = 1780,
                CalorieGoal = 2400,
                ProteinGoalG = 160,
                CarbsGoalG = 260,
                FatGoalG = 70,
                WeightUnit = "kg",
                DefaultRestSeconds = 90,
                CreatedAt = DateTime.UtcNow.AddDays(-60),
                UpdatedAt = DateTime.UtcNow
            };
            demoUser.PasswordHash = hasher.HashPassword(demoUser, "Password123!");
            db.Users.Add(demoUser);
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Demo user created (demo@vitatrack.com / Password123!)");
        }

        var userId = demoUser.Id;
        var today = DateOnly.FromDateTime(DateTime.Today);

        // 1. Weight tracker (30 days of weigh-ins)
        if (!await db.WeightTrackers.IgnoreQueryFilters().AnyAsync(w => w.UserId == userId, ct))
        {
            var startKg = 80.2m;
            var targetKg = 78.5m;
            var startBf = 18.2m;
            var targetBf = 16.5m;
            for (int i = 29; i >= 0; i--)
            {
                var day = today.AddDays(-i);
                var progress = (29 - i) / 29.0m;
                var currentWeight = Math.Round(startKg - (startKg - targetKg) * progress + (decimal)(Math.Sin(i * 1.5) * 0.15), 1);
                var currentBf = Math.Round(startBf - (startBf - targetBf) * progress, 1);
                string? note = i switch
                {
                    29 => "Starting cut after vacation.",
                    20 => "Down over 0.5kg, energy feels high.",
                    14 => "Midway check-in. Macros on point.",
                    7 => "Hit new low this morning!",
                    0 => "Morning weigh-in after solid rest. Feeling lean and energized!",
                    _ => null
                };

                db.WeightTrackers.Add(new WeightTracker
                {
                    UserId = userId,
                    DateRecordedOn = day,
                    Weight = currentWeight,
                    BodyFatPercent = currentBf,
                    Notes = note
                });
            }
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Demo user weight history seeded (30 days)");
        }

        // 2. Routines and Workouts
        if (!await db.Workouts.IgnoreQueryFilters().AnyAsync(w => w.UserId == userId, ct))
        {
            var exMap = await db.Exercises.IgnoreQueryFilters()
                .Where(e => e.UserId == null || e.UserId == userId)
                .ToDictionaryAsync(e => e.Name, e => e.Id, StringComparer.OrdinalIgnoreCase, ct);

            long GetEx(string name) => exMap.TryGetValue(name, out var id) ? id : 0;

            // Template Routines
            var pushRoutine = new Workout
            {
                UserId = userId,
                Name = "Push Day (Chest, Shoulders, Triceps)",
                IsTemplate = true,
                Date = today,
                Notes = "Standard hypertrophy push focus. 90-120s rest on compounds.",
                Exercises = new List<WorkoutExercise>()
            };

            int order = 1;
            void AddRoutineEx(Workout w, string exName, int rest, (decimal kg, int reps)[] sets)
            {
                var exId = GetEx(exName);
                if (exId == 0) return;
                var we = new WorkoutExercise
                {
                    UserId = userId,
                    ExerciseId = exId,
                    Order = order++,
                    RestSeconds = rest,
                    Sets = new List<Set>()
                };
                int sNum = 1;
                foreach (var s in sets)
                {
                    we.Sets.Add(new Set
                    {
                        UserId = userId,
                        SetNumber = sNum++,
                        WeightKg = s.kg,
                        Reps = s.reps,
                        SetType = SetType.Normal,
                        IsCompleted = false
                    });
                }
                w.Exercises.Add(we);
            }

            AddRoutineEx(pushRoutine, "Bench Press (Barbell)", 120, new[] { (80m, 8), (80m, 8), (82.5m, 6) });
            AddRoutineEx(pushRoutine, "Incline Bench Press (Dumbbell)", 90, new[] { (28m, 10), (28m, 10), (30m, 8) });
            AddRoutineEx(pushRoutine, "Overhead Press (Barbell)", 90, new[] { (50m, 8), (50m, 8), (52.5m, 6) });
            AddRoutineEx(pushRoutine, "Lateral Raise (Dumbbell)", 60, new[] { (12m, 12), (12m, 12), (12m, 12), (14m, 10) });
            AddRoutineEx(pushRoutine, "Triceps Pushdown (Cable)", 60, new[] { (30m, 12), (32.5m, 10), (35m, 8) });
            db.Workouts.Add(pushRoutine);

            order = 1;
            var pullRoutine = new Workout
            {
                UserId = userId,
                Name = "Pull Day (Back, Biceps, Rear Delts)",
                IsTemplate = true,
                Date = today,
                Notes = "Heavy pulls and vertical/horizontal row balance.",
                Exercises = new List<WorkoutExercise>()
            };
            AddRoutineEx(pullRoutine, "Deadlift (Barbell)", 150, new[] { (130m, 5), (140m, 5), (145m, 4) });
            AddRoutineEx(pullRoutine, "Lat Pulldown (Cable)", 90, new[] { (65m, 10), (70m, 8), (70m, 8) });
            AddRoutineEx(pullRoutine, "Bent Over Row (Barbell)", 90, new[] { (70m, 8), (70m, 8), (75m, 6) });
            AddRoutineEx(pullRoutine, "Face Pull (Cable)", 60, new[] { (25m, 15), (25m, 15), (27.5m, 12) });
            AddRoutineEx(pullRoutine, "Bicep Curl (Dumbbell)", 60, new[] { (16m, 10), (16m, 10), (18m, 8) });
            db.Workouts.Add(pullRoutine);

            order = 1;
            var legsRoutine = new Workout
            {
                UserId = userId,
                Name = "Leg Day (Quads, Hamstrings, Calves)",
                IsTemplate = true,
                Date = today,
                Notes = "Squat focus with hamstring and quad accessory volume.",
                Exercises = new List<WorkoutExercise>()
            };
            AddRoutineEx(legsRoutine, "Squat (Barbell)", 120, new[] { (100m, 8), (105m, 8), (110m, 6), (115m, 5) });
            AddRoutineEx(legsRoutine, "Romanian Deadlift (Barbell)", 90, new[] { (90m, 10), (95m, 8), (100m, 8) });
            AddRoutineEx(legsRoutine, "Leg Press (Machine)", 90, new[] { (180m, 10), (200m, 10), (210m, 8) });
            AddRoutineEx(legsRoutine, "Leg Extension (Machine)", 60, new[] { (55m, 12), (60m, 12), (65m, 10) });
            AddRoutineEx(legsRoutine, "Standing Calf Raise (Machine)", 60, new[] { (70m, 15), (75m, 15), (80m, 12) });
            db.Workouts.Add(legsRoutine);

            // Logged Completed Workouts
            void AddLoggedWorkout(string name, int daysAgo, int durationMin, (string exName, (decimal kg, int reps)[] sets)[] workoutData, string? notes = null)
            {
                var date = today.AddDays(-daysAgo);
                var startDt = date.ToDateTime(new TimeOnly(9, 15), DateTimeKind.Utc);
                var endDt = startDt.AddMinutes(durationMin);
                var logged = new Workout
                {
                    UserId = userId,
                    Name = name,
                    IsTemplate = false,
                    Date = date,
                    DurationMinutes = durationMin,
                    Notes = notes,
                    StartedAt = startDt,
                    EndedAt = endDt,
                    Exercises = new List<WorkoutExercise>()
                };

                int exOrder = 1;
                foreach (var (eName, sets) in workoutData)
                {
                    var eId = GetEx(eName);
                    if (eId == 0) continue;
                    var we = new WorkoutExercise
                    {
                        UserId = userId,
                        ExerciseId = eId,
                        Order = exOrder++,
                        Sets = new List<Set>()
                    };
                    int sN = 1;
                    foreach (var s in sets)
                    {
                        we.Sets.Add(new Set
                        {
                            UserId = userId,
                            SetNumber = sN++,
                            WeightKg = s.kg,
                            Reps = s.reps,
                            SetType = SetType.Normal,
                            IsCompleted = true
                        });
                    }
                    logged.Exercises.Add(we);
                }
                db.Workouts.Add(logged);
            }

            // Past workouts
            AddLoggedWorkout("Push Day", 0, 55, new[]
            {
                ("Bench Press (Barbell)", new[] { (80m, 8), (82.5m, 8), (85m, 6) }),
                ("Incline Bench Press (Dumbbell)", new[] { (28m, 10), (30m, 9), (30m, 8) }),
                ("Overhead Press (Barbell)", new[] { (50m, 8), (52.5m, 8), (55m, 6) }),
                ("Lateral Raise (Dumbbell)", new[] { (12m, 12), (12m, 12), (14m, 10) }),
                ("Triceps Pushdown (Cable)", new[] { (30m, 12), (32.5m, 10), (35m, 8) }),
            }, "PR on bench press 85kg x 6! Smooth lockouts.");

            AddLoggedWorkout("Pull Day", 1, 52, new[]
            {
                ("Deadlift (Barbell)", new[] { (135m, 5), (140m, 5), (145m, 4) }),
                ("Lat Pulldown (Cable)", new[] { (65m, 10), (70m, 8), (70m, 8) }),
                ("Bent Over Row (Barbell)", new[] { (70m, 8), (72.5m, 8), (75m, 6) }),
                ("Face Pull (Cable)", new[] { (25m, 15), (25m, 15), (27.5m, 12) }),
                ("Bicep Curl (Dumbbell)", new[] { (16m, 10), (16m, 10), (18m, 8) }),
            }, "Deadlifts felt locked in. Good lat activation.");

            AddLoggedWorkout("Leg Day", 3, 62, new[]
            {
                ("Squat (Barbell)", new[] { (100m, 8), (105m, 8), (110m, 6), (115m, 5) }),
                ("Romanian Deadlift (Barbell)", new[] { (90m, 10), (95m, 8), (100m, 8) }),
                ("Leg Press (Machine)", new[] { (180m, 10), (200m, 10), (210m, 8) }),
                ("Leg Extension (Machine)", new[] { (55m, 12), (60m, 12), (65m, 10) }),
                ("Standing Calf Raise (Machine)", new[] { (70m, 15), (75m, 15), (80m, 12) }),
            }, "Deep squats with solid pause on first rep.");

            AddLoggedWorkout("Push Day", 5, 50, new[]
            {
                ("Bench Press (Barbell)", new[] { (77.5m, 8), (80m, 8), (82.5m, 7) }),
                ("Incline Bench Press (Dumbbell)", new[] { (26m, 10), (28m, 10), (28m, 8) }),
                ("Overhead Press (Barbell)", new[] { (47.5m, 8), (50m, 8), (50m, 7) }),
                ("Lateral Raise (Dumbbell)", new[] { (12m, 12), (12m, 12), (12m, 10) }),
                ("Triceps Pushdown (Cable)", new[] { (30m, 12), (30m, 10), (32.5m, 8) }),
            });

            AddLoggedWorkout("Pull Day", 7, 54, new[]
            {
                ("Deadlift (Barbell)", new[] { (130m, 5), (135m, 5), (140m, 5) }),
                ("Lat Pulldown (Cable)", new[] { (65m, 10), (65m, 10), (70m, 8) }),
                ("Bent Over Row (Barbell)", new[] { (70m, 8), (70m, 8), (70m, 8) }),
                ("Face Pull (Cable)", new[] { (25m, 15), (25m, 15), (25m, 15) }),
                ("Bicep Curl (Dumbbell)", new[] { (16m, 10), (16m, 10), (16m, 8) }),
            });

            AddLoggedWorkout("Leg Day", 9, 58, new[]
            {
                ("Squat (Barbell)", new[] { (95m, 8), (100m, 8), (105m, 6) }),
                ("Romanian Deadlift (Barbell)", new[] { (85m, 10), (90m, 8), (95m, 8) }),
                ("Leg Press (Machine)", new[] { (170m, 10), (190m, 10), (200m, 8) }),
                ("Standing Calf Raise (Machine)", new[] { (70m, 15), (75m, 15), (75m, 12) }),
            });

            AddLoggedWorkout("Push Day", 11, 52, new[]
            {
                ("Bench Press (Barbell)", new[] { (75m, 8), (77.5m, 8), (80m, 6) }),
                ("Incline Bench Press (Dumbbell)", new[] { (26m, 10), (26m, 10), (28m, 8) }),
                ("Overhead Press (Barbell)", new[] { (45m, 8), (47.5m, 8), (50m, 6) }),
                ("Lateral Raise (Dumbbell)", new[] { (10m, 12), (12m, 12), (12m, 10) }),
            });

            AddLoggedWorkout("Pull Day", 13, 49, new[]
            {
                ("Deadlift (Barbell)", new[] { (125m, 5), (130m, 5), (135m, 5) }),
                ("Lat Pulldown (Cable)", new[] { (60m, 10), (65m, 8), (65m, 8) }),
                ("Bent Over Row (Barbell)", new[] { (65m, 8), (70m, 8), (70m, 6) }),
            });

            await db.SaveChangesAsync(ct);
            logger.LogInformation("Demo user routines and workout history seeded");
        }

        // 3. Meals and Nutrition (7 days of meals)
        if (!await db.Meals.IgnoreQueryFilters().AnyAsync(m => m.UserId == userId, ct))
        {
            var slotMap = await db.MealSlots.IgnoreQueryFilters()
                .Where(s => s.UserId == null || s.UserId == userId)
                .ToDictionaryAsync(s => s.Name, s => s.Id, StringComparer.OrdinalIgnoreCase, ct);

            var foodMap = await db.Foods.IgnoreQueryFilters()
                .Where(f => f.UserId == null || f.UserId == userId)
                .ToDictionaryAsync(f => f.Name, f => f.Id, StringComparer.OrdinalIgnoreCase, ct);

            long GetSlot(string name) => slotMap.TryGetValue(name, out var id) ? id : 0;
            long GetFood(string name) => foodMap.TryGetValue(name, out var id) ? id : 0;

            void AddDayMeals(int daysAgo)
            {
                var date = today.AddDays(-daysAgo);

                // Breakfast
                var bSlot = GetSlot("Breakfast");
                if (bSlot != 0)
                {
                    var bMeal = new Meal { UserId = userId, MealSlotId = bSlot, Date = date, MealFoods = new List<MealFood>() };
                    void AddF(Meal m, string fName, decimal q)
                    {
                        var fid = GetFood(fName);
                        if (fid != 0) m.MealFoods.Add(new MealFood { UserId = userId, FoodId = fid, Quantity = q });
                    }

                    AddF(bMeal, "Rolled oats, dry", 1.5m);
                    AddF(bMeal, "Whey protein (1 scoop)", 1.0m);
                    AddF(bMeal, "Milk, toned", 1.0m);
                    AddF(bMeal, "Banana (medium)", 1.0m);
                    AddF(bMeal, "Black coffee", 1.0m);
                    db.Meals.Add(bMeal);
                }

                // Lunch
                var lSlot = GetSlot("Lunch");
                if (lSlot != 0)
                {
                    var lMeal = new Meal { UserId = userId, MealSlotId = lSlot, Date = date, MealFoods = new List<MealFood>() };
                    void AddF(Meal m, string fName, decimal q)
                    {
                        var fid = GetFood(fName);
                        if (fid != 0) m.MealFoods.Add(new MealFood { UserId = userId, FoodId = fid, Quantity = q });
                    }

                    AddF(lMeal, "Chicken breast, cooked", 2.0m);
                    AddF(lMeal, "Brown rice, cooked", 1.5m);
                    AddF(lMeal, "Broccoli", 1.5m);
                    AddF(lMeal, "Olive oil (1 tbsp)", 1.0m);
                    db.Meals.Add(lMeal);
                }

                // Snacks
                var sSlot = GetSlot("Snacks");
                if (sSlot != 0)
                {
                    var sMeal = new Meal { UserId = userId, MealSlotId = sSlot, Date = date, MealFoods = new List<MealFood>() };
                    void AddF(Meal m, string fName, decimal q)
                    {
                        var fid = GetFood(fName);
                        if (fid != 0) m.MealFoods.Add(new MealFood { UserId = userId, FoodId = fid, Quantity = q });
                    }

                    AddF(sMeal, "Greek yogurt, plain, non-fat", 1.0m);
                    AddF(sMeal, "Almonds", 1.0m);
                    AddF(sMeal, "Apple (medium)", 1.0m);
                    db.Meals.Add(sMeal);
                }

                // Dinner
                var dSlot = GetSlot("Dinner");
                if (dSlot != 0)
                {
                    var dMeal = new Meal { UserId = userId, MealSlotId = dSlot, Date = date, MealFoods = new List<MealFood>() };
                    void AddF(Meal m, string fName, decimal q)
                    {
                        var fid = GetFood(fName);
                        if (fid != 0) m.MealFoods.Add(new MealFood { UserId = userId, FoodId = fid, Quantity = q });
                    }

                    AddF(dMeal, "Salmon, cooked", 1.5m);
                    AddF(dMeal, "Sweet potato, baked", 1.5m);
                    AddF(dMeal, "Spinach", 1.5m);
                    AddF(dMeal, "Olive oil (1 tbsp)", 0.5m);
                    db.Meals.Add(dMeal);
                }
            }

            for (int d = 6; d >= 0; d--)
            {
                AddDayMeals(d);
            }

            await db.SaveChangesAsync(ct);
            logger.LogInformation("Demo user meals seeded (7 days)");
        }
    }
}
