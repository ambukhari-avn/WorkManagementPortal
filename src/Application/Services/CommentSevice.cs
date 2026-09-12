// src/Application/Services/CommentService.cs
using Microsoft.EntityFrameworkCore;
using EnterpriseWorkManagementPortal.Application.DTOs;
using EnterpriseWorkManagementPortal.Application.Interfaces;
using EnterpriseWorkManagementPortal.Domain.Entities;

namespace EnterpriseWorkManagementPortal.Application.Services;

public class CommentService : ICommentService
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public CommentService(IApplicationDbContext context, IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    public async Task<List<CommentDto>> GetByTaskItemIdAsync(int taskItemId) =>
        (await _context.Comments.Include(c => c.Author)
            .Where(c => c.TaskItemId == taskItemId).AsNoTracking().ToListAsync())
            .Select(Map).ToList();

    public async Task<CommentDto> CreateAsync(CreateCommentDto dto)
    {
        var comment = new Comment { Content = dto.Content, TaskItemId = dto.TaskItemId, AuthorUserId = dto.AuthorUserId };
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        await _context.Entry(comment).Reference(c => c.Author).LoadAsync();
        await _auditLogService.LogAsync("Comment", comment.Id, "Create", dto.AuthorUserId);
        return Map(comment);
    }

    public async Task DeleteAsync(int id)
    {
        var comment = await _context.Comments.FindAsync(id) ?? throw new KeyNotFoundException($"Comment {id} not found.");
        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync("Comment", id, "Delete", null);
    }

    private static CommentDto Map(Comment c) => new(c.Id, c.Content, c.Author?.FullName ?? "", c.CreatedAt);
}