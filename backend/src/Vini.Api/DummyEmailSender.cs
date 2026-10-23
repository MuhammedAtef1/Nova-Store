using Microsoft.AspNetCore.Identity;
using Vini.Infrastructure.Identity;

namespace Vini.Api;

public class DummyEmailSender : IEmailSender<ApplicationUser>
{
    public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink)
    {
        // Log or just ignore for dev
        return Task.CompletedTask;
    }

    public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode)
    {
        return Task.CompletedTask;
    }

    public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink)
    {
        return Task.CompletedTask;
    }
}
