using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class Product : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ShortDescription { get; set; }
    public string? FabricInfo { get; set; }
    public string? CareInstructions { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? SalePrice { get; set; }
    public DateTime? SalePriceStartDate { get; set; }
    public DateTime? SalePriceEndDate { get; set; }
    public bool IsFeatured { get; set; } = false;
    public bool IsPublished { get; set; } = false;
    public bool IsArchived { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public int TotalSold { get; set; } = 0;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();

    /// <summary>Returns the effective selling price at a given moment.</summary>
    public decimal GetEffectivePrice(DateTime? asOf = null)
    {
        var now = asOf ?? DateTime.UtcNow;
        if (SalePrice.HasValue
            && SalePrice.Value > 0
            && (SalePriceStartDate == null || now >= SalePriceStartDate)
            && (SalePriceEndDate == null || now <= SalePriceEndDate))
        {
            return SalePrice.Value;
        }
        return BasePrice;
    }
}
