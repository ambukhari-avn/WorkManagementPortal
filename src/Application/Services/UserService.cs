// src/Application/Services/UserService.cs
using Microsoft.EntityFrameworkCore;
using EnterpriseWorkManagementPortal.Application.DTOs;
using EnterpriseWorkManagementPortal.Application.Interfaces;
using EnterpriseWorkManagementPortal.Domain.Entities;
using EnterpriseWorkManagementPortal.Domain.Enums;

namespace EnterpriseWorkManagementPortal.Application.Services;

public class UserService : IUserService
{
    private readonly IApplicationDbContext _context;
    public UserService(IApplicationDbContext context) => _context = context;

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        return user == null ? null : Map(user);
    }

    public async Task<List<UserDto>> GetAllAsync() =>
        (await _context.Users.AsNoTracking().ToListAsync()).Select(Map).ToList();

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),   // Day 10 territory — placeholder for now
            FullName = dto.FullName
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Map(user);
    }

    public async Task UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id) ?? throw new KeyNotFoundException($"User {id} not found.");
        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Role != null) user.Role = Enum.Parse<UserRole>(dto.Role);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateRoleAsync(int userId, string role)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (!Enum.TryParse<UserRole>(role, out var parsedRole))
            throw new ArgumentException("Invalid role.");

        user.Role = parsedRole;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }

    private static UserDto Map(User u) => new(u.Id, u.Email, u.FullName, u.Role.ToString(), u.CreatedAt);
}