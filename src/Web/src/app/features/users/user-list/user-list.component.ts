// src/Web/src/app/features/users/user-list/user-list.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  users = signal<User[]>([]);
  loading = signal(true);
  errorMessage = '';

  currentUserId = Number(this.authService.currentUser()?.sub);

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: users => { this.users.set(users); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleRole(user: User): void {
    const newRole = user.role === 'Admin' ? 'Member' : 'Admin';
    this.userService.updateRole(user.id, newRole).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage = 'Failed to update role.'
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete ${user.fullName}? This cannot be undone.`)) return;

    this.userService.delete(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage = 'Failed to delete user — they may have existing projects, tasks, or comments.'
    });
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}