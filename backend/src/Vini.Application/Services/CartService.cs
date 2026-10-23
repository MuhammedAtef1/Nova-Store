using Microsoft.EntityFrameworkCore;
using Vini.Application.Common;
using Vini.Application.DTOs;
using Vini.Application.Interfaces;
using Vini.Domain.Entities;

namespace Vini.Application.Services;

public interface ICartService
{
    Task<Result<CartDto>> GetCartAsync(string sessionId, string? userId, CancellationToken cancellationToken = default);
    Task<Result<CartDto>> AddToCartAsync(string sessionId, string? userId, AddToCartRequest request, CancellationToken cancellationToken = default);
    Task<Result<CartDto>> UpdateCartItemAsync(string sessionId, string? userId, Guid cartItemId, int quantity, CancellationToken cancellationToken = default);
    Task<Result> RemoveFromCartAsync(string sessionId, string? userId, Guid cartItemId, CancellationToken cancellationToken = default);
    Task MergeGuestCartAsync(string sessionId, string userId, CancellationToken cancellationToken = default);
}

public class CartService : ICartService
{
    private readonly IApplicationDbContext _context;

    public CartService(IApplicationDbContext context)
    {
        _context = context;
    }

    private async Task<Cart> GetOrCreateCartEntityAsync(string sessionId, string? userId, CancellationToken cancellationToken)
    {
        Cart? cart = null;

        if (!string.IsNullOrEmpty(userId))
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.ProductVariant)
                .ThenInclude(v => v.Product)
                .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
        }

        if (cart == null && !string.IsNullOrEmpty(sessionId))
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.ProductVariant)
                .ThenInclude(v => v.Product)
                .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.SessionId == sessionId, cancellationToken);
        }

        if (cart == null)
        {
            cart = new Cart
            {
                SessionId = sessionId,
                UserId = userId
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return cart;
    }

    public async Task<Result<CartDto>> GetCartAsync(string sessionId, string? userId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartEntityAsync(sessionId, userId, cancellationToken);
        return Result<CartDto>.Success(MapToDto(cart));
    }

    public async Task<Result<CartDto>> AddToCartAsync(string sessionId, string? userId, AddToCartRequest request, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartEntityAsync(sessionId, userId, cancellationToken);

        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == request.ProductVariantId, cancellationToken);

        if (variant == null || !variant.IsActive || !variant.Product.IsPublished)
            return Result<CartDto>.Failure("Product variant is unavailable.");

        if (variant.AvailableStock < request.Quantity)
            return Result<CartDto>.Failure("Insufficient stock.");

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId);

        if (existingItem != null)
        {
            if (variant.AvailableStock < (existingItem.Quantity + request.Quantity))
                return Result<CartDto>.Failure("Insufficient stock to increase quantity.");
            
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ProductVariantId = request.ProductVariantId,
                Quantity = request.Quantity,
                UnitPrice = variant.PriceOverride ?? variant.Product.GetEffectivePrice()
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        
        // Reload to get full details for DTO
        var updatedCart = await GetOrCreateCartEntityAsync(sessionId, userId, cancellationToken);
        return Result<CartDto>.Success(MapToDto(updatedCart));
    }

    public async Task<Result<CartDto>> UpdateCartItemAsync(string sessionId, string? userId, Guid cartItemId, int quantity, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartEntityAsync(sessionId, userId, cancellationToken);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item == null)
            return Result<CartDto>.Failure("Cart item not found.");

        if (quantity <= 0)
        {
            cart.Items.Remove(item);
        }
        else
        {
            if (item.ProductVariant.AvailableStock < quantity)
                return Result<CartDto>.Failure("Insufficient stock.");
                
            item.Quantity = quantity;
        }

        await _context.SaveChangesAsync(cancellationToken);
        
        return Result<CartDto>.Success(MapToDto(cart));
    }

    public async Task<Result> RemoveFromCartAsync(string sessionId, string? userId, Guid cartItemId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartEntityAsync(sessionId, userId, cancellationToken);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item != null)
        {
            cart.Items.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result.Success();
    }

    public async Task MergeGuestCartAsync(string sessionId, string userId, CancellationToken cancellationToken = default)
    {
        var guestCart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.SessionId == sessionId && c.UserId == null, cancellationToken);

        if (guestCart == null || !guestCart.Items.Any()) return;

        var userCart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

        if (userCart == null)
        {
            guestCart.UserId = userId;
        }
        else
        {
            foreach (var guestItem in guestCart.Items)
            {
                var existingItem = userCart.Items.FirstOrDefault(i => i.ProductVariantId == guestItem.ProductVariantId);
                if (existingItem != null)
                {
                    existingItem.Quantity += guestItem.Quantity;
                }
                else
                {
                    guestItem.CartId = userCart.Id;
                    userCart.Items.Add(guestItem);
                }
            }
            _context.Carts.Remove(guestCart);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private static CartDto MapToDto(Cart cart)
    {
        var dto = new CartDto
        {
            Id = cart.Id,
            Items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductVariant.Product.Name,
                ProductSlug = i.ProductVariant.Product.Slug,
                SKU = i.ProductVariant.SKU,
                Color = i.ProductVariant.Color,
                Size = i.ProductVariant.Size,
                ImageUrl = i.ProductVariant.Product.Images.OrderBy(img => img.DisplayOrder).FirstOrDefault(img => img.IsPrimary)?.Url
                           ?? i.ProductVariant.Product.Images.OrderBy(img => img.DisplayOrder).FirstOrDefault()?.Url,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity
            }).ToList()
        };
        dto.Subtotal = dto.Items.Sum(i => i.LineTotal);
        return dto;
    }
}
