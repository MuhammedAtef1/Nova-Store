using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
}
