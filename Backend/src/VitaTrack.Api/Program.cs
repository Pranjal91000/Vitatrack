using VitaTrack.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using VitaTrack.Infrastructure.Extension;
using VitaTrack.Api.Extension;
using VitaTrack.Api.Middlewares;
using VitaTrack.Api.Options;

var builder = WebApplication.CreateBuilder(args);
var jwtSettings = builder.Configuration
    .GetSection("JwtSettings")
    .Get<JwtOption>();

builder.Services.AddTransient<CorrelationIdMiddleware>();
builder.Services.AddTransient<RequestLoggingMiddleware>();

// Add services to the container.
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddServices();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.WebHost.UseUrls("http://0.0.0.0:5177");

// JWT
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        // Keep the claim names exactly as they appear in the token (no surprise remapping).
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ClockSkew = TimeSpan.Zero,
            NameClaimType = JwtRegisteredClaimNames.Name,
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{

    var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

    options.AddPolicy("DefinedOrigins", policy =>
    {
        policy
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


builder.Services.AddOptions<JwtOption>()
    .BindConfiguration(JwtOption.SectionName);

var app = builder.Build();

app.UseSwagger();
    app.UseSwaggerUI();

// Global Exception Handler

//app.UseExceptionHandler();                   // 1. Catch all unhandled exceptions
app.UseCors("DefinedOrigins");               // 1. CORS headers (must be before HTTPS redirect so OPTIONS preflights aren't redirected)
app.UseHttpsRedirection();                   // 2. Redirect HTTP → HTTPS
app.UseRouting();                            // 3. Match routes
app.UseAuthentication();                     // 4. Establish identity
app.UseAuthorization();                      // 5. Check permissions
app.UseMiddleware<RequestLoggingMiddleware>();// 10. Custom middleware
app.UseMiddleware<CorrelationIdMiddleware>();// 10. Custom middleware
app.MapControllers();                        // 11. Execute endpoints


app.Run();
