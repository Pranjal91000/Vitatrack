using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VitaTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ArchChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exercises_Users_UserId",
                table: "Exercises");

            migrationBuilder.DropForeignKey(
                name: "FK_Foods_Users_UserId",
                table: "Foods");

            migrationBuilder.DropForeignKey(
                name: "FK_MealFoods_Foods_FoodId",
                table: "MealFoods");

            migrationBuilder.DropForeignKey(
                name: "FK_MealFoods_Meals_MealId",
                table: "MealFoods");

            migrationBuilder.DropForeignKey(
                name: "FK_MealFoods_Users_UserId",
                table: "MealFoods");

            migrationBuilder.DropForeignKey(
                name: "FK_Meals_MealSlots_MealSlotId",
                table: "Meals");

            migrationBuilder.DropForeignKey(
                name: "FK_Meals_Users_UserId",
                table: "Meals");

            migrationBuilder.DropForeignKey(
                name: "FK_MealSlots_Users_UserId",
                table: "MealSlots");

            migrationBuilder.DropForeignKey(
                name: "FK_RefreshTokens_Users_UserId",
                table: "RefreshTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Sets_Users_UserId",
                table: "Sets");

            migrationBuilder.DropForeignKey(
                name: "FK_Sets_WorkoutExercises_WorkoutExerciseId",
                table: "Sets");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutExercises_Exercises_ExerciseId",
                table: "WorkoutExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutExercises_Users_UserId",
                table: "WorkoutExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutExercises_Workouts_WorkoutId",
                table: "WorkoutExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_Workouts_Users_UserId",
                table: "Workouts");

            migrationBuilder.DropTable(
                name: "WeightTracks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Workouts",
                table: "Workouts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkoutExercises",
                table: "WorkoutExercises");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Sets",
                table: "Sets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshTokens",
                table: "RefreshTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MealSlots",
                table: "MealSlots");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Meals",
                table: "Meals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MealFoods",
                table: "MealFoods");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Foods",
                table: "Foods");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Exercises",
                table: "Exercises");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "users");

            migrationBuilder.RenameTable(
                name: "Workouts",
                newName: "workout");

            migrationBuilder.RenameTable(
                name: "WorkoutExercises",
                newName: "workout_exercise");

            migrationBuilder.RenameTable(
                name: "Sets",
                newName: "set");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                newName: "refresh_token");

            migrationBuilder.RenameTable(
                name: "MealSlots",
                newName: "meal_slot");

            migrationBuilder.RenameTable(
                name: "Meals",
                newName: "meal");

            migrationBuilder.RenameTable(
                name: "MealFoods",
                newName: "meal_food");

            migrationBuilder.RenameTable(
                name: "Foods",
                newName: "food");

            migrationBuilder.RenameTable(
                name: "Exercises",
                newName: "exercise");

            migrationBuilder.RenameIndex(
                name: "IX_Workouts_UserId",
                table: "workout",
                newName: "IX_workout_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutExercises_WorkoutId",
                table: "workout_exercise",
                newName: "IX_workout_exercise_WorkoutId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutExercises_UserId",
                table: "workout_exercise",
                newName: "IX_workout_exercise_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutExercises_ExerciseId",
                table: "workout_exercise",
                newName: "IX_workout_exercise_ExerciseId");

            migrationBuilder.RenameIndex(
                name: "IX_Sets_WorkoutExerciseId",
                table: "set",
                newName: "IX_set_WorkoutExerciseId");

            migrationBuilder.RenameIndex(
                name: "IX_Sets_UserId",
                table: "set",
                newName: "IX_set_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_RefreshTokens_UserId",
                table: "refresh_token",
                newName: "IX_refresh_token_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_MealSlots_UserId",
                table: "meal_slot",
                newName: "IX_meal_slot_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Meals_UserId_Date",
                table: "meal",
                newName: "ix_meal_user_id_date");

            migrationBuilder.RenameIndex(
                name: "IX_Meals_MealSlotId",
                table: "meal",
                newName: "IX_meal_MealSlotId");

            migrationBuilder.RenameIndex(
                name: "IX_MealFoods_UserId",
                table: "meal_food",
                newName: "IX_meal_food_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_MealFoods_MealId",
                table: "meal_food",
                newName: "IX_meal_food_MealId");

            migrationBuilder.RenameIndex(
                name: "IX_MealFoods_FoodId",
                table: "meal_food",
                newName: "IX_meal_food_FoodId");

            migrationBuilder.RenameIndex(
                name: "IX_Foods_UserId",
                table: "food",
                newName: "IX_food_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Foods_Name",
                table: "food",
                newName: "IX_food_Name");

            migrationBuilder.RenameIndex(
                name: "IX_Exercises_UserId",
                table: "exercise",
                newName: "IX_exercise_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<decimal>(
                name: "WeightKg",
                table: "set",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Rpe",
                table: "set",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "PaceMinPerKm",
                table: "set",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ElevationGainM",
                table: "set",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "DistanceKm",
                table: "set",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "meal_slot",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<decimal>(
                name: "Quantity",
                table: "meal_food",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "ServingSize",
                table: "food",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "ProteinG",
                table: "food",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "food",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<decimal>(
                name: "FatG",
                table: "food",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "CarbsG",
                table: "food",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "exercise",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "pk_user",
                table: "users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_workout",
                table: "workout",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_workout_exercise",
                table: "workout_exercise",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_set",
                table: "set",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_refresh_token",
                table: "refresh_token",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_meal_slot",
                table: "meal_slot",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_meal",
                table: "meal",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_meal_food",
                table: "meal_food",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_food",
                table: "food",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_exercise",
                table: "exercise",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "weight_tracker",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DateRecordedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    Weight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_weight_tracker", x => x.Id);
                    table.ForeignKey(
                        name: "fk-weight_tracker-user-user_id",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_user_email",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_weight_tracker_UserId",
                table: "weight_tracker",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "fk-exercise-user-user_id",
                table: "exercise",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk-food-user-user_id",
                table: "food",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk-meal-meal_slot-meal_slot_id",
                table: "meal",
                column: "MealSlotId",
                principalTable: "meal_slot",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk-meal-user-user_id",
                table: "meal",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_meal_food_users_UserId",
                table: "meal_food",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk-meal_food-food-food_id",
                table: "meal_food",
                column: "FoodId",
                principalTable: "food",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk-meal_food-meal-meal_id",
                table: "meal_food",
                column: "MealId",
                principalTable: "meal",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk-meal_slot-user-user_id",
                table: "meal_slot",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk-refresh_token-user-user_id",
                table: "refresh_token",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_set_users_UserId",
                table: "set",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk-set-workout_exercise-workout_exercise_id",
                table: "set",
                column: "WorkoutExerciseId",
                principalTable: "workout_exercise",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk-workout-user-user_id",
                table: "workout",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_workout_exercise_users_UserId",
                table: "workout_exercise",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk-workout_exercise-exercise-exercise_id",
                table: "workout_exercise",
                column: "ExerciseId",
                principalTable: "exercise",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk-workout_exercise-workout-workout_id",
                table: "workout_exercise",
                column: "WorkoutId",
                principalTable: "workout",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk-exercise-user-user_id",
                table: "exercise");

            migrationBuilder.DropForeignKey(
                name: "fk-food-user-user_id",
                table: "food");

            migrationBuilder.DropForeignKey(
                name: "fk-meal-meal_slot-meal_slot_id",
                table: "meal");

            migrationBuilder.DropForeignKey(
                name: "fk-meal-user-user_id",
                table: "meal");

            migrationBuilder.DropForeignKey(
                name: "FK_meal_food_users_UserId",
                table: "meal_food");

            migrationBuilder.DropForeignKey(
                name: "fk-meal_food-food-food_id",
                table: "meal_food");

            migrationBuilder.DropForeignKey(
                name: "fk-meal_food-meal-meal_id",
                table: "meal_food");

            migrationBuilder.DropForeignKey(
                name: "fk-meal_slot-user-user_id",
                table: "meal_slot");

            migrationBuilder.DropForeignKey(
                name: "fk-refresh_token-user-user_id",
                table: "refresh_token");

            migrationBuilder.DropForeignKey(
                name: "FK_set_users_UserId",
                table: "set");

            migrationBuilder.DropForeignKey(
                name: "fk-set-workout_exercise-workout_exercise_id",
                table: "set");

            migrationBuilder.DropForeignKey(
                name: "fk-workout-user-user_id",
                table: "workout");

            migrationBuilder.DropForeignKey(
                name: "FK_workout_exercise_users_UserId",
                table: "workout_exercise");

            migrationBuilder.DropForeignKey(
                name: "fk-workout_exercise-exercise-exercise_id",
                table: "workout_exercise");

            migrationBuilder.DropForeignKey(
                name: "fk-workout_exercise-workout-workout_id",
                table: "workout_exercise");

            migrationBuilder.DropTable(
                name: "weight_tracker");

            migrationBuilder.DropPrimaryKey(
                name: "pk_user",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_user_email",
                table: "users");

            migrationBuilder.DropPrimaryKey(
                name: "pk_workout_exercise",
                table: "workout_exercise");

            migrationBuilder.DropPrimaryKey(
                name: "pk_workout",
                table: "workout");

            migrationBuilder.DropPrimaryKey(
                name: "pk_set",
                table: "set");

            migrationBuilder.DropPrimaryKey(
                name: "pk_refresh_token",
                table: "refresh_token");

            migrationBuilder.DropPrimaryKey(
                name: "pk_meal_slot",
                table: "meal_slot");

            migrationBuilder.DropPrimaryKey(
                name: "pk_meal_food",
                table: "meal_food");

            migrationBuilder.DropPrimaryKey(
                name: "pk_meal",
                table: "meal");

            migrationBuilder.DropPrimaryKey(
                name: "pk_food",
                table: "food");

            migrationBuilder.DropPrimaryKey(
                name: "pk_exercise",
                table: "exercise");

            migrationBuilder.RenameTable(
                name: "users",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "workout_exercise",
                newName: "WorkoutExercises");

            migrationBuilder.RenameTable(
                name: "workout",
                newName: "Workouts");

            migrationBuilder.RenameTable(
                name: "set",
                newName: "Sets");

            migrationBuilder.RenameTable(
                name: "refresh_token",
                newName: "RefreshTokens");

            migrationBuilder.RenameTable(
                name: "meal_slot",
                newName: "MealSlots");

            migrationBuilder.RenameTable(
                name: "meal_food",
                newName: "MealFoods");

            migrationBuilder.RenameTable(
                name: "meal",
                newName: "Meals");

            migrationBuilder.RenameTable(
                name: "food",
                newName: "Foods");

            migrationBuilder.RenameTable(
                name: "exercise",
                newName: "Exercises");

            migrationBuilder.RenameIndex(
                name: "IX_workout_exercise_WorkoutId",
                table: "WorkoutExercises",
                newName: "IX_WorkoutExercises_WorkoutId");

            migrationBuilder.RenameIndex(
                name: "IX_workout_exercise_UserId",
                table: "WorkoutExercises",
                newName: "IX_WorkoutExercises_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_workout_exercise_ExerciseId",
                table: "WorkoutExercises",
                newName: "IX_WorkoutExercises_ExerciseId");

            migrationBuilder.RenameIndex(
                name: "IX_workout_UserId",
                table: "Workouts",
                newName: "IX_Workouts_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_set_WorkoutExerciseId",
                table: "Sets",
                newName: "IX_Sets_WorkoutExerciseId");

            migrationBuilder.RenameIndex(
                name: "IX_set_UserId",
                table: "Sets",
                newName: "IX_Sets_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_refresh_token_UserId",
                table: "RefreshTokens",
                newName: "IX_RefreshTokens_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_meal_slot_UserId",
                table: "MealSlots",
                newName: "IX_MealSlots_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_meal_food_UserId",
                table: "MealFoods",
                newName: "IX_MealFoods_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_meal_food_MealId",
                table: "MealFoods",
                newName: "IX_MealFoods_MealId");

            migrationBuilder.RenameIndex(
                name: "IX_meal_food_FoodId",
                table: "MealFoods",
                newName: "IX_MealFoods_FoodId");

            migrationBuilder.RenameIndex(
                name: "ix_meal_user_id_date",
                table: "Meals",
                newName: "IX_Meals_UserId_Date");

            migrationBuilder.RenameIndex(
                name: "IX_meal_MealSlotId",
                table: "Meals",
                newName: "IX_Meals_MealSlotId");

            migrationBuilder.RenameIndex(
                name: "IX_food_UserId",
                table: "Foods",
                newName: "IX_Foods_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_food_Name",
                table: "Foods",
                newName: "IX_Foods_Name");

            migrationBuilder.RenameIndex(
                name: "IX_exercise_UserId",
                table: "Exercises",
                newName: "IX_Exercises_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<decimal>(
                name: "WeightKg",
                table: "Sets",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Rpe",
                table: "Sets",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)",
                oldPrecision: 4,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "PaceMinPerKm",
                table: "Sets",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ElevationGainM",
                table: "Sets",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "DistanceKm",
                table: "Sets",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "MealSlots",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<decimal>(
                name: "Quantity",
                table: "MealFoods",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<decimal>(
                name: "ServingSize",
                table: "Foods",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<decimal>(
                name: "ProteinG",
                table: "Foods",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Foods",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<decimal>(
                name: "FatG",
                table: "Foods",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<decimal>(
                name: "CarbsG",
                table: "Foods",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Exercises",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkoutExercises",
                table: "WorkoutExercises",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Workouts",
                table: "Workouts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Sets",
                table: "Sets",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshTokens",
                table: "RefreshTokens",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MealSlots",
                table: "MealSlots",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MealFoods",
                table: "MealFoods",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Meals",
                table: "Meals",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Foods",
                table: "Foods",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Exercises",
                table: "Exercises",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "WeightTracks",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateRecordedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Weight = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeightTracks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WeightTracks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WeightTracks_UserId",
                table: "WeightTracks",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Exercises_Users_UserId",
                table: "Exercises",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Foods_Users_UserId",
                table: "Foods",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MealFoods_Foods_FoodId",
                table: "MealFoods",
                column: "FoodId",
                principalTable: "Foods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MealFoods_Meals_MealId",
                table: "MealFoods",
                column: "MealId",
                principalTable: "Meals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MealFoods_Users_UserId",
                table: "MealFoods",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_MealSlots_MealSlotId",
                table: "Meals",
                column: "MealSlotId",
                principalTable: "MealSlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_Users_UserId",
                table: "Meals",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MealSlots_Users_UserId",
                table: "MealSlots",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshTokens_Users_UserId",
                table: "RefreshTokens",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sets_Users_UserId",
                table: "Sets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sets_WorkoutExercises_WorkoutExerciseId",
                table: "Sets",
                column: "WorkoutExerciseId",
                principalTable: "WorkoutExercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutExercises_Exercises_ExerciseId",
                table: "WorkoutExercises",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutExercises_Users_UserId",
                table: "WorkoutExercises",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutExercises_Workouts_WorkoutId",
                table: "WorkoutExercises",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Workouts_Users_UserId",
                table: "Workouts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
