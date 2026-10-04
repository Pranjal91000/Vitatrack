using Microsoft.AspNetCore.Mvc;

namespace VitaTrack.Api.Middlewares
{
    /// <summary>Turns unhandled exceptions into RFC 7807 problem responses instead of an empty 500.</summary>
    public class ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env) : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                // Client went away (e.g. phone locked mid-request) — nothing to report.
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
                if (context.Response.HasStarted) throw;

                var problem = new ProblemDetails
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Title = "Something went wrong on the server.",
                    Detail = env.IsDevelopment() ? ex.Message : null,
                    Instance = context.Request.Path
                };
                if (context.Items.TryGetValue("CorrelationId", out var cid)) problem.Extensions["correlationId"] = cid;

                context.Response.StatusCode = problem.Status.Value;
                await context.Response.WriteAsJsonAsync(problem, (System.Text.Json.JsonSerializerOptions?)null, "application/problem+json");
            }
        }
    }
}
