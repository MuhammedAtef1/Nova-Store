using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class WishlistItem : BaseEntity
{
    public Guid WishlistId { get; set; }
    public Wishlist Wishlist { get; set; } = null!;

    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
}
