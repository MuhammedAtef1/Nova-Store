using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Vini.Application.DTOs;
using Vini.Application.Services;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private string? GetSessionId()
    {
        if (Request.Cookies.TryGetValue("vini_cart_session", out var sessionId))
            return sessionId;
        return null;
    }

    private string? GetUserId()
    {
        return User.Identity?.IsAuthenticated == true
            ? User.FindFirstValue(ClaimTypes.NameIdentifier)
            : null;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request, CancellationToken cancellationToken)
    {
        var sessionId = GetSessionId();
        var userId = GetUserId();

        if (string.IsNullOrEmpty(sessionId) && string.IsNullOrEmpty(userId))
            return BadRequest(new { message = "No active cart session found." });

        var result = await _orderService.CreateOrderAsync(sessionId!, userId, request, cancellationToken);

        if (result.IsSuccess)
            return Ok(result.Value);

        return BadRequest(new { message = result.Error });
    }

    [HttpGet("{orderNumber}")]
    public async Task<IActionResult> GetOrder(string orderNumber, CancellationToken cancellationToken)
    {
        var result = await _orderService.GetOrderByNumberAsync(orderNumber, cancellationToken);

        if (result.IsSuccess)
            return Ok(result.Value);

        return NotFound(new { message = result.Error });
    }
}
