namespace Vini.Application.Interfaces;

public interface IImageStorageService
{
    Task<string> UploadAsync(Stream imageStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task DeleteAsync(string imageUrl, CancellationToken cancellationToken = default);
}
