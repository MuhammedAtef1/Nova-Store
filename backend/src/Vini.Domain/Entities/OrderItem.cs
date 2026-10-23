using Vini.Domain.Common;

namespace Vini.Domain.Entities;

/// <summary>
/// Snapshot of a purchased product variant. Immune to catalog changes.
/// </summary>
public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    // Original variant reference (nullable — allows product deletion without losing order history)
    public Guid? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    // Snapshots
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
