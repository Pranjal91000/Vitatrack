using Microsoft.Extensions.Logging;

namespace VitaTrack.Infrastructure.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body)
    {
        // Mock email sending
        _logger.LogInformation($"[Mock Email] To: {to}, Subject: {subject}, Body: {body}");
        return Task.CompletedTask;
    }
}
