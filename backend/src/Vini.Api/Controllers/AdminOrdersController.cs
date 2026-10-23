using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vini.Application.Interfaces;
using Vini.Domain.Enums;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminOrdersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] string? search,
        [FromQuery] OrderStatus? status,
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Orders.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(o => 
                o.OrderNumber.Contains(search) || 
                o.CustomerName.Contains(search) || 
                o.PrimaryPhone.Contains(search));
        }

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new {
                o.Id,
                o.OrderNumber,
                o.CustomerName,
                o.PrimaryPhone,
                o.Total,
                o.Status,
                o.CreatedAt
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("{orderNumber}")]
    public async Task<IActionResult> GetOrderDetails(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPut("{orderNumber}/status")]
    public async Task<IActionResult> UpdateOrderStatus(string orderNumber, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
        if (order == null) return NotFound();

        // Basic workflow validation
        if (order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Returned)
        {
            return BadRequest("Cannot change status of a completed/cancelled order.");
        }

        order.Status = request.Status;
        
        // Audit log
        _context.OrderStatusHistories.Add(new Domain.Entities.OrderStatusHistory
        {
            OrderId = order.Id,
            Status = request.Status,
            Notes = request.Notes,
            ChangedBy = User.Identity?.Name ?? "Admin"
        });

        // If cancelled, we should theoretically restore inventory.
        // For brevity, we assume the inventory service handles this or it's a manual adjustment for now.

        await _context.SaveChangesAsync();
        return Ok(new { order.OrderNumber, order.Status });
    }
}

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
    public string? Notes { get; set; }
}
