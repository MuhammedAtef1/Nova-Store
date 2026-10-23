namespace Vini.Application.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}

public class ProductSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? SalePrice { get; set; }
    public decimal EffectivePrice { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public string? SecondaryImageUrl { get; set; }
    public bool IsNewArrival { get; set; }
    public CategoryDto Category { get; set; } = null!;
}

public class ProductDetailDto : ProductSummaryDto
{
    public string? Description { get; set; }
    public string? FabricInfo { get; set; }
    public string? CareInstructions { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
}

public class ProductImageDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
}

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public decimal? PriceOverride { get; set; }
    public bool InStock { get; set; }
}
