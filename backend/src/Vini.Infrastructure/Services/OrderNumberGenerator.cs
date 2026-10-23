using Vini.Application.Interfaces;

namespace Vini.Infrastructure.Services;

public class OrderNumberGenerator : IOrderNumberGenerator
{
    private static readonly Random _random = new();

    /// <summary>
    /// Generates a unique, human-readable order number.
    /// Format: VINI-YYYYMMDD-XXXXXX (e.g. VINI-20241015-483921)
    /// </summary>
    public string Generate()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randomPart = _random.Next(100000, 999999).ToString();
        return $"VINI-{datePart}-{randomPart}";
    }
}
