using Microsoft.AspNetCore.Mvc;
using Vini.Application.Services;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    private readonly ICatalogService _catalogService;

    public CatalogController(ICatalogService catalogService)
    {
        _catalogService = catalogService;
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await _catalogService.GetActiveCategoriesAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken cancellationToken = default)
    {
        var products = await _catalogService.GetProductsAsync(category, search, page, pageSize, cancellationToken);
        return Ok(products);
    }

    [HttpGet("products/featured")]
    public async Task<IActionResult> GetFeaturedProducts(CancellationToken cancellationToken)
    {
        var products = await _catalogService.GetFeaturedProductsAsync(4, cancellationToken);
        return Ok(products);
    }

    [HttpGet("products/new-arrivals")]
    public async Task<IActionResult> GetNewArrivals(CancellationToken cancellationToken)
    {
        var products = await _catalogService.GetNewArrivalsAsync(4, cancellationToken);
        return Ok(products);
    }

    [HttpGet("products/{slug}")]
    public async Task<IActionResult> GetProductBySlug(string slug, CancellationToken cancellationToken)
    {
        var product = await _catalogService.GetProductBySlugAsync(slug, cancellationToken);
        
        if (product == null)
            return NotFound(new { message = $"Product with slug '{slug}' not found." });

        return Ok(product);
    }
}
