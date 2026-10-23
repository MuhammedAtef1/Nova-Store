using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class CustomerAddress : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;   // e.g. "Home", "Work"
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Governorate { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public bool IsDefault { get; set; } = false;
}
