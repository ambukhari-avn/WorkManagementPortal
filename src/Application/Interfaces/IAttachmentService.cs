// src/Application/Interfaces/IAttachmentService.cs
using EnterpriseWorkManagementPortal.Application.DTOs;

namespace EnterpriseWorkManagementPortal.Application.Interfaces;

public interface IAttachmentService
{
    Task<List<AttachmentDto>> GetByTaskItemIdAsync(int taskItemId);
    Task<AttachmentDto> UploadAsync(int taskItemId, Stream fileStream, string fileName, int uploadedByUserId);
    Task DeleteAsync(int id);
    Task<(Stream Stream, string FileName, string ContentType)> DownloadAsync(int attachmentId);
}