using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Vini.Application.Interfaces;

namespace Vini.Infrastructure.Services;

/// <summary>
/// Stores images on the local filesystem under wwwroot/uploads/images.
/// Replace with a cloud provider (Azure Blob, S3, Cloudinary) for production.
/// Configure VINI_IMAGE_STORAGE_PATH environment variable to override the path.
/// </summary>
public class LocalImageStorageService : IImageStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;

    private static readonly HashSet<string> _allowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    public LocalImageStorageService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
    {
        _basePath = configuration["ImageStorage:LocalPath"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "images");

        _baseUrl = configuration["ImageStorage:BaseUrl"] ?? "/uploads/images";

        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> UploadAsync(
        Stream imageStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        if (!_allowedContentTypes.Contains(contentType))
            throw new InvalidOperationException($"File type '{contentType}' is not allowed. Use JPEG, PNG, WebP, or GIF.");

        if (imageStream.Length > MaxFileSizeBytes)
            throw new InvalidOperationException("Image file exceeds the maximum allowed size of 5 MB.");

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension)) extension = ".jpg";

        var uniqueName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(_basePath, uniqueName);

        await using var fileStream = File.Create(fullPath);
        await imageStream.CopyToAsync(fileStream, cancellationToken);

        return $"{_baseUrl}/{uniqueName}";
    }

    public Task DeleteAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(imageUrl)) return Task.CompletedTask;

        var fileName = Path.GetFileName(imageUrl);
        var fullPath = Path.Combine(_basePath, fileName);

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}
