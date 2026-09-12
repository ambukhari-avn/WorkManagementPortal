// src/Application/Services/ProjectService.cs
using Microsoft.EntityFrameworkCore;
using EnterpriseWorkManagementPortal.Application.DTOs;
using EnterpriseWorkManagementPortal.Application.Common;
using EnterpriseWorkManagementPortal.Application.Interfaces;
using EnterpriseWorkManagementPortal.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EnterpriseWorkManagementPortal.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ProjectService> _logger;
    private readonly IAuditLogService _auditLogService;
    public ProjectService(IApplicationDbContext context, ILogger<ProjectService> logger, IAuditLogService auditLogService)
    {
        _context = context;
        _logger = logger;
        _auditLogService = auditLogService;
    }

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        var project = await _context.Projects.Include(p => p.CreatedBy).FirstOrDefaultAsync(p => p.Id == id);
        return project == null ? null : Map(project);
    }

    public async Task<PagedResult<ProjectDto>> GetAllAsync(ProjectQueryParams query)
    {
        var projects = _context.Projects.Include(p => p.CreatedBy).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            projects = projects.Where(p => p.Title.Contains(query.Search));

        if (query.IsArchived.HasValue)
            projects = projects.Where(p => p.IsArchived == query.IsArchived.Value);

        var totalCount = await projects.CountAsync();

        var items = await projects
            .OrderByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .AsNoTracking()
            .Select(p => Map(p))
            .ToListAsync();

        return new PagedResult<ProjectDto>(items, totalCount, query.Page, query.PageSize);
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectDto dto)
    {
        var project = new Project { Title = dto.Title, Description = dto.Description, CreatedByUserId = dto.CreatedByUserId };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        await _context.Entry(project).Reference(p => p.CreatedBy).LoadAsync();
        _logger.LogInformation("Project {ProjectId} created by User {UserId}", project.Id, dto.CreatedByUserId);
        await _auditLogService.LogAsync("Project", project.Id, "Create", dto.CreatedByUserId);
        return Map(project);
    }

    public async Task UpdateAsync(int id, UpdateProjectDto dto)
    {
        var project = await _context.Projects.FindAsync(id) ?? throw new KeyNotFoundException($"Project {id} not found.");
        if (dto.Title != null) project.Title = dto.Title;
        if (dto.Description != null) project.Description = dto.Description;
        if (dto.IsArchived.HasValue) project.IsArchived = dto.IsArchived.Value;
        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync("Project", id, "Update", null);
    }

    public async Task DeleteAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id) ?? throw new KeyNotFoundException($"Project {id} not found.");
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        _logger.LogWarning("Project {ProjectId} deleted", id);
        await _auditLogService.LogAsync("Project", id, "Delete", null);
    }

    private static ProjectDto Map(Project p) => new(p.Id, p.Title, p.Description, p.IsArchived, p.CreatedBy?.FullName ?? "", p.CreatedAt);

    public async Task<List<ProjectMemberDto>> GetMembersAsync(int projectId) =>
        (await _context.ProjectMembers
            .Include(pm => pm.User)
            .Where(pm => pm.ProjectId == projectId)
            .AsNoTracking()
            .ToListAsync())
            .Select(pm => new ProjectMemberDto(pm.User.Id, pm.User.FullName, pm.User.Email))
            .ToList();

    public async Task AddMemberAsync(int projectId, int userId)
    {
        var exists = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (exists) return;   // idempotent — adding an existing member is a no-op, not an error

        _context.ProjectMembers.Add(new ProjectMember { ProjectId = projectId, UserId = userId });
        await _context.SaveChangesAsync();
    }

    public async Task RemoveMemberAsync(int projectId, int userId)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId)
            ?? throw new KeyNotFoundException("Membership not found.");

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();
    }
}