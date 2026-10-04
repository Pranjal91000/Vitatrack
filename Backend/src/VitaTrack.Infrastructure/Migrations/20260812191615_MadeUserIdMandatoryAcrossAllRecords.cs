using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VitaTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MadeUserIdMandatoryAcrossAllRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MealFoods_Users_UserId",
                table: "MealFoods");

            migrationBuilder.DropForeignKey(
                name: "FK_Sets_Users_UserId",
                table: "Sets");

            migrationBuilder.DropForeignKey(
                name: "FK_WeightTracks_Users_UserId",
                table: "WeightTracks");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutExercises_Users_UserId",
                table: "WorkoutExercises");

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "WorkoutExercises",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "WeightTracks",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "Sets",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "MealFoods",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MealFoods_Users_UserId",
                table: "MealFoods",
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
                name: "FK_WeightTracks_Users_UserId",
                table: "WeightTracks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutExercises_Users_UserId",
                table: "WorkoutExercises",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MealFoods_Users_UserId",
                table: "MealFoods");

            migrationBuilder.DropForeignKey(
                name: "FK_Sets_Users_UserId",
                table: "Sets");

            migrationBuilder.DropForeignKey(
                name: "FK_WeightTracks_Users_UserId",
                table: "WeightTracks");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutExercises_Users_UserId",
                table: "WorkoutExercises");

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "WorkoutExercises",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "WeightTracks",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "Sets",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "MealFoods",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_MealFoods_Users_UserId",
                table: "MealFoods",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Sets_Users_UserId",
                table: "Sets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WeightTracks_Users_UserId",
                table: "WeightTracks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutExercises_Users_UserId",
                table: "WorkoutExercises",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
