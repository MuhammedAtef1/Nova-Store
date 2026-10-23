using Vini.Domain.Common;
using Vini.Domain.Enums;

namespace Vini.Domain.Entities;

public class OrderStatusHistory : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public OrderStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? ChangedBy { get; set; }   // admin email or "System"
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
