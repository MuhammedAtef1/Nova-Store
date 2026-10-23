using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class StoreSettings : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Group { get; set; } = "General";
}
