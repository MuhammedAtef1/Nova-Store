namespace Vini.Domain.Enums;

public enum PaymentStatus
{
    PendingCollection = 1,
    Collected = 2,
    Refunded = 3,
    PartiallyRefunded = 4,
    Failed = 5
}
