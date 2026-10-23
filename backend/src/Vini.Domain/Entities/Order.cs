using Vini.Domain.Common;
using Vini.Domain.Enums;

namespace Vini.Domain.Entities;

public class Order : AuditableEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public string? UserId { get; set; }   // null for guest
    public string? IdempotencyKey { get; set; }

    // Customer snapshot (for guest or logged-in)
    public string CustomerName { get; set; } = string.Empty;
    public string PrimaryPhone { get; set; } = string.Empty;
    public string? SecondaryPhone { get; set; }
    public string? CustomerEmail { get; set; }

    // Delivery address snapshot
    public string Governorate { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string? DeliveryNotes { get; set; }

    // Financials
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal ShippingFee { get; set; }
    public decimal Total { get; set; }

    // Status
    public OrderStatus Status { get; set; } = OrderStatus.OrderCreated;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.PendingCollection;

    // Notes
    public string? InternalNotes { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
}
