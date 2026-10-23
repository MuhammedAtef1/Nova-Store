using Microsoft.EntityFrameworkCore;
using Vini.Application.Interfaces;
using Vini.Infrastructure.Persistence;

namespace Vini.Infrastructure.Services;

public class ShippingCalculator : IShippingCalculator
{
    private readonly ApplicationDbContext _context;

    public ShippingCalculator(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<decimal> CalculateAsync(
        string governorate,
        decimal orderSubtotal,
        CancellationToken cancellationToken = default)
    {
        // 1. Check free-shipping threshold from StoreSettings
        var thresholdSetting = await _context.StoreSettings
            .FirstOrDefaultAsync(s => s.Key == "FreeShippingThreshold", cancellationToken);

        if (thresholdSetting != null
            && decimal.TryParse(thresholdSetting.Value, out var threshold)
            && orderSubtotal >= threshold)
        {
            return 0m;
        }

        // 2. Check governorate-specific shipping fee
        var zone = await _context.ShippingZones
            .FirstOrDefaultAsync(z => z.Governorate == governorate && z.IsActive, cancellationToken);

        if (zone != null)
            return zone.ShippingFee;

        // 3. Fall back to default shipping fee from StoreSettings
        var defaultSetting = await _context.StoreSettings
            .FirstOrDefaultAsync(s => s.Key == "DefaultShippingFee", cancellationToken);

        if (defaultSetting != null && decimal.TryParse(defaultSetting.Value, out var defaultFee))
            return defaultFee;

        // 4. Absolute fallback
        return 50m;
    }
}
