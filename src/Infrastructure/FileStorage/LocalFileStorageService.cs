// src/Infrastructure/FileStorage/LocalFileStorageService.cs
using EnterpriseWorkManagementPortal.Application.Interfaces;
namespace EnterpriseWorkManagementPortal.Infrastructure.FileStorage;
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _storageRoot;
    public LocalFileStorageService(string storageRoot)
    {
        _storageRoot = storageRoot;
        Directory.CreateDirectory(_storageRoot);
    }
    public async Task<(string FilePath, long FileSizeBytes)> SaveFileAsync(Stream fileStream, string fileName)
    {
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var fullPath = Path.Combine(_storageRoot, uniqueFileName);
        await using var output = File.Create(fullPath);
        await fileStream.CopyToAsync(output);
        return (fullPath, output.Length);
    }
    public Task DeleteFileAsync(string filePath)
    {
        if (File.Exists(filePath)) File.Delete(filePath);
        return Task.CompletedTask;
    }

    public Task<Stream> GetFileStreamAsync(string filePath)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException("File not found on disk.", filePath);

        Stream stream = File.OpenRead(filePath);
        return Task.FromResult(stream);
    }
}