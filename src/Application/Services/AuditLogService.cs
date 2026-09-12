// src/Application/Services/AuditLogService.cs
using Microsoft.EntityFrameworkCore;
using EnterpriseWorkManagementPortal.Application.DTOs;
using EnterpriseWorkManagementPortal.Application.Interfaces;
using EnterpriseWorkManagementPortal.Domain.Entities;

namespace EnterpriseWorkManagementPortal.Application.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IApplicationDbContext _context;
    public AuditLogService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLogDto>> GetByEntityAsync(string entityName, int entityId) =>
        (await _context.AuditLogs
            .Include(a => a.ChangedBy)
            .Where(a => a.EntityName == entityName && a.EntityId == entityId)
            .OrderBy(a => a.ChangedAt)
            .AsNoTracking()
            .ToListAsync())
            .Select(a => new AuditLogDto(a.Id, a.EntityName, a.EntityId, a.Action, a.ChangedBy?.FullName ?? "System", a.ChangedAt))
            .ToList();

    public async Task LogAsync(string entityName, int entityId, string action, int? changedByUserId)
    {
        _context.AuditLogs.Add(new AuditLog
        {
            EntityName = entityName,
            EntityId = entityId,
            Action = action,
            ChangedByUserId = changedByUserId,
            ChangedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }
}