using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using VitaTrack.Infrastructure.Data;

#nullable disable

namespace VitaTrack.Infrastructure.Migrations
{
    /// <summary>
    /// Gym tracker upgrade:
    ///  - set: SetType (warm-up / drop / failure) + IsCompleted
    ///  - workout_exercise: per-exercise notes and rest timer
    ///  - workout: StartedAt / EndedAt + (UserId, Date) index for history paging
    ///  - users: sex, activity factor, nutrition goals, weight goal, unit + rest-timer preferences
    ///  - weight_tracker: body fat % and notes
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20261004120000_GymTrackerUpgrade")]
    public partial class GymTrackerUpgrade : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // set
            migrationBuilder.AddColumn<short>(
                name: "SetType", table: "set", type: "smallint", nullable: false, defaultValue: (short)0);
            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted", table: "set", type: "boolean", nullable: false, defaultValue: true);

            // workout_exercise
            migrationBuilder.AddColumn<string>(
                name: "Notes", table: "workout_exercise", type: "text", nullable: true);
            migrationBuilder.AddColumn<int>(
                name: "RestSeconds", table: "workout_exercise", type: "integer", nullable: true);

            // workout
            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt", table: "workout", type: "timestamp with time zone", nullable: true);
            migrationBuilder.AddColumn<DateTime>(
                name: "EndedAt", table: "workout", type: "timestamp with time zone", nullable: true);
            migrationBuilder.CreateIndex(
                name: "ix_workout_user_id_date", table: "workout", columns: new[] { "UserId", "Date" });

            // users
            migrationBuilder.AddColumn<string>(
                name: "Sex", table: "users", type: "character varying(10)", maxLength: 10, nullable: true);
            migrationBuilder.AddColumn<decimal>(
                name: "ActivityFactor", table: "users", type: "numeric(4,3)", precision: 4, scale: 3, nullable: true);
            migrationBuilder.AddColumn<int>(
                name: "CalorieGoal", table: "users", type: "integer", nullable: true);
            migrationBuilder.AddColumn<int>(
                name: "ProteinGoalG", table: "users", type: "integer", nullable: true);
            migrationBuilder.AddColumn<int>(
                name: "CarbsGoalG", table: "users", type: "integer", nullable: true);
            migrationBuilder.AddColumn<int>(
                name: "FatGoalG", table: "users", type: "integer", nullable: true);
            migrationBuilder.AddColumn<decimal>(
                name: "WeightGoalKg", table: "users", type: "numeric(6,2)", precision: 6, scale: 2, nullable: true);
            migrationBuilder.AddColumn<string>(
                name: "WeightUnit", table: "users", type: "character varying(5)", maxLength: 5, nullable: false, defaultValue: "kg");
            migrationBuilder.AddColumn<int>(
                name: "DefaultRestSeconds", table: "users", type: "integer", nullable: false, defaultValue: 90);

            // weight_tracker
            migrationBuilder.AddColumn<decimal>(
                name: "BodyFatPercent", table: "weight_tracker", type: "numeric(5,2)", precision: 5, scale: 2, nullable: true);
            migrationBuilder.AddColumn<string>(
                name: "Notes", table: "weight_tracker", type: "text", nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "SetType", table: "set");
            migrationBuilder.DropColumn(name: "IsCompleted", table: "set");

            migrationBuilder.DropColumn(name: "Notes", table: "workout_exercise");
            migrationBuilder.DropColumn(name: "RestSeconds", table: "workout_exercise");

            migrationBuilder.DropIndex(name: "ix_workout_user_id_date", table: "workout");
            migrationBuilder.DropColumn(name: "StartedAt", table: "workout");
            migrationBuilder.DropColumn(name: "EndedAt", table: "workout");

            migrationBuilder.DropColumn(name: "Sex", table: "users");
            migrationBuilder.DropColumn(name: "ActivityFactor", table: "users");
            migrationBuilder.DropColumn(name: "CalorieGoal", table: "users");
            migrationBuilder.DropColumn(name: "ProteinGoalG", table: "users");
            migrationBuilder.DropColumn(name: "CarbsGoalG", table: "users");
            migrationBuilder.DropColumn(name: "FatGoalG", table: "users");
            migrationBuilder.DropColumn(name: "WeightGoalKg", table: "users");
            migrationBuilder.DropColumn(name: "WeightUnit", table: "users");
            migrationBuilder.DropColumn(name: "DefaultRestSeconds", table: "users");

            migrationBuilder.DropColumn(name: "BodyFatPercent", table: "weight_tracker");
            migrationBuilder.DropColumn(name: "Notes", table: "weight_tracker");
        }
    }
}
