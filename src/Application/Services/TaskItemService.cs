// src/Application/Services/TaskItemService.cs
using Microsoft.EntityFrameworkCore;
using EnterpriseWorkManagementPortal.Application.DTOs;
using EnterpriseWorkManagementPortal.Application.Common;
using EnterpriseWorkManagementPortal.Application.Interfaces;
using EnterpriseWorkManagementPortal.Domain.Entities;
using EnterpriseWorkManagementPortal.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace EnterpriseWorkManagementPortal.Application.Services;

public class TaskItemService : ITaskItemService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<TaskItemService> _logger;
    private readonly IAuditLogService _auditLogService;

    public TaskItemService(IApplicationDbContext context, ILogger<TaskItemService> logger, IAuditLogService auditLogService)
    {
        _context = context;
        _logger = logger;
        _auditLogService = auditLogService;
    }

    public async Task<TaskItemDto?> GetByIdAsync(int id)
    {
        var task = await _context.TaskItems
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);
        return task == null ? null : Map(task);
    }

    public async Task<PagedResult<TaskItemDto>> GetByProjectIdAsync(int projectId, TaskItemQueryParams query)
    {
        var tasks = _context.TaskItems.Include(t => t.AssignedTo).Where(t => t.ProjectId == projectId);

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<TaskItemStatus>(query.Status, out var status))
            tasks = tasks.Where(t => t.Status == status);

        if (!string.IsNullOrWhiteSpace(query.Priority) && Enum.TryParse<TaskItemPriority>(query.Priority, out var priority))
            tasks = tasks.Where(t => t.Priority == priority);

        if (!string.IsNullOrWhiteSpace(query.Search))
            tasks = tasks.Where(t => t.Title.Contains(query.Search));

        var totalCount = await tasks.CountAsync();

        var items = await tasks
            .OrderByDescending(t => t.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .AsNoTracking()
            .Select(t => Map(t))
            .ToListAsync();

        return new PagedResult<TaskItemDto>(items, totalCount, query.Page, query.PageSize);
    }

    public async Task<TaskItemDto> CreateAsync(CreateTaskItemDto dto)
    {
        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = Enum.Parse<TaskItemPriority>(dto.Priority),
            ProjectId = dto.ProjectId,
            AssignedToUserId = dto.AssignedToUserId
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();
        _logger.LogInformation("TaskItem {TaskId} created in Project {ProjectId}", task.Id, task.ProjectId);
        await _auditLogService.LogAsync("TaskItem", task.Id, "Create", dto.AssignedToUserId);
        return Map(task);
    }

    public async Task UpdateAsync(int id, UpdateTaskItemDto dto, int? changedByUserId)
    {
        var task = await _context.TaskItems.FindAsync(id)
            ?? throw new KeyNotFoundException($"TaskItem {id} not found.");

        if (dto.Title != null) task.Title = dto.Title;
        if (dto.Description != null) task.Description = dto.Description;
        if (dto.Status != null) task.Status = Enum.Parse<TaskItemStatus>(dto.Status);
        if (dto.Priority != null) task.Priority = Enum.Parse<TaskItemPriority>(dto.Priority);
        if (dto.DueDate.HasValue) task.DueDate = dto.DueDate;

        await _context.SaveChangesAsync();
        _logger.LogInformation("TaskItem {TaskId} updated", id);
        await _auditLogService.LogAsync("TaskItem", id, "Update", changedByUserId);
    }

    public async Task DeleteAsync(int id)
    {
        var task = await _context.TaskItems.FindAsync(id)
            ?? throw new KeyNotFoundException($"TaskItem {id} not found.");
        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();
        _logger.LogWarning("TaskItem {TaskId} deleted", id);
        await _auditLogService.LogAsync("TaskItem", id, "Delete", null);
    }

    public async Task<PagedResult<TaskItemDto>> GetMyTasksAsync(int userId, string? status, string? priority, int page, int pageSize)
    {
        var query = _context.TaskItems.Where(t => t.AssignedToUserId == userId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status.ToString() == status);
        if (!string.IsNullOrEmpty(priority))
            query = query.Where(t => t.Priority.ToString() == priority);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.DueDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TaskItemDto(t.Id, t.Title, t.Description, t.Status.ToString(), t.Priority.ToString(), t.DueDate, t.ProjectId, t.AssignedTo!.FullName))
            .AsNoTracking()
            .ToListAsync();

        return new PagedResult<TaskItemDto>(items, totalCount, page, pageSize);
    }

    private static TaskItemDto Map(TaskItem t) => new(
        t.Id, t.Title, t.Description, t.Status.ToString(), t.Priority.ToString(),
        t.DueDate, t.ProjectId, t.AssignedTo?.FullName);
}