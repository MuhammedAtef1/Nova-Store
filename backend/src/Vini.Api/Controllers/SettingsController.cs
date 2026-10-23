using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vini.Application.Interfaces;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/catalog/settings")]
public class SettingsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SettingsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _context.StoreSettings.ToListAsync();
        return Ok(settings);
    }
}
