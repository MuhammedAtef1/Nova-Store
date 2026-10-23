using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class ShippingZone : BaseEntity
{
    public string Governorate { get; set; } = string.Empty;
    public decimal ShippingFee { get; set; }
    public bool IsActive { get; set; } = true;
    public int EstimatedDaysMin { get; set; } = 2;
    public int EstimatedDaysMax { get; set; } = 5;
}
