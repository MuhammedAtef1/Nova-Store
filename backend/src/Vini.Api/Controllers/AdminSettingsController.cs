using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vini.Application.Interfaces;
using Vini.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Vini.Api.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IImageStorageService _imageStorage;

    public AdminSettingsController(IApplicationDbContext context, IImageStorageService imageStorage)
    {
        _context = context;
        _imageStorage = imageStorage;
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
        var url = await _imageStorage.UploadAsync(file.OpenReadStream(), file.FileName, file.ContentType);
        return Ok(new { url });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSettings()
    {
        var settings = await _context.StoreSettings
            .OrderBy(s => s.Group)
            .ThenBy(s => s.Key)
            .ToListAsync();
            
        return Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> BulkUpdateSettings([FromBody] List<UpdateSettingDto> requests)
    {
        foreach (var req in requests)
        {
            var setting = await _context.StoreSettings.FirstOrDefaultAsync(s => s.Key == req.Key);
            if (setting != null)
            {
                setting.Value = req.Value;
            }
            else
            {
                _context.StoreSettings.Add(new StoreSettings
                {
                    Key = req.Key,
                    Value = req.Value,
                    Group = req.Group ?? "General"
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Settings updated successfully" });
    }
}

public class UpdateSettingDto
{
    [Required] public string Key { get; set; } = string.Empty;
    [Required] public string Value { get; set; } = string.Empty;
    public string? Group { get; set; }
}
