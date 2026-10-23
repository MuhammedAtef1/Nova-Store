namespace Vini.Application.Interfaces;

public interface IShippingCalculator
{
    Task<decimal> CalculateAsync(string governorate, decimal orderSubtotal, CancellationToken cancellationToken = default);
}
