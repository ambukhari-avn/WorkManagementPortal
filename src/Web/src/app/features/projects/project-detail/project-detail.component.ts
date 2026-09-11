// src/Web/src/app/features/projects/project-detail/project-detail.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { UserService } from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Project, ProjectMember } from '../../../shared/models/project.model';
import { User } from '../../../shared/models/user.model';

@Component({
    selector: 'app-project-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './project-detail.component.html',
    styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
    private projectService = inject(ProjectService);
    private userService = inject(UserService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    authService = inject(AuthService);

    project = signal<Project | null>(null);
    members = signal<ProjectMember[]>([]);
    allUsers = signal<User[]>([]);
    loading = signal(true);
    selectedUserId = '';

    // Users not already on the project — what the dropdown should actually show
    availableUsers = computed(() => {
        const memberIds = new Set(this.members().map(m => m.userId));
        return this.allUsers().filter(u => !memberIds.has(u.id));
    });

    canEdit = computed(() => {
        const userId = Number(this.authService.currentUser()?.sub);
        const isMember = this.members().some(m => m.userId === userId);
        return isMember || this.authService.isAdmin();
    });

    projectId!: number;

    ngOnInit(): void {
        this.projectId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadProject();
        this.loadMembers();
        this.loadUsers();
    }

    loadProject(): void {
        this.projectService.getById(this.projectId).subscribe({
            next: p => { this.project.set(p); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    loadMembers(): void {
        this.projectService.getMembers(this.projectId).subscribe(members => this.members.set(members));
    }

    loadUsers(): void {
        this.userService.getAll().subscribe(users => this.allUsers.set(users));
    }

    addMember(): void {
        const userId = Number(this.selectedUserId);
        if (!userId) return;
        this.projectService.addMember(this.projectId, userId).subscribe(() => {
            this.selectedUserId = '';
            this.loadMembers();
        });
    }

    removeMember(userId: number): void {
        this.projectService.removeMember(this.projectId, userId).subscribe(() => this.loadMembers());
    }

    goToTasks(): void {
        this.router.navigate(['/projects', this.projectId, 'tasks']);
    }

    initials(title: string): string {
        return title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    }

    deleteProject(): void {
        if (!confirm(`Delete "${this.project()?.title}"? This cannot be undone.`)) return;

        this.projectService.delete(this.projectId).subscribe({
            next: () => this.router.navigate(['/projects']),
            error: () => alert('Failed to delete project.')
        });
    }
}