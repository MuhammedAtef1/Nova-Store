namespace Vini.Application.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserEmail { get; }
    bool IsAuthenticated { get; }
    bool IsAdmin { get; }
}
