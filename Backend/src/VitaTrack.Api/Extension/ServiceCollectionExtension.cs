using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Services;

namespace VitaTrack.Api.Extension
{
    public static class SeviceCollectionExtensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddScoped<IWeightTrackerService, WeightTrackerService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IMealSlotService, MealSlotService>();
            services.AddScoped<IFoodService, FoodService>();
            services.AddScoped<IMealService, MealService>();
            services.AddScoped<IExerciseService, ExerciseService>();
            services.AddScoped<IWorkoutService, WorkoutService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<IAuthService, AuthService>();
            return services;
        }
    }
}
