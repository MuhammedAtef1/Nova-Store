using Microsoft.EntityFrameworkCore;
using Vini.Application.Common;
using Vini.Application.DTOs;
using Vini.Application.Interfaces;

namespace Vini.Application.Services;

public interface ICatalogService
{
    Task<List<CategoryDto>> GetActiveCategoriesAsync(CancellationToken cancellationToken = default);
    Task<PaginatedList<ProductSummaryDto>> GetProductsAsync(string? categorySlug, string? search, int pageNumber = 1, int pageSize = 12, CancellationToken cancellationToken = default);
    Task<List<ProductSummaryDto>> GetFeaturedProductsAsync(int count = 4, CancellationToken cancellationToken = default);
    Task<List<ProductSummaryDto>> GetNewArrivalsAsync(int count = 4, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetProductBySlugAsync(string slug, CancellationToken cancellationToken = default);
}

public class CatalogService : ICatalogService
{
    private readonly IApplicationDbContext _context;

    public CatalogService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetActiveCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                ImageUrl = c.ImageUrl
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<PaginatedList<ProductSummaryDto>> GetProductsAsync(
        string? categorySlug,
        string? search,
        int pageNumber = 1,
        int pageSize = 12,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsPublished && !p.IsArchived)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            query = query.Where(p => p.Category.Slug == categorySlug);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => p.Name.Contains(search) || (p.Description != null && p.Description.Contains(search)));
        }

        var dtoQuery = query.Select(p => MapToSummary(p));

        return await PaginatedList<ProductSummaryDto>.CreateAsync(dtoQuery, pageNumber, pageSize, cancellationToken);
    }

    public async Task<List<ProductSummaryDto>> GetFeaturedProductsAsync(int count = 4, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsPublished && !p.IsArchived && p.IsFeatured)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .Select(p => MapToSummary(p))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ProductSummaryDto>> GetNewArrivalsAsync(int count = 4, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsPublished && !p.IsArchived)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .Select(p => MapToSummary(p))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductDetailDto?> GetProductBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished && !p.IsArchived, cancellationToken);

        if (product == null) return null;

        var dto = new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            ShortDescription = product.ShortDescription,
            Description = product.Description,
            FabricInfo = product.FabricInfo,
            CareInstructions = product.CareInstructions,
            BasePrice = product.BasePrice,
            SalePrice = product.SalePrice,
            EffectivePrice = product.GetEffectivePrice(),
            PrimaryImageUrl = product.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault(i => i.IsPrimary)?.Url 
                ?? product.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault()?.Url,
            SecondaryImageUrl = product.Images.OrderBy(i => i.DisplayOrder).Skip(1).FirstOrDefault()?.Url,
            IsNewArrival = product.CreatedAt >= DateTime.UtcNow.AddDays(-30),
            Category = new CategoryDto
            {
                Id = product.Category.Id,
                Name = product.Category.Name,
                Slug = product.Category.Slug
            },
            Images = product.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto
            {
                Id = i.Id,
                Url = i.Url,
                AltText = i.AltText,
                IsPrimary = i.IsPrimary
            }).ToList(),
            Variants = product.Variants.Where(v => v.IsActive).Select(v => new ProductVariantDto
            {
                Id = v.Id,
                SKU = v.SKU,
                Color = v.Color,
                ColorHex = v.ColorHex,
                Size = v.Size,
                PriceOverride = v.PriceOverride,
                InStock = v.AvailableStock > 0
            }).ToList()
        };

        return dto;
    }

    private static ProductSummaryDto MapToSummary(Domain.Entities.Product p)
    {
        var primaryImage = p.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault(i => i.IsPrimary)?.Url 
            ?? p.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault()?.Url;
        var secondaryImage = p.Images.OrderBy(i => i.DisplayOrder).Skip(1).FirstOrDefault()?.Url;
        
        return new ProductSummaryDto
        {
            Id = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            ShortDescription = p.ShortDescription,
            BasePrice = p.BasePrice,
            SalePrice = p.SalePrice,
            EffectivePrice = p.SalePrice > 0 && 
                             (p.SalePriceStartDate == null || DateTime.UtcNow >= p.SalePriceStartDate) && 
                             (p.SalePriceEndDate == null || DateTime.UtcNow <= p.SalePriceEndDate)
                                 ? p.SalePrice.Value : p.BasePrice,
            PrimaryImageUrl = primaryImage,
            SecondaryImageUrl = secondaryImage,
            IsNewArrival = p.CreatedAt >= DateTime.UtcNow.AddDays(-30),
            Category = new CategoryDto
            {
                Id = p.Category.Id,
                Name = p.Category.Name,
                Slug = p.Category.Slug
            }
        };
    }
}
