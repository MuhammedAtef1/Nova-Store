using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Vini.Application.DTOs;
using Vini.Application.Services;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private const string SessionCookieName = "vini_cart_session";

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private string GetOrCreateSessionId()
    {
        if (Request.Cookies.TryGetValue(SessionCookieName, out var sessionId) && !string.IsNullOrEmpty(sessionId))
        {
            return sessionId;
        }

        sessionId = Guid.NewGuid().ToString();
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Ensure HTTPS in production
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(30)
        };
        Response.Cookies.Append(SessionCookieName, sessionId, cookieOptions);

        return sessionId;
    }

    private string? GetUserId()
    {
        return User.Identity?.IsAuthenticated == true
            ? User.FindFirstValue(ClaimTypes.NameIdentifier)
            : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        var sessionId = GetOrCreateSessionId();
        var userId = GetUserId();

        var result = await _cartService.GetCartAsync(sessionId, userId, cancellationToken);
        
        if (result.IsSuccess)
            return Ok(result.Value);
            
        return BadRequest(new { message = result.Error });
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request, CancellationToken cancellationToken)
    {
        var sessionId = GetOrCreateSessionId();
        var userId = GetUserId();

        var result = await _cartService.AddToCartAsync(sessionId, userId, request, cancellationToken);

        if (result.IsSuccess)
            return Ok(result.Value);

        return BadRequest(new { message = result.Error });
    }

    [HttpPut("items/{cartItemId:guid}")]
    public async Task<IActionResult> UpdateCartItem(Guid cartItemId, [FromBody] UpdateCartItemRequest request, CancellationToken cancellationToken)
    {
        var sessionId = GetOrCreateSessionId();
        var userId = GetUserId();

        var result = await _cartService.UpdateCartItemAsync(sessionId, userId, cartItemId, request.Quantity, cancellationToken);

        if (result.IsSuccess)
            return Ok(result.Value);

        return BadRequest(new { message = result.Error });
    }

    [HttpDelete("items/{cartItemId:guid}")]
    public async Task<IActionResult> RemoveFromCart(Guid cartItemId, CancellationToken cancellationToken)
    {
        var sessionId = GetOrCreateSessionId();
        var userId = GetUserId();

        var result = await _cartService.RemoveFromCartAsync(sessionId, userId, cartItemId, cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return BadRequest(new { message = result.Error });
    }
}
