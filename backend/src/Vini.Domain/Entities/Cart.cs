using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class Cart : BaseEntity
{
    public string? UserId { get; set; }       // null for guest
    public string? SessionId { get; set; }    // guest identifier

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    public decimal GetSubtotal() => Items.Sum(i => i.UnitPrice * i.Quantity);
}
