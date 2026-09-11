// src/Application/Interfaces/IFileStorageService.cs
namespace EnterpriseWorkManagementPortal.Application.Interfaces;
public interface IFileStorageService
{
    Task<(string FilePath, long FileSizeBytes)> SaveFileAsync(Stream fileStream, string fileName);
    Task DeleteFileAsync(string filePath);
    Task<Stream> GetFileStreamAsync(string filePath);
}