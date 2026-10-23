using Microsoft.AspNetCore.Identity;

namespace Vini.Infrastructure.Identity;

public class ApplicationRole : IdentityRole
{
    public ApplicationRole() : base() { }
    public ApplicationRole(string roleName) : base(roleName) { }

    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
