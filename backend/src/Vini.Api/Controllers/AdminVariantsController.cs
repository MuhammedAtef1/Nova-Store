using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vini.Application.Interfaces;
using Vini.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/admin/products/{productId}/variants")]
[Authorize(Roles = "Admin")]
public class AdminVariantsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminVariantsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateVariant(Guid productId, [FromBody] CreateVariantRequest request)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return NotFound("Product not found");

        var variant = new ProductVariant
        {
            ProductId = productId,
            SKU = request.SKU,
            Color = request.Color,
            Size = request.Size,
            StockQuantity = request.StockQuantity,
            PriceOverride = request.PriceOverride,
            IsActive = request.IsActive
        };

        _context.ProductVariants.Add(variant);
        await _context.SaveChangesAsync();

        return Ok(variant);
    }

    [HttpPut("{variantId}")]
    public async Task<IActionResult> UpdateVariant(Guid productId, Guid variantId, [FromBody] UpdateVariantRequest request)
    {
        var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId);
        if (variant == null) return NotFound();

        variant.SKU = request.SKU;
        variant.Color = request.Color;
        variant.Size = request.Size;
        variant.PriceOverride = request.PriceOverride;
        variant.IsActive = request.IsActive;
        
        // Stock adjustment log could go here for audit trailing
        variant.StockQuantity = request.StockQuantity;

        await _context.SaveChangesAsync();
        return Ok(variant);
    }

    [HttpDelete("{variantId}")]
    public async Task<IActionResult> DeleteVariant(Guid productId, Guid variantId)
    {
        var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId);
        if (variant == null) return NotFound();

        _context.ProductVariants.Remove(variant);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateVariantRequest
{
    [Required] public string SKU { get; set; } = string.Empty;
    [Required] public string Color { get; set; } = string.Empty;
    [Required] public string Size { get; set; } = string.Empty;
    public decimal? PriceOverride { get; set; }
    public int StockQuantity { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

public class UpdateVariantRequest : CreateVariantRequest
{
}
