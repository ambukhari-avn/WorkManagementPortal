// src/Application/Interfaces/ITaskItemService.cs
using EnterpriseWorkManagementPortal.Application.DTOs;
using EnterpriseWorkManagementPortal.Application.Common;
namespace EnterpriseWorkManagementPortal.Application.Interfaces;

public interface ITaskItemService
{
    Task<TaskItemDto?> GetByIdAsync(int id);
    Task<PagedResult<TaskItemDto>> GetByProjectIdAsync(int projectId, TaskItemQueryParams query);
    Task<PagedResult<TaskItemDto>> GetMyTasksAsync(int userId, string? status, string? priority, int page, int pageSize);
    Task<TaskItemDto> CreateAsync(CreateTaskItemDto dto);
    Task UpdateAsync(int id, UpdateTaskItemDto dto, int? changedByUserId);
    Task DeleteAsync(int id);
}