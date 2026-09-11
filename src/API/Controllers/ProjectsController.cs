// src/API/Controllers/ProjectsController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using EnterpriseWorkManagementPortal.Application.Interfaces;
using EnterpriseWorkManagementPortal.Application.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace EnterpriseWorkManagementPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    public ProjectsController(IProjectService projectService) => _projectService = projectService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProjectQueryParams query) => Ok(await _projectService.GetAllAsync(query));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _projectService.GetByIdAsync(id);
        return project == null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProjectDto dto) => Ok(await _projectService.CreateAsync(dto));

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProjectDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin)
        {
            var members = await _projectService.GetMembersAsync(id);
            if (!members.Any(m => m.UserId == userId))
                return Forbid();
        }

        await _projectService.UpdateAsync(id, dto);
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _projectService.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetMembers(int id) => Ok(await _projectService.GetMembersAsync(id));

    [HttpPost("{id}/members/{userId}")]
    public async Task<IActionResult> AddMember(int id, int userId)
    {
        await _projectService.AddMemberAsync(id, userId);
        return NoContent();
    }

    [HttpDelete("{id}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(int id, int userId)
    {
        await _projectService.RemoveMemberAsync(id, userId);
        return NoContent();
    }
}