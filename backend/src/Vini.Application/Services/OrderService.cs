using Microsoft.EntityFrameworkCore;
using Vini.Application.Common;
using Vini.Application.DTOs;
using Vini.Application.Interfaces;
using Vini.Domain.Entities;
using Vini.Domain.Enums;

namespace Vini.Application.Services;

public interface IOrderService
{
    Task<Result<OrderDto>> CreateOrderAsync(string sessionId, string? userId, CheckoutRequest request, CancellationToken cancellationToken = default);
    Task<Result<OrderDto>> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
}

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;
    private readonly IOrderNumberGenerator _orderNumberGenerator;
    private readonly IShippingCalculator _shippingCalculator;

    public OrderService(
        IApplicationDbContext context,
        IOrderNumberGenerator orderNumberGenerator,
        IShippingCalculator shippingCalculator)
    {
        _context = context;
        _orderNumberGenerator = orderNumberGenerator;
        _shippingCalculator = shippingCalculator;
    }

    public async Task<Result<OrderDto>> CreateOrderAsync(string sessionId, string? userId, CheckoutRequest request, CancellationToken cancellationToken = default)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.ProductVariant)
            .ThenInclude(v => v.Product)
            .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => 
                (!string.IsNullOrEmpty(userId) && c.UserId == userId) || 
                (string.IsNullOrEmpty(userId) && c.SessionId == sessionId), 
                cancellationToken);

        if (cart == null || !cart.Items.Any())
            return Result<OrderDto>.Failure("Cart is empty.");

        // Begin Transaction to safely check stock and create order
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var order = new Order
            {
                OrderNumber = _orderNumberGenerator.Generate(),
                UserId = userId,
                CustomerName = request.CustomerName,
                PrimaryPhone = request.PrimaryPhone,
                SecondaryPhone = request.SecondaryPhone,
                CustomerEmail = request.CustomerEmail,
                Governorate = request.Governorate,
                City = request.City,
                AddressLine = request.AddressLine,
                DeliveryNotes = request.DeliveryNotes,
                Status = OrderStatus.OrderCreated,
                PaymentMethod = PaymentMethod.CashOnDelivery,
                PaymentStatus = PaymentStatus.PendingCollection
            };

            foreach (var cartItem in cart.Items)
            {
                var variant = cartItem.ProductVariant;

                if (variant.AvailableStock < cartItem.Quantity)
                    return Result<OrderDto>.Failure($"Insufficient stock for {variant.Product.Name} ({variant.Size}/{variant.Color}).");

                // Deduct stock
                variant.StockQuantity -= cartItem.Quantity;

                var orderItem = new OrderItem
                {
                    ProductVariantId = variant.Id,
                    ProductName = variant.Product.Name,
                    SKU = variant.SKU,
                    Color = variant.Color,
                    Size = variant.Size,
                    ProductImageUrl = variant.Product.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault(i => i.IsPrimary)?.Url 
                                      ?? variant.Product.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault()?.Url,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.UnitPrice,
                    LineTotal = cartItem.UnitPrice * cartItem.Quantity
                };

                order.Items.Add(orderItem);
            }

            order.Subtotal = order.Items.Sum(i => i.LineTotal);
            order.ShippingFee = await _shippingCalculator.CalculateAsync(order.Governorate, order.Subtotal, cancellationToken);
            order.Total = order.Subtotal + order.ShippingFee;

            _context.Orders.Add(order);
            
            // Clear cart
            _context.Carts.Remove(cart);

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Result<OrderDto>.Success(MapToDto(order));
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result<OrderDto>.Failure("Stock was updated by another user. Please try again.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Result<OrderDto>> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, cancellationToken);

        if (order == null)
            return Result<OrderDto>.Failure("Order not found.");

        return Result<OrderDto>.Success(MapToDto(order));
    }

    private static OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerName = order.CustomerName,
            Subtotal = order.Subtotal,
            ShippingFee = order.ShippingFee,
            Total = order.Total,
            Status = order.Status.ToString(),
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductName = i.ProductName,
                SKU = i.SKU,
                Color = i.Color,
                Size = i.Size,
                ProductImageUrl = i.ProductImageUrl,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }
}
