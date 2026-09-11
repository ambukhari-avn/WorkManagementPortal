// src/API/Controllers/AttachmentsController.cs
using Microsoft.AspNetCore.Mvc;
using EnterpriseWorkManagementPortal.Application.Interfaces;

namespace EnterpriseWorkManagementPortal.API.Controllers;

[ApiController]
[Route("api")]
public class AttachmentsController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;
    public AttachmentsController(IAttachmentService attachmentService) => _attachmentService = attachmentService;

    [HttpGet("taskitems/{taskItemId}/attachments")]
    public async Task<IActionResult> GetByTask(int taskItemId) => Ok(await _attachmentService.GetByTaskItemIdAsync(taskItemId));

    [HttpPost("taskitems/{taskItemId}/attachments")]
    public async Task<IActionResult> Upload(int taskItemId, IFormFile file, [FromQuery] int uploadedByUserId)
    {
        if (file.Length == 0) return BadRequest("Empty file.");
        await using var stream = file.OpenReadStream();
        var result = await _attachmentService.UploadAsync(taskItemId, stream, file.FileName, uploadedByUserId);
        return Ok(result);
    }

    [HttpDelete("attachments/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _attachmentService.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("attachments/{id}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var (stream, fileName, contentType) = await _attachmentService.DownloadAsync(id);
        return File(stream, contentType, fileName);
    }
}