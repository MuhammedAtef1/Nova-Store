using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vini.Application.Interfaces;
using Vini.Domain.Entities;
using System.ComponentModel.DataAnnotations;
using Vini.Application.DTOs;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IImageStorageService _imageStorage;

    public AdminProductsController(IApplicationDbContext context, IImageStorageService imageStorage)
    {
        _context = context;
        _imageStorage = imageStorage;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(new
        {
            total,
            page,
            pageSize,
            items = items.Select(p => new {
                p.Id,
                p.Name,
                p.BasePrice,
                p.IsPublished,
                CategoryName = p.Category.Name,
                p.CreatedAt
            })
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id);
            
        if (product == null) return NotFound();
        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            Slug = request.Slug ?? request.Name.ToLower().Replace(" ", "-"),
            Description = request.Description,
            BasePrice = request.BasePrice,
            CategoryId = request.CategoryId,
            IsPublished = request.IsPublished
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return Ok(product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = request.Name;
        product.Description = request.Description;
        product.BasePrice = request.BasePrice;
        product.SalePrice = request.SalePrice;
        product.CategoryId = request.CategoryId;
        product.IsPublished = request.IsPublished;
        product.IsArchived = request.IsArchived;

        await _context.SaveChangesAsync();
        return Ok(product);
    }

    [HttpPost("{id}/images")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
        var product = await _context.Products.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) return NotFound("Product not found.");

        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

        var url = await _imageStorage.UploadAsync(file.OpenReadStream(), file.FileName, file.ContentType);

        var image = new ProductImage
        {
            ProductId = id,
            Url = url,
            IsPrimary = !product.Images.Any(),
            DisplayOrder = product.Images.Count
        };

        _context.ProductImages.Add(image);
        await _context.SaveChangesAsync();

        return Ok(image);
    }

    [HttpDelete("{id}/images/{imageId}")]
    public async Task<IActionResult> DeleteImage(Guid id, Guid imageId)
    {
        var image = await _context.ProductImages.FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == id);
        if (image == null) return NotFound();

        await _imageStorage.DeleteAsync(image.Url);
        _context.ProductImages.Remove(image);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateProductRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public Guid CategoryId { get; set; }
    public bool IsPublished { get; set; }
}

public class UpdateProductRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? SalePrice { get; set; }
    public Guid CategoryId { get; set; }
    public bool IsPublished { get; set; }
    public bool IsArchived { get; set; }
}
