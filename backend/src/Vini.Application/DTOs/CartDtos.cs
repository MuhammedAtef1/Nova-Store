namespace Vini.Application.DTOs;

public class CartDto
{
    public Guid Id { get; set; }
    public decimal Subtotal { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
}

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal => UnitPrice * Quantity;
}

public class AddToCartRequest
{
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}
