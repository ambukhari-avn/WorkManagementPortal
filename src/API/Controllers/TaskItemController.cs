// src/API/Controllers/TaskItemsController.cs
using Microsoft.AspNetCore.Mvc;
using EnterpriseWorkManagementPortal.Application.Interfaces;
using EnterpriseWorkManagementPortal.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace EnterpriseWorkManagementPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskItemsController : ControllerBase
{
    private readonly ITaskItemService _taskItemService;
    private readonly IProjectService _projectService;

    public TaskItemsController(ITaskItemService taskItemService, IProjectService projectService)
    {
        _taskItemService = taskItemService;
        _projectService = projectService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _taskItemService.GetByIdAsync(id);
        return task == null ? NotFound() : Ok(task);
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetByProject(int projectId, [FromQuery] TaskItemQueryParams query) =>
        Ok(await _taskItemService.GetByProjectIdAsync(projectId, query));

    [HttpPost]
    public async Task<IActionResult> Create(CreateTaskItemDto dto) =>
        Ok(await _taskItemService.CreateAsync(dto));

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTaskItemDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin)
        {
            var task = await _taskItemService.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Task not found.");
            var members = await _projectService.GetMembersAsync(task.ProjectId);
            if (!members.Any(m => m.UserId == userId))
                return Forbid();
        }

        await _taskItemService.UpdateAsync(id, dto, userId);
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _taskItemService.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine([FromQuery] string? status, [FromQuery] string? priority, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _taskItemService.GetMyTasksAsync(userId, status, priority, page, pageSize));
    }
}