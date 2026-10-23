using FluentAssertions;
using Vini.Domain.Entities;

namespace Vini.UnitTests.Domain;

public class ProductTests
{
    [Fact]
    public void GetEffectivePrice_WithNoSale_ReturnsBasePrice()
    {
        // Arrange
        var product = new Product
        {
            Name = "Basic T-Shirt",
            BasePrice = 350m,
            SalePrice = null
        };

        // Act
        var price = product.GetEffectivePrice();

        // Assert
        price.Should().Be(350m);
    }

    [Fact]
    public void GetEffectivePrice_WithActiveSale_ReturnsSalePrice()
    {
        // Arrange
        var product = new Product
        {
            Name = "Winter Jacket",
            BasePrice = 1200m,
            SalePrice = 900m,
            SalePriceStartDate = DateTime.UtcNow.AddDays(-1),
            SalePriceEndDate = DateTime.UtcNow.AddDays(5)
        };

        // Act
        var price = product.GetEffectivePrice();

        // Assert
        price.Should().Be(900m);
    }

    [Fact]
    public void GetEffectivePrice_WithExpiredSale_ReturnsBasePrice()
    {
        // Arrange
        var product = new Product
        {
            Name = "Summer Shorts",
            BasePrice = 400m,
            SalePrice = 250m,
            SalePriceStartDate = DateTime.UtcNow.AddDays(-10),
            SalePriceEndDate = DateTime.UtcNow.AddDays(-1)
        };

        // Act
        var price = product.GetEffectivePrice();

        // Assert
        price.Should().Be(400m);
    }

    [Fact]
    public void GetEffectivePrice_WithFutureSale_ReturnsBasePrice()
    {
        // Arrange
        var product = new Product
        {
            Name = "Future Collection",
            BasePrice = 500m,
            SalePrice = 300m,
            SalePriceStartDate = DateTime.UtcNow.AddDays(2),
            SalePriceEndDate = DateTime.UtcNow.AddDays(10)
        };

        // Act
        var price = product.GetEffectivePrice();

        // Assert
        price.Should().Be(500m);
    }
}
