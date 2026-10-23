namespace Vini.Domain.Exceptions;

public class InsufficientStockException : DomainException
{
    public InsufficientStockException(string sku, int requested, int available)
        : base($"Insufficient stock for SKU '{sku}': requested {requested}, available {available}.") { }
}
