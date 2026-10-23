using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string SKU { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public decimal? PriceOverride { get; set; }
    public int StockQuantity { get; set; } = 0;
    public int ReservedQuantity { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Optimistic concurrency
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public int AvailableStock => StockQuantity - ReservedQuantity;

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
}
