// src/API/Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using EnterpriseWorkManagementPortal.Application.Interfaces;
using EnterpriseWorkManagementPortal.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
namespace EnterpriseWorkManagementPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    public UsersController(IUserService userService) => _userService = userService;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _userService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto) => Ok(await _userService.CreateAsync(dto));

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        await _userService.UpdateAsync(id, dto);
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, UpdateUserRoleDto dto)
    {
        await _userService.UpdateRoleAsync(id, dto.Role);
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _userService.DeleteAsync(id);
        return NoContent();
    }
}