using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class Wishlist : BaseEntity
{
    public string? UserId { get; set; }
    public string? SessionId { get; set; }

    public ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
}
