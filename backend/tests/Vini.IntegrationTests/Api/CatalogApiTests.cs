using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Vini.Application.DTOs;
using System.Net.Http.Json;

namespace Vini.IntegrationTests.Api;

public class CatalogApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public CatalogApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetProducts_ReturnsPaginatedList()
    {
        // Act
        var response = await _client.GetAsync("/api/catalog/products");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<PaginatedResult<ProductSummaryDto>>();
        
        result.Should().NotBeNull();
        result!.Items.Should().NotBeNull();
    }

    [Fact]
    public async Task GetCategories_ReturnsList()
    {
        // Act
        var response = await _client.GetAsync("/api/catalog/categories");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<List<CategoryDto>>();
        
        result.Should().NotBeNull();
    }
}

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }
}
