using Vini.Domain.Enums;

namespace Vini.Domain.Exceptions;

public class InvalidOrderTransitionException : DomainException
{
    public InvalidOrderTransitionException(OrderStatus from, OrderStatus to)
        : base($"Cannot transition order from '{from}' to '{to}'.") { }
}
