namespace Vini.Domain.Enums;

public enum OrderStatus
{
    OrderCreated = 1,
    Preparing = 2,
    Prepared = 3,
    ShipmentAdded = 4,
    InTransit = 5,
    Delivered = 6,
    Cancelled = 7,
    FailedDelivery = 8,
    ReturnRequested = 9,
    Returned = 10
}
