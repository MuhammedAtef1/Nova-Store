using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vini.Application.Interfaces;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
    {
        var totalOrders = await _context.Orders.CountAsync(cancellationToken);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == Vini.Domain.Enums.OrderStatus.OrderCreated, cancellationToken);
        var totalProducts = await _context.Products.CountAsync(p => !p.IsDeleted, cancellationToken);
        var totalRevenue = await _context.Orders
            .Where(o => o.Status != Vini.Domain.Enums.OrderStatus.Cancelled)
            .SumAsync(o => o.Subtotal, cancellationToken);

        return Ok(new
        {
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            TotalProducts = totalProducts,
            TotalRevenue = totalRevenue
        });
    }
}
