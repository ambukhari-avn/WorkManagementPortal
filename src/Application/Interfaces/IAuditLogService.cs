// src/Application/Interfaces/IAuditLogService.cs
using EnterpriseWorkManagementPortal.Application.DTOs;

namespace EnterpriseWorkManagementPortal.Application.Interfaces;

public interface IAuditLogService
{
    Task<List<AuditLogDto>> GetByEntityAsync(string entityName, int entityId);
    Task LogAsync(string entityName, int entityId, string action, int? changedByUserId);
}