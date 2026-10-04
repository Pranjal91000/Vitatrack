using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Interfaces;
using VitaTrack.Core.Services;
using VitaTrack.Infrastructure.Data;
using VitaTrack.Infrastructure.Repositories;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Extension;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<IJwtHelperService, JwtHelperService>();

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"),
                builder => builder.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IAnalyticsService, Services.AnalyticsService>();
        services.AddScoped<Services.IEmailService, Services.EmailService>();
        services.AddScoped<IWeightTrackerRepository, WeightTrackerRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IMealSlotRepository, MealSlotRepository>();
        services.AddScoped<IFoodRepository, FoodRepository>();
        services.AddScoped<IMealRepository, MealRepository>();
        services.AddScoped<IExerciseRepository, ExerciseRepository>();
        services.AddScoped<IWorkoutRepository, WorkoutRepository>();
        services.AddScoped<IReportRepository, ReportRepository>();

        return services;
    }
}
